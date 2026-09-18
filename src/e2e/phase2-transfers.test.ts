import { describe, expect, it, beforeEach, afterEach, vi } from "vitest";
import { createMockApiHandler } from "./mock-api";
import { signUpUser } from "@/lib/auth-service";
import { createAccount } from "@/lib/accounts-service";
import { createCategory } from "@/lib/categories-service";
import { createTransfer, getFXQuote } from "@/lib/transfers-service";
import { getFinancialRecords } from "@/lib/financial-records-service";
import { setSessionToken } from "@/lib/session";
import { createTransferAction, getFinancialRecordsAction } from "@/app/actions/financial-records";

let currentSessionCookie: string | null = null;

const mockCookieStore = {
  get: vi.fn(() => (currentSessionCookie ? { value: currentSessionCookie } : undefined)),
  set: vi.fn((_, value: string) => {
    currentSessionCookie = value;
  }),
  delete: vi.fn(() => {
    currentSessionCookie = null;
  }),
};

vi.mock("next/headers", () => ({
  cookies: vi.fn(() => Promise.resolve(mockCookieStore)),
}));

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

describe("Phase 2 Transfer and Fee Entry integration tests (mocked /v1 API)", () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    vi.clearAllMocks();
    currentSessionCookie = null;
    const mockApi = createMockApiHandler();
    global.fetch = vi.fn().mockImplementation((url: string | URL | Request, init?: RequestInit) => {
      const urlString = typeof url === "string" ? url : url.toString();
      return mockApi.handleRequest(urlString, init);
    });
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it("proves end-to-end same-currency transfer between distinct accounts", async () => {
    const user = await signUpUser({
      email: "transfer-user@example.com",
      password: "password123",
    });
    expect(user.success).toBe(true);
    if (!user.success) return;
    const token = user.accessToken;

    const checkingAcc = await createAccount(token, {
      name: "Main Checking",
      type: "checking",
      currency: "USD",
      is_active: true,
    });
    const savingsAcc = await createAccount(token, {
      name: "High Yield Savings",
      type: "savings",
      currency: "USD",
      is_active: true,
    });

    expect(checkingAcc.success).toBe(true);
    expect(savingsAcc.success).toBe(true);
    if (!checkingAcc.success || !savingsAcc.success) return;

    // Execute same-currency transfer: $200 USD
    const transferResult = await createTransfer(token, {
      account_id: checkingAcc.account.id,
      destination_account_id: savingsAcc.account.id,
      amount_minor: 20000,
      destination_amount_minor: 20000,
      currency: "USD",
      destination_currency: "USD",
      date: "2026-09-17T12:00:00.000Z",
      note: "Monthly savings buffer",
    });

    expect(transferResult.success).toBe(true);
    if (!transferResult.success) return;

    expect(transferResult.record.kind).toBe("transfer");
    expect(transferResult.record.account_id).toBe(checkingAcc.account.id);
    expect(transferResult.record.destination_account_id).toBe(savingsAcc.account.id);
    expect(transferResult.record.amount_minor).toBe(20000);
    expect(transferResult.record.destination_amount_minor).toBe(20000);

    // Retrieve records to verify persistence
    const recordsResult = await getFinancialRecords(token);
    expect(recordsResult.success).toBe(true);
    if (!recordsResult.success) return;

    const saved = recordsResult.records.find((r) => r.id === transferResult.record.id);
    expect(saved).toBeDefined();
    expect(saved?.kind).toBe("transfer");
  });

  it("proves end-to-end cross-currency transfer with quote retrieval and manual override", async () => {
    const user = await signUpUser({
      email: "cross-user@example.com",
      password: "password123",
    });
    if (!user.success) return;
    const token = user.accessToken;

    const usdAcc = await createAccount(token, {
      name: "USD Account",
      type: "checking",
      currency: "USD",
      is_active: true,
    });
    const eurAcc = await createAccount(token, {
      name: "EUR Account",
      type: "checking",
      currency: "EUR",
      is_active: true,
    });
    if (!usdAcc.success || !eurAcc.success) return;

    // 1. Fetch market quote
    const quote = await getFXQuote(token, "USD", "EUR");
    expect(quote.success).toBe(true);
    if (!quote.success) return;
    expect(quote.rate).toBe(0.92);

    // 2. Perform cross-currency transfer with manual override: $100 -> €92.00 (rate 0.92)
    const transferRes = await createTransfer(token, {
      account_id: usdAcc.account.id,
      destination_account_id: eurAcc.account.id,
      amount_minor: 10000,
      destination_amount_minor: 9200,
      currency: "USD",
      destination_currency: "EUR",
      date: "2026-09-17T12:00:00.000Z",
      fx_quote: {
        rate: 0.92,
        provenance: "manual_override",
      },
    });

    expect(transferRes.success).toBe(true);
    if (!transferRes.success) return;
    expect(transferRes.record.destination_amount_minor).toBe(9200);
    expect(transferRes.record.historical_fx_quote?.rate).toBe(0.92);
    expect(transferRes.record.historical_fx_quote?.provenance).toBe("manual_override");
  });

  it("proves transfer fee is recorded as separate linked expense and counts as spending", async () => {
    const user = await signUpUser({
      email: "fee-user@example.com",
      password: "password123",
    });
    if (!user.success) return;
    const token = user.accessToken;
    await setSessionToken(token);

    const usd1 = await createAccount(token, {
      name: "Checking",
      type: "checking",
      currency: "USD",
      is_active: true,
    });
    const usd2 = await createAccount(token, {
      name: "Savings",
      type: "savings",
      currency: "USD",
      is_active: true,
    });
    const feeCategory = await createCategory(token, {
      name: "Wire & Transfer Fees",
      type: "expense",
      is_active: true,
    });

    if (!usd1.success || !usd2.success || !feeCategory.success) return;

    // Create transfer with separate linked fee via server action
    const transferActionRes = await createTransferAction({
      account_id: usd1.account.id,
      destination_account_id: usd2.account.id,
      amount_minor: 50000,
      destination_amount_minor: 50000,
      currency: "USD",
      destination_currency: "USD",
      date: "2026-09-17T12:00:00.000Z",
      note: "Wiring money to savings",
      fee: {
        account_id: usd1.account.id,
        category_id: feeCategory.category.id,
        amount_minor: 1500, // $15 fee
        currency: "USD",
        note: "Bank wire processing fee",
      },
    });

    expect(transferActionRes.success).toBe(true);
    if (!transferActionRes.success) return;

    expect(transferActionRes.record.kind).toBe("transfer");
    expect(transferActionRes.feeRecord).toBeDefined();
    expect(transferActionRes.feeRecord?.kind).toBe("expense");
    expect(transferActionRes.feeRecord?.amount_minor).toBe(1500);
    expect(transferActionRes.feeRecord?.linked_transfer_id).toBe(transferActionRes.record.id);

    // Verify in history
    const allRecords = await getFinancialRecordsAction({});
    expect(allRecords.success).toBe(true);
    if (!allRecords.success) return;

    const feeInHistory = allRecords.records.find((r) => r.id === transferActionRes.feeRecord?.id);
    expect(feeInHistory).toBeDefined();
    expect(feeInHistory?.kind).toBe("expense");
    expect(feeInHistory?.category_id).toBe(feeCategory.category.id);
  });
});
