import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { getUserPreferences, updateBaseCurrencyPreference } from "./preferences-service";

describe("preferences-service", () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  describe("getUserPreferences", () => {
    it("fetches user preferences from GET /v1/users/me/preferences with Bearer token", async () => {
      const mockResponse = {
        success: true,
        data: {
          base_currency: "EUR",
        },
        message: "The user preferences.",
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: () => Promise.resolve(mockResponse),
      } as Response);

      const result = await getUserPreferences("test-token");

      expect(global.fetch).toHaveBeenCalledWith(
        "http://localhost:8080/v1/users/me/preferences",
        expect.objectContaining({
          method: "GET",
          headers: {
            Authorization: "Bearer test-token",
          },
        }),
      );

      expect(result).toEqual({
        success: true,
        baseCurrency: "EUR",
      });
    });

    it("returns error message when unauthorized (401)", async () => {
      const mockErrorResponse = {
        success: false,
        error: "UNAUTHORIZED",
        message: "Unauthenticated or invalid token.",
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 401,
        json: () => Promise.resolve(mockErrorResponse),
      } as Response);

      const result = await getUserPreferences("invalid-token");

      expect(result).toEqual({
        success: false,
        error: "Unauthenticated or invalid token.",
        status: 401,
      });
    });

    it("handles network error gracefully", async () => {
      global.fetch = vi.fn().mockRejectedValue(new Error("Network fail"));

      const result = await getUserPreferences("valid-token");

      expect(result).toEqual({
        success: false,
        error: "Unable to connect to preferences server.",
      });
    });
  });

  describe("updateBaseCurrencyPreference", () => {
    it("sends PUT request to /v1/users/me/preferences with updated base_currency", async () => {
      const mockSuccessResponse = {
        success: true,
        data: {
          base_currency: "GBP",
        },
        message: "Preferences updated.",
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: () => Promise.resolve(mockSuccessResponse),
      } as Response);

      const result = await updateBaseCurrencyPreference("test-token", "GBP");

      expect(global.fetch).toHaveBeenCalledWith(
        "http://localhost:8080/v1/users/me/preferences",
        expect.objectContaining({
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer test-token",
          },
          body: JSON.stringify({ base_currency: "GBP" }),
        }),
      );

      expect(result).toEqual({
        success: true,
        baseCurrency: "GBP",
      });
    });

    it("returns validation error when server responds with 422", async () => {
      const mockErrorResponse = {
        success: false,
        error: "UNPROCESSABLE_ENTITY",
        message: "Unsupported currency code: XXX",
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 422,
        json: () => Promise.resolve(mockErrorResponse),
      } as Response);

      const result = await updateBaseCurrencyPreference("test-token", "XXX");

      expect(result).toEqual({
        success: false,
        error: "Unsupported currency code: XXX",
        status: 422,
      });
    });

    it("validates currency format before calling API", async () => {
      global.fetch = vi.fn();
      const result = await updateBaseCurrencyPreference("test-token", "invalid");

      expect(result).toEqual({
        success: false,
        error: "Base currency must be a valid 3-letter currency code (e.g. USD, EUR).",
      });
      expect(global.fetch).not.toHaveBeenCalled();
    });

    it("handles network error gracefully during update", async () => {
      global.fetch = vi.fn().mockRejectedValue(new Error("Network fail"));

      const result = await updateBaseCurrencyPreference("test-token", "USD");

      expect(result).toEqual({
        success: false,
        error: "Unable to connect to preferences server.",
      });
    });
  });
});
