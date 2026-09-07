import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { getAccounts, createAccount } from "./accounts-service";
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
});
