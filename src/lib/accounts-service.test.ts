import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { getAccounts, createAccount, updateAccount, deactivateAccount } from "./accounts-service";
import { Account } from "@/lib/schemas/accounts";

const mockAccount: Account = {
  id: "acc-1",
  user_id: "usr-1",
  name: "Everyday Checking",
  type: "checking",
  currency: "USD",
  description: "Primary daily checking",
  is_active: true,
  created_at: "2026-09-07T00:00:00Z",
  updated_at: "2026-09-07T00:00:00Z",
};

describe("accounts-service", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("getAccounts", () => {
    it("returns account list when GET /v1/accounts succeeds", async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({
          success: true,
          data: [mockAccount],
          message: "Accounts retrieved successfully",
        }),
      } as Response);

      const result = await getAccounts("valid-token");

      expect(result).toEqual({
        success: true,
        accounts: [mockAccount],
      });
      expect(fetch).toHaveBeenCalledWith(
        "http://localhost:8080/v1/accounts",
        expect.objectContaining({
          method: "GET",
          headers: { Authorization: "Bearer valid-token" },
        }),
      );
    });

    it("returns error on 401 unauthenticated response", async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: async () => ({
          success: false,
          error: "Unauthenticated or invalid token.",
          message: "Unauthorized",
        }),
      } as Response);

      const result = await getAccounts("invalid-token");

      expect(result).toEqual({
        success: false,
        error: "Unauthorized",
        status: 401,
      });
    });

    it("returns error message when fetch throws a network error", async () => {
      vi.mocked(fetch).mockRejectedValueOnce(new Error("Network failure"));

      const result = await getAccounts("valid-token");

      expect(result).toEqual({
        success: false,
        error: "Unable to connect to accounts server.",
      });
    });

    it("returns error when response claims success but data is not an array", async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({
          success: true,
          data: "not-an-array",
          message: "Invalid response format",
        }),
      } as Response);

      const result = await getAccounts("valid-token");

      expect(result).toEqual({
        success: false,
        error: "Invalid response from accounts server.",
        status: 200,
      });
    });
  });

  describe("createAccount", () => {
    it("creates account when input is valid and POST /v1/accounts succeeds", async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        status: 201,
        json: async () => ({
          success: true,
          data: mockAccount,
          message: "Account created successfully",
        }),
      } as Response);

      const result = await createAccount("valid-token", {
        name: "Everyday Checking",
        type: "checking",
        currency: "USD",
        description: "Primary daily checking",
        is_active: true,
      });

      expect(result).toEqual({
        success: true,
        account: mockAccount,
      });
    });

    it("rejects client side when schema validation fails before calling network", async () => {
      const result = await createAccount("valid-token", {
        name: "",
        type: "checking",
        currency: "USD",
        is_active: true,
      });

      expect(result).toEqual({
        success: false,
        error: "Account name is required.",
      });
      expect(fetch).not.toHaveBeenCalled();
    });

    it("returns server error message when API responds with 422 validation failure", async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: false,
        status: 422,
        json: async () => ({
          success: false,
          error: "Validation failed",
          message: "Unsupported currency code",
        }),
      } as Response);

      const result = await createAccount("valid-token", {
        name: "Test Account",
        type: "savings",
        currency: "USD",
        is_active: true,
      });

      expect(result).toEqual({
        success: false,
        error: "Unsupported currency code",
        status: 422,
      });
    });
  });

  describe("updateAccount", () => {
    it("updates account when input is valid and PUT /v1/accounts/:id succeeds", async () => {
      const updatedAccount: Account = {
        ...mockAccount,
        name: "Updated Checking",
        updated_at: "2026-09-07T01:00:00Z",
      };

      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({
          success: true,
          data: updatedAccount,
          message: "Account updated successfully",
        }),
      } as Response);

      const result = await updateAccount("valid-token", "acc-1", {
        name: "Updated Checking",
      });

      expect(result).toEqual({
        success: true,
        account: updatedAccount,
      });
      expect(fetch).toHaveBeenCalledWith(
        "http://localhost:8080/v1/accounts/acc-1",
        expect.objectContaining({
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer valid-token",
          },
        }),
      );
    });

    it("rejects client-side when schema validation fails", async () => {
      const result = await updateAccount("valid-token", "acc-1", {
        name: "   ",
      });

      expect(result).toEqual({
        success: false,
        error: "Account name is required.",
      });
      expect(fetch).not.toHaveBeenCalled();
    });

    it("returns error on 403 forbidden response", async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: false,
        status: 403,
        json: async () => ({
          success: false,
          error: "Forbidden",
          message: "Caller does not own the account.",
        }),
      } as Response);

      const result = await updateAccount("valid-token", "acc-1", {
        name: "Updated Checking",
      });

      expect(result).toEqual({
        success: false,
        error: "Caller does not own the account.",
        status: 403,
      });
    });

    it("returns error on 404 not found response", async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: false,
        status: 404,
        json: async () => ({
          success: false,
          error: "Not Found",
          message: "Account not found.",
        }),
      } as Response);

      const result = await updateAccount("valid-token", "acc-999", {
        name: "Nonexistent",
      });

      expect(result).toEqual({
        success: false,
        error: "Account not found.",
        status: 404,
      });
    });
  });

  describe("deactivateAccount", () => {
    it("deactivates account when DELETE /v1/accounts/:id succeeds", async () => {
      const deactivatedAccount: Account = {
        ...mockAccount,
        is_active: false,
        updated_at: "2026-09-07T02:00:00Z",
      };

      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({
          success: true,
          data: deactivatedAccount,
          message: "Account deactivated successfully",
        }),
      } as Response);

      const result = await deactivateAccount("valid-token", "acc-1");

      expect(result).toEqual({
        success: true,
        account: deactivatedAccount,
      });
      expect(fetch).toHaveBeenCalledWith(
        "http://localhost:8080/v1/accounts/acc-1",
        expect.objectContaining({
          method: "DELETE",
          headers: {
            Authorization: "Bearer valid-token",
          },
        }),
      );
    });

    it("returns error on 403 forbidden response during deactivation", async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: false,
        status: 403,
        json: async () => ({
          success: false,
          error: "Forbidden",
          message: "Caller does not own the account.",
        }),
      } as Response);

      const result = await deactivateAccount("valid-token", "acc-1");

      expect(result).toEqual({
        success: false,
        error: "Caller does not own the account.",
        status: 403,
      });
    });
  });
});

