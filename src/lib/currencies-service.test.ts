import { describe, expect, it, vi, afterEach, beforeEach } from "vitest";
import { getCurrencies } from "./currencies-service";

describe("currencies-service", () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  describe("getCurrencies", () => {
    it("fetches the supported currency list from GET /v1/currencies without a token", async () => {
      const mockResponse = {
        success: true,
        data: [
          { code: "LAK", name: "Lao Kip", symbol: "₭", decimal_digits: 0 },
          { code: "USD", name: "US Dollar", symbol: "$", decimal_digits: 2 },
        ],
        message: "The supported currencies.",
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: () => Promise.resolve(mockResponse),
      } as Response);

      const result = await getCurrencies();

      expect(global.fetch).toHaveBeenCalledWith(
        "http://localhost:8080/v1/currencies",
        expect.objectContaining({
          method: "GET",
        }),
      );
      expect(global.fetch).not.toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          headers: expect.objectContaining({ Authorization: expect.anything() }),
        }),
      );

      expect(result).toEqual({
        success: true,
        currencies: mockResponse.data,
      });
    });

    it("returns an error when the server responds with a non-success payload", async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: () => Promise.resolve({ success: false, message: "Malformed." }),
      } as Response);

      const result = await getCurrencies();

      expect(result).toEqual({
        success: false,
        error: "Malformed.",
      });
    });

    it("returns an error when the response body is not a currency array", async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: () => Promise.resolve({ success: true, data: "oops" }),
      } as Response);

      const result = await getCurrencies();

      expect(result).toEqual({
        success: false,
        error: "Invalid response from currencies server.",
      });
    });

    it("handles network error gracefully", async () => {
      global.fetch = vi.fn().mockRejectedValue(new Error("Network fail"));

      const result = await getCurrencies();

      expect(result).toEqual({
        success: false,
        error: "Unable to connect to currencies server.",
      });
    });
  });
});
