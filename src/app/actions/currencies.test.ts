import { describe, expect, it, vi, beforeEach } from "vitest";
import { getCurrenciesAction } from "./currencies";
import * as currenciesService from "@/lib/currencies-service";

vi.mock("@/lib/currencies-service", () => ({
  getCurrencies: vi.fn(),
}));

describe("getCurrenciesAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns currencies when the service call succeeds", async () => {
    const currencies = [{ code: "USD", name: "US Dollar", symbol: "$", decimal_digits: 2 }];
    vi.mocked(currenciesService.getCurrencies).mockResolvedValue({
      success: true,
      currencies,
    });

    const result = await getCurrenciesAction();

    expect(result).toEqual({ success: true, currencies });
  });

  it("returns the error message when the service call fails", async () => {
    vi.mocked(currenciesService.getCurrencies).mockResolvedValue({
      success: false,
      error: "Unable to connect to currencies server.",
    });

    const result = await getCurrenciesAction();

    expect(result).toEqual({
      success: false,
      error: "Unable to connect to currencies server.",
    });
  });
});
