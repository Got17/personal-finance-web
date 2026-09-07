import { describe, expect, it, vi, beforeEach } from "vitest";
import { createAccountAction, getAccountsAction } from "./accounts";
import * as session from "@/lib/session";
import * as accountsService from "@/lib/accounts-service";
import { Account } from "@/lib/schemas/accounts";
import { revalidatePath } from "next/cache";

vi.mock("@/lib/session", () => ({
  getSessionToken: vi.fn(),
}));

vi.mock("@/lib/accounts-service", () => ({
  createAccount: vi.fn(),
  getAccounts: vi.fn(),
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
});
