import { describe, expect, it, vi, beforeEach } from "vitest";
import { createAccountAction, getAccountsAction, updateAccountAction, deactivateAccountAction } from "./accounts";
import * as session from "@/lib/session";
import * as accountsService from "@/lib/accounts-service";
import { Account } from "@/lib/schemas/accounts";
import { revalidatePath } from "next/cache";

vi.mock("@/lib/session", () => ({
  getSessionToken: vi.fn(),
  withAuth: vi.fn(async (handler) => {
    const token = await session.getSessionToken();
    if (!token) {
      return { success: false, error: "Unauthenticated." };
    }
    return handler(token);
  }),
}));

vi.mock("@/lib/accounts-service", () => ({
  createAccount: vi.fn(),
  getAccounts: vi.fn(),
  updateAccount: vi.fn(),
  deactivateAccount: vi.fn(),
}));

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

const mockAccount: Account = {
  id: "acc-1",
  user_id: "usr-1",
  name: "Everyday Checking",
  type: "checking",
  currency: "USD",
  description: "Primary checking",
  is_active: true,
  created_at: "2026-09-07T00:00:00Z",
  updated_at: "2026-09-07T00:00:00Z",
};

describe("accounts server actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("createAccountAction", () => {
    it("returns error if user is unauthenticated", async () => {
      vi.mocked(session.getSessionToken).mockResolvedValue(null);

      const result = await createAccountAction({
        name: "Savings",
        type: "savings",
        currency: "USD",
        is_active: true,
      });

      expect(result).toEqual({
        success: false,
        error: "Unauthenticated.",
      });
      expect(accountsService.createAccount).not.toHaveBeenCalled();
    });

    it("creates account and revalidates /accounts path on success", async () => {
      vi.mocked(session.getSessionToken).mockResolvedValue("valid-token");
      vi.mocked(accountsService.createAccount).mockResolvedValue({
        success: true,
        account: mockAccount,
      });

      const result = await createAccountAction({
        name: "Everyday Checking",
        type: "checking",
        currency: "USD",
        description: "Primary checking",
        is_active: true,
      });

      expect(result).toEqual({
        success: true,
        account: mockAccount,
      });
      expect(accountsService.createAccount).toHaveBeenCalledWith("valid-token", {
        name: "Everyday Checking",
        type: "checking",
        currency: "USD",
        description: "Primary checking",
        is_active: true,
      });
      expect(revalidatePath).toHaveBeenCalledWith("/accounts");
    });

    it("returns error message when createAccount service fails", async () => {
      vi.mocked(session.getSessionToken).mockResolvedValue("valid-token");
      vi.mocked(accountsService.createAccount).mockResolvedValue({
        success: false,
        error: "Account name already exists",
      });

      const result = await createAccountAction({
        name: "Everyday Checking",
        type: "checking",
        currency: "USD",
        is_active: true,
      });

      expect(result).toEqual({
        success: false,
        error: "Account name already exists",
      });
    });
  });

  describe("getAccountsAction", () => {
    it("returns error if user is unauthenticated", async () => {
      vi.mocked(session.getSessionToken).mockResolvedValue(null);

      const result = await getAccountsAction();

      expect(result).toEqual({
        success: false,
        error: "Unauthenticated.",
      });
    });

    it("returns accounts when service call succeeds", async () => {
      vi.mocked(session.getSessionToken).mockResolvedValue("valid-token");
      vi.mocked(accountsService.getAccounts).mockResolvedValue({
        success: true,
        accounts: [mockAccount],
      });

      const result = await getAccountsAction();

      expect(result).toEqual({
        success: true,
        accounts: [mockAccount],
      });
      expect(accountsService.getAccounts).toHaveBeenCalledWith("valid-token");
    });
  });

  describe("updateAccountAction", () => {
    it("returns error if user is unauthenticated", async () => {
      vi.mocked(session.getSessionToken).mockResolvedValue(null);

      const result = await updateAccountAction("acc-1", { name: "New Name" });

      expect(result).toEqual({
        success: false,
        error: "Unauthenticated.",
      });
      expect(accountsService.updateAccount).not.toHaveBeenCalled();
    });

    it("updates account and revalidates /accounts on success", async () => {
      vi.mocked(session.getSessionToken).mockResolvedValue("valid-token");
      const updated = { ...mockAccount, name: "New Name" };
      vi.mocked(accountsService.updateAccount).mockResolvedValue({
        success: true,
        account: updated,
      });

      const result = await updateAccountAction("acc-1", { name: "New Name" });

      expect(result).toEqual({
        success: true,
        account: updated,
      });
      expect(accountsService.updateAccount).toHaveBeenCalledWith("valid-token", "acc-1", {
        name: "New Name",
      });
      expect(revalidatePath).toHaveBeenCalledWith("/accounts");
    });

    it("returns error when service fails", async () => {
      vi.mocked(session.getSessionToken).mockResolvedValue("valid-token");
      vi.mocked(accountsService.updateAccount).mockResolvedValue({
        success: false,
        error: "Account not found",
      });

      const result = await updateAccountAction("acc-1", { name: "New Name" });

      expect(result).toEqual({
        success: false,
        error: "Account not found",
      });
    });
  });

  describe("deactivateAccountAction", () => {
    it("returns error if user is unauthenticated", async () => {
      vi.mocked(session.getSessionToken).mockResolvedValue(null);

      const result = await deactivateAccountAction("acc-1");

      expect(result).toEqual({
        success: false,
        error: "Unauthenticated.",
      });
      expect(accountsService.deactivateAccount).not.toHaveBeenCalled();
    });

    it("deactivates account and revalidates /accounts on success", async () => {
      vi.mocked(session.getSessionToken).mockResolvedValue("valid-token");
      const deactivated = { ...mockAccount, is_active: false };
      vi.mocked(accountsService.deactivateAccount).mockResolvedValue({
        success: true,
        account: deactivated,
      });

      const result = await deactivateAccountAction("acc-1");

      expect(result).toEqual({
        success: true,
        account: deactivated,
      });
      expect(accountsService.deactivateAccount).toHaveBeenCalledWith("valid-token", "acc-1");
      expect(revalidatePath).toHaveBeenCalledWith("/accounts");
    });

    it("returns error when deactivation service fails", async () => {
      vi.mocked(session.getSessionToken).mockResolvedValue("valid-token");
      vi.mocked(accountsService.deactivateAccount).mockResolvedValue({
        success: false,
        error: "Caller does not own the account.",
      });

      const result = await deactivateAccountAction("acc-1");

      expect(result).toEqual({
        success: false,
        error: "Caller does not own the account.",
      });
    });
  });
});

