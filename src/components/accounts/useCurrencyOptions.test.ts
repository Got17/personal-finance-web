import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { renderHook, waitFor, cleanup } from "@testing-library/react";
import { useCurrencyOptions } from "./useCurrencyOptions";
import * as currenciesActions from "@/app/actions/currencies";

vi.mock("@/app/actions/currencies", () => ({
  getCurrenciesAction: vi.fn(),
}));

describe("useCurrencyOptions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it("starts in a loading state with no options", () => {
    vi.mocked(currenciesActions.getCurrenciesAction).mockReturnValue(new Promise(() => {}));

    const { result } = renderHook(() => useCurrencyOptions("USD"));

    expect(result.current.isLoading).toBe(true);
    expect(result.current.options).toEqual([]);
    expect(result.current.error).toBeNull();
  });

  it("maps fetched currencies into labeled dropdown options", async () => {
    vi.mocked(currenciesActions.getCurrenciesAction).mockResolvedValue({
      success: true,
      currencies: [
        { code: "LAK", name: "Lao Kip", symbol: "₭", decimal_digits: 0 },
        { code: "USD", name: "US Dollar", symbol: "$", decimal_digits: 2 },
      ],
    });

    const { result } = renderHook(() => useCurrencyOptions("USD"));

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.options).toEqual([
      { value: "LAK", label: "LAK — Lao Kip (₭)" },
      { value: "USD", label: "USD — US Dollar ($)" },
    ]);
    expect(result.current.error).toBeNull();
  });

  it("preserves an unrecognized current code by unshifting a synthetic option", async () => {
    vi.mocked(currenciesActions.getCurrenciesAction).mockResolvedValue({
      success: true,
      currencies: [{ code: "USD", name: "US Dollar", symbol: "$", decimal_digits: 2 }],
    });

    const { result } = renderHook(() => useCurrencyOptions("GBP"));

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.options).toEqual([
      { value: "GBP", label: "GBP" },
      { value: "USD", label: "USD — US Dollar ($)" },
    ]);
  });

  it("degrades to a single option holding the current code when the fetch fails", async () => {
    vi.mocked(currenciesActions.getCurrenciesAction).mockResolvedValue({
      success: false,
      error: "Unable to connect to currencies server.",
    });

    const { result } = renderHook(() => useCurrencyOptions("LAK"));

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.options).toEqual([{ value: "LAK", label: "LAK" }]);
    expect(result.current.error).toBe("Unable to connect to currencies server.");
  });
});
