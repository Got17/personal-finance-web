import { describe, expect, it, beforeEach, afterEach, vi } from "vitest";
import { createMockApiHandler } from "./mock-api";
import { signUpUser, authenticateUser, getCurrentUser } from "@/lib/auth-service";
import { getUserPreferences, updateBaseCurrencyPreference } from "@/lib/preferences-service";
import {
  createAccount,
  getAccounts,
  updateAccount,
  deactivateAccount,
} from "@/lib/accounts-service";
import {
  createCategory,
  getCategories,
  updateCategory,
  deactivateCategory,
} from "@/lib/categories-service";
import { setSessionToken } from "@/lib/session";
import { updateBaseCurrencyAction } from "@/app/actions/preferences";
import {
  createAccountAction,
  getAccountsAction,
  updateAccountAction,
  deactivateAccountAction,
} from "@/app/actions/accounts";
import {
  createCategoryAction,
  getCategoriesAction,
  updateCategoryAction,
  deactivateCategoryAction,
} from "@/app/actions/categories";

let currentSessionCookie: string | null = null;

const mockCookieStore = {
  get: vi.fn((_name: string) => (currentSessionCookie ? { value: currentSessionCookie } : undefined)),
  set: vi.fn((_name: string, value: string) => {
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

describe("Phase 1 Foundation contract-level integration tests (mocked /v1 API)", () => {
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

  it("proves complete setup flow: sign in, select base currency, manage Accounts & Categories, and observe persistence", async () => {
    // 1. User authentication
    const signUp = await signUpUser({
      email: "alice@example.com",
      password: "password123",
      workspaceName: "Alice Personal Finance",
    });
    expect(signUp).toEqual({ success: true, accessToken: expect.any(String) });
    if (!signUp.success) return;
    const aliceToken = signUp.accessToken;

    const auth = await authenticateUser({ email: "alice@example.com", password: "password123" });
    expect(auth).toEqual({ success: true, accessToken: expect.any(String) });

    const profile = await getCurrentUser(aliceToken);
    expect(profile.success).toBe(true);

    // 2. Base currency setup & persistence
    const prefInitial = await getUserPreferences(aliceToken);
    expect(prefInitial).toEqual({ success: true, baseCurrency: "USD" });

    const prefUpdate = await updateBaseCurrencyPreference(aliceToken, "EUR");
    expect(prefUpdate).toEqual({ success: true, baseCurrency: "EUR" });

    const prefPersisted = await getUserPreferences(aliceToken);
    expect(prefPersisted).toEqual({ success: true, baseCurrency: "EUR" });

    // 3. Accounts management (Create, Read, Update, Deactivate)
    const createAcc = await createAccount(aliceToken, {
      name: "Main Everyday Checking",
      type: "checking",
      currency: "EUR",
      description: "Primary checking account for daily spend",
      is_active: true,
    });
    expect(createAcc.success).toBe(true);
    if (!createAcc.success) return;
    const accountId = createAcc.account.id;
    expect(createAcc.account.is_active).toBe(true);

    const initialAccounts = await getAccounts(aliceToken);
    expect(initialAccounts).toEqual({
      success: true,
      accounts: [expect.objectContaining({ name: "Main Everyday Checking", type: "checking" })],
    });

    const updateAcc = await updateAccount(aliceToken, accountId, {
      name: "Primary Savings",
      type: "savings",
    });
    expect(updateAcc).toEqual({
      success: true,
      account: expect.objectContaining({ name: "Primary Savings", type: "savings" }),
    });

    const deactivateAcc = await deactivateAccount(aliceToken, accountId);
    expect(deactivateAcc).toEqual({
      success: true,
      account: expect.objectContaining({ is_active: false }),
    });

    const updatedAccounts = await getAccounts(aliceToken);
    expect(updatedAccounts).toEqual({
      success: true,
      accounts: [expect.objectContaining({ is_active: false })],
    });

    // 4. Categories management (Create, Read, Update, Deactivate)
    const createCat = await createCategory(aliceToken, {
      name: "Groceries",
      type: "expense",
      is_active: true,
    });
    expect(createCat.success).toBe(true);
    if (!createCat.success) return;
    const categoryId = createCat.category.id;

    const initialCategories = await getCategories(aliceToken);
    expect(initialCategories).toEqual({
      success: true,
      categories: [expect.objectContaining({ name: "Groceries", type: "expense" })],
    });

    const updateCat = await updateCategory(aliceToken, categoryId, {
      name: "Supermarket & Dining",
    });
    expect(updateCat).toEqual({
      success: true,
      category: expect.objectContaining({ name: "Supermarket & Dining" }),
    });

    const deactivateCat = await deactivateCategory(aliceToken, categoryId);
    expect(deactivateCat).toEqual({
      success: true,
      category: expect.objectContaining({ is_active: false }),
    });

    const updatedCategories = await getCategories(aliceToken);
    expect(updatedCategories).toEqual({
      success: true,
      categories: [expect.objectContaining({ is_active: false })],
    });
  });

  it("proves complete flow via Web Server Actions with session context", async () => {
    const signUp = await signUpUser({ email: "alice-action@example.com", password: "password123" });
    expect(signUp.success).toBe(true);
    if (!signUp.success) return;
    await setSessionToken(signUp.accessToken);

    const prefActionRes = await updateBaseCurrencyAction("GBP");
    expect(prefActionRes).toEqual({ success: true, baseCurrency: "GBP" });

    const createAccRes = await createAccountAction({
      name: "Emergency Fund",
      type: "savings",
      currency: "GBP",
      is_active: true,
    });
    expect(createAccRes.success).toBe(true);
    if (!createAccRes.success) return;
    const accId = createAccRes.account!.id;

    const listAccRes = await getAccountsAction();
    expect(listAccRes.success).toBe(true);
    expect(listAccRes.accounts).toHaveLength(1);

    const updateAccRes = await updateAccountAction(accId, { name: "High-Yield Savings" });
    expect(updateAccRes.success).toBe(true);
    expect(updateAccRes.account!.name).toBe("High-Yield Savings");

    const deactivateAccRes = await deactivateAccountAction(accId);
    expect(deactivateAccRes.success).toBe(true);
    expect(deactivateAccRes.account!.is_active).toBe(false);

    const createCatRes = await createCategoryAction({
      name: "Salary",
      type: "income",
      is_active: true,
    });
    expect(createCatRes.success).toBe(true);
    if (!createCatRes.success) return;
    const catId = createCatRes.category!.id;

    const listCatRes = await getCategoriesAction();
    expect(listCatRes.success).toBe(true);
    expect(listCatRes.categories).toHaveLength(1);

    const updateCatRes = await updateCategoryAction(catId, { name: "Primary Salary" });
    expect(updateCatRes.success).toBe(true);
    expect(updateCatRes.category!.name).toBe("Primary Salary");

    const deactivateCatRes = await deactivateCategoryAction(catId);
    expect(deactivateCatRes.success).toBe(true);
    expect(deactivateCatRes.category!.is_active).toBe(false);
  });

  it("verifies strict user isolation: proves User B cannot access or mutate User A's data", async () => {
    const userA = await signUpUser({ email: "usera@example.com", password: "password123" });
    expect(userA.success).toBe(true);
    if (!userA.success) return;
    const tokenA = userA.accessToken;

    const accA = await createAccount(tokenA, { name: "User A Account", type: "checking", currency: "USD", is_active: true });
    expect(accA.success).toBe(true);
    if (!accA.success) return;

    const catA = await createCategory(tokenA, { name: "User A Category", type: "expense", is_active: true });
    expect(catA.success).toBe(true);
    if (!catA.success) return;

    const userB = await signUpUser({ email: "userb@example.com", password: "password123" });
    expect(userB.success).toBe(true);
    if (!userB.success) return;
    const tokenB = userB.accessToken;

    // Data Isolation (Listing returns only caller's resources)
    const userBAccounts = await getAccounts(tokenB);
    expect(userBAccounts).toEqual({ success: true, accounts: [] });

    const userBCategories = await getCategories(tokenB);
    expect(userBCategories).toEqual({ success: true, categories: [] });

    // Mutation Isolation (Forbidden cross-user operations return 403 status)
    const illegalAccUpdate = await updateAccount(tokenB, accA.account.id, { name: "Hacked Account" });
    expect(illegalAccUpdate).toEqual({ success: false, error: expect.any(String), status: 403 });

    const illegalAccDeactivate = await deactivateAccount(tokenB, accA.account.id);
    expect(illegalAccDeactivate).toEqual({ success: false, error: expect.any(String), status: 403 });

    const illegalCatUpdate = await updateCategory(tokenB, catA.category.id, { name: "Hacked Category" });
    expect(illegalCatUpdate).toEqual({ success: false, error: expect.any(String), status: 403 });

    const illegalCatDeactivate = await deactivateCategory(tokenB, catA.category.id);
    expect(illegalCatDeactivate).toEqual({ success: false, error: expect.any(String), status: 403 });

    // Verify User A's resources remain active and untouched
    const userAAccounts = await getAccounts(tokenA);
    expect(userAAccounts).toEqual({
      success: true,
      accounts: [expect.objectContaining({ name: "User A Account", is_active: true })],
    });

    const userACategories = await getCategories(tokenA);
    expect(userACategories).toEqual({
      success: true,
      categories: [expect.objectContaining({ name: "User A Category", is_active: true })],
    });
  });

  it("exercises observable API error handling for unauthenticated requests and invalid inputs", async () => {
    expect(await getCurrentUser("invalid-token")).toEqual({ success: false, error: expect.any(String), status: 401 });
    expect(await getUserPreferences("invalid-token")).toEqual({ success: false, error: expect.any(String), status: 401 });
    expect(await getAccounts("invalid-token")).toEqual({ success: false, error: expect.any(String), status: 401 });
    expect(await getCategories("invalid-token")).toEqual({ success: false, error: expect.any(String), status: 401 });

    const user = await signUpUser({ email: "val@example.com", password: "password123" });
    expect(user.success).toBe(true);
    if (!user.success) return;

    expect(await updateBaseCurrencyPreference(user.accessToken, "INVALID")).toEqual({ success: false, error: expect.any(String) });
    expect(await createAccount(user.accessToken, { name: "", type: "checking", currency: "USD", is_active: true })).toEqual({ success: false, error: expect.any(String) });
    expect(await createCategory(user.accessToken, { name: "", type: "expense", is_active: true })).toEqual({ success: false, error: expect.any(String) });
  });
});
