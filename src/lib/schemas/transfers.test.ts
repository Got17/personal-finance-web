import { describe, it, expect } from "vitest";
import { createTransferSchema } from "./transfers";

describe("createTransferSchema", () => {
  const baseValidSameCurrency = {
    account_id: "acc-1",
    destination_account_id: "acc-2",
    amount_minor: 5000,
    destination_amount_minor: 5000,
    currency: "USD",
    destination_currency: "USD",
    date: "2026-09-17T12:00:00.000Z",
    note: "Transfer to savings",
  };

  it("validates valid same-currency transfer", () => {
    const result = createTransferSchema.safeParse(baseValidSameCurrency);
    expect(result.success).toBe(true);
  });

  it("fails if source and destination accounts are identical", () => {
    const result = createTransferSchema.safeParse({
      ...baseValidSameCurrency,
      destination_account_id: "acc-1",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toContain(
        "Source and destination accounts must be distinct"
      );
    }
  });

  it("fails if same-currency amounts do not match", () => {
    const result = createTransferSchema.safeParse({
      ...baseValidSameCurrency,
      destination_amount_minor: 4000,
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toContain(
        "Same-currency transfer amounts must be equal"
      );
    }
  });

  it("validates valid cross-currency transfer with matching precision", () => {
    // 100.00 USD (10000 minor) * 0.92 = 92.00 EUR (9200 minor)
    const result = createTransferSchema.safeParse({
      account_id: "acc-1",
      destination_account_id: "acc-2",
      amount_minor: 10000,
      destination_amount_minor: 9200,
      currency: "USD",
      destination_currency: "EUR",
      date: "2026-09-17T12:00:00.000Z",
      fx_quote: {
        rate: 0.92,
        provenance: "provider",
      },
    });
    expect(result.success).toBe(true);
  });

  it("fails cross-currency transfer if fx_quote is missing", () => {
    const result = createTransferSchema.safeParse({
      account_id: "acc-1",
      destination_account_id: "acc-2",
      amount_minor: 10000,
      destination_amount_minor: 9200,
      currency: "USD",
      destination_currency: "EUR",
      date: "2026-09-17T12:00:00.000Z",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toContain(
        "Exchange rate is required for cross-currency transfers"
      );
    }
  });

  it("fails cross-currency transfer if destination amount does not match rate precision", () => {
    const result = createTransferSchema.safeParse({
      account_id: "acc-1",
      destination_account_id: "acc-2",
      amount_minor: 10000,
      destination_amount_minor: 9500, // Mismatch! Should be 9200
      currency: "USD",
      destination_currency: "EUR",
      date: "2026-09-17T12:00:00.000Z",
      fx_quote: {
        rate: 0.92,
        provenance: "provider",
      },
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toContain(
        "Destination amount does not match rate conversion precision"
      );
    }
  });

  it("validates transfer with linked transfer fee expense", () => {
    const result = createTransferSchema.safeParse({
      ...baseValidSameCurrency,
      fee: {
        account_id: "acc-1",
        category_id: "cat-fee",
        amount_minor: 250,
        currency: "USD",
        note: "Bank wire fee",
      },
    });
    expect(result.success).toBe(true);
  });

  it("validates transfer with canonical OpenAPI fields (source_account_id, source_amount_minor, rate)", () => {
    const result = createTransferSchema.safeParse({
      source_account_id: "acc-1",
      destination_account_id: "acc-2",
      source_amount_minor: 10000,
      destination_amount_minor: 9200,
      source_currency: "USD",
      destination_currency: "EUR",
      date: "2026-09-17T12:00:00.000Z",
      rate: 0.92,
    });
    expect(result.success).toBe(true);
  });

  it("fails if fee amount is not positive", () => {
    const result = createTransferSchema.safeParse({
      ...baseValidSameCurrency,
      fee: {
        account_id: "acc-1",
        category_id: "cat-fee",
        amount_minor: 0,
        currency: "USD",
      },
    });
    expect(result.success).toBe(false);
  });
});

describe("OpenAPI transfer models and converters", () => {
  it("converts TransferResponse to FinancialRecord", async () => {
    const { transferResponseSchema, transferResponseToFinancialRecord } = await import("./transfers");
    const openApiResponse = {
      id: "tr-uuid",
      user_id: "user-uuid",
      kind: "transfer" as const,
      source_account_id: "acc-src",
      destination_account_id: "acc-dest",
      source_amount_minor: 15000,
      destination_amount_minor: 15000,
      source_currency: "USD",
      destination_currency: "USD",
      date: "2026-09-17T12:00:00.000Z",
      note: "Internal reallocation",
      is_active: true,
      created_at: "2026-09-17T12:00:00.000Z",
      updated_at: "2026-09-17T12:00:00.000Z",
    };

    const parsed = transferResponseSchema.safeParse(openApiResponse);
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      const record = transferResponseToFinancialRecord(parsed.data);
      expect(record.id).toBe("tr-uuid");
      expect(record.account_id).toBe("acc-src");
      expect(record.destination_account_id).toBe("acc-dest");
      expect(record.amount_minor).toBe(15000);
      expect(record.currency).toBe("USD");
      expect(record.kind).toBe("transfer");
    }
  });

  it("converts TransferFeeResponse to FinancialRecord", async () => {
    const { transferFeeResponseSchema, transferFeeResponseToFinancialRecord } = await import("./transfers");
    const feeResponse = {
      id: "fee-uuid",
      user_id: "user-uuid",
      kind: "expense" as const,
      account_id: "acc-src",
      category_id: "cat-fees",
      amount_minor: 300,
      currency: "USD",
      date: "2026-09-17T12:00:00.000Z",
      note: "Wiring fee",
      is_active: true,
      created_at: "2026-09-17T12:00:00.000Z",
      updated_at: "2026-09-17T12:00:00.000Z",
    };

    const parsed = transferFeeResponseSchema.safeParse(feeResponse);
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      const feeRecord = transferFeeResponseToFinancialRecord(parsed.data, "tr-uuid");
      expect(feeRecord.id).toBe("fee-uuid");
      expect(feeRecord.kind).toBe("expense");
      expect(feeRecord.account_id).toBe("acc-src");
      expect(feeRecord.linked_transfer_id).toBe("tr-uuid");
    }
  });
});
