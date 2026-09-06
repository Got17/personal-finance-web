import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { render, screen, cleanup, fireEvent, waitFor } from "@testing-library/react";
import SetupPage from "./page";
import * as session from "@/lib/session";
import * as preferencesService from "@/lib/preferences-service";
import * as preferencesActions from "@/app/actions/preferences";
import { redirect, useRouter } from "next/navigation";

vi.mock("@/lib/session", () => ({
  getSessionToken: vi.fn(),
}));

vi.mock("@/lib/preferences-service", () => ({
  getUserPreferences: vi.fn(),
}));

vi.mock("@/app/actions/preferences", () => ({
  updateBaseCurrencyAction: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  redirect: vi.fn(),
  useRouter: vi.fn(() => ({
    push: vi.fn(),
    refresh: vi.fn(),
  })),
}));

describe("SetupPage", () => {
  const mockPush = vi.fn();
  const mockRefresh = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useRouter).mockReturnValue({
      push: mockPush,
      refresh: mockRefresh,
      back: vi.fn(),
      forward: vi.fn(),
      prefetch: vi.fn(),
      replace: vi.fn(),
      bfcacheId: "",
    });
  });

  afterEach(() => {
    cleanup();
  });

  it("redirects unauthenticated user to /login", async () => {
    vi.mocked(session.getSessionToken).mockResolvedValue(null);

    await SetupPage();

    expect(redirect).toHaveBeenCalledWith("/login");
  });

  it("renders base-currency setup page with user's current currency preference", async () => {
    vi.mocked(session.getSessionToken).mockResolvedValue("valid-token");
    vi.mocked(preferencesService.getUserPreferences).mockResolvedValue({
      success: true,
      baseCurrency: "EUR",
    });

    const pageComponent = await SetupPage();
    render(pageComponent);

    expect(
      screen.getByRole("heading", { name: /choose your base currency/i }),
    ).toBeTruthy();
    const select = screen.getByLabelText(/select base currency/i) as HTMLSelectElement;
    expect(select).toBeTruthy();
    expect(select.value).toBe("EUR");
    expect(screen.getByRole("button", { name: /complete setup/i })).toBeTruthy();
  });

  it("navigates to dashboard / on completing setup successfully", async () => {
    vi.mocked(session.getSessionToken).mockResolvedValue("valid-token");
    vi.mocked(preferencesService.getUserPreferences).mockResolvedValue({
      success: true,
      baseCurrency: "USD",
    });
    vi.mocked(preferencesActions.updateBaseCurrencyAction).mockResolvedValue({
      success: true,
      baseCurrency: "GBP",
    });

    const pageComponent = await SetupPage();
    render(pageComponent);

    const select = screen.getByLabelText(/select base currency/i);
    fireEvent.change(select, { target: { value: "GBP" } });

    fireEvent.click(screen.getByRole("button", { name: /complete setup/i }));

    await waitFor(() => {
      expect(preferencesActions.updateBaseCurrencyAction).toHaveBeenCalledWith("GBP");
      expect(mockPush).toHaveBeenCalledWith("/");
      expect(mockRefresh).toHaveBeenCalled();
    });
  });

  it("displays clear validation feedback on save failure", async () => {
    vi.mocked(session.getSessionToken).mockResolvedValue("valid-token");
    vi.mocked(preferencesService.getUserPreferences).mockResolvedValue({
      success: true,
      baseCurrency: "USD",
    });
    vi.mocked(preferencesActions.updateBaseCurrencyAction).mockResolvedValue({
      success: false,
      error: "Unsupported currency code: XXX",
    });

    const pageComponent = await SetupPage();
    render(pageComponent);

    fireEvent.click(screen.getByRole("button", { name: /complete setup/i }));

    await waitFor(() => {
      expect(screen.getByRole("alert")).toBeTruthy();
      expect(screen.getByText("Unsupported currency code: XXX")).toBeTruthy();
      expect(mockPush).not.toHaveBeenCalled();
    });
  });
});
