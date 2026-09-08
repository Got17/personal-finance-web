import { describe, expect, it, vi, beforeEach } from "vitest";
import { updateBaseCurrencyAction } from "./preferences";
import * as session from "@/lib/session";
import * as preferencesService from "@/lib/preferences-service";

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

vi.mock("@/lib/preferences-service", () => ({
  updateBaseCurrencyPreference: vi.fn(),
}));

describe("updateBaseCurrencyAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns error if user is unauthenticated", async () => {
    vi.mocked(session.getSessionToken).mockResolvedValue(null);

    const result = await updateBaseCurrencyAction("EUR");

    expect(result).toEqual({
      success: false,
      error: "Unauthenticated.",
    });
    expect(preferencesService.updateBaseCurrencyPreference).not.toHaveBeenCalled();
  });

  it("calls updateBaseCurrencyPreference and returns success result when token is valid", async () => {
    vi.mocked(session.getSessionToken).mockResolvedValue("user-token");
    vi.mocked(preferencesService.updateBaseCurrencyPreference).mockResolvedValue({
      success: true,
      baseCurrency: "EUR",
    });

    const result = await updateBaseCurrencyAction("EUR");

    expect(preferencesService.updateBaseCurrencyPreference).toHaveBeenCalledWith(
      "user-token",
      "EUR",
    );
    expect(result).toEqual({
      success: true,
      baseCurrency: "EUR",
    });
  });

  it("returns error message when updateBaseCurrencyPreference fails", async () => {
    vi.mocked(session.getSessionToken).mockResolvedValue("user-token");
    vi.mocked(preferencesService.updateBaseCurrencyPreference).mockResolvedValue({
      success: false,
      error: "Unsupported currency code.",
    });

    const result = await updateBaseCurrencyAction("INVALID");

    expect(result).toEqual({
      success: false,
      error: "Unsupported currency code.",
    });
  });
});
