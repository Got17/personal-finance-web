import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import AccountsPage from "./page";
import * as session from "@/lib/session";
import * as authService from "@/lib/auth-service";
import * as accountsService from "@/lib/accounts-service";
import * as categoriesService from "@/lib/categories-service";
import * as currenciesActions from "@/app/actions/currencies";
import { redirect } from "next/navigation";
import { Account } from "@/lib/schemas/accounts";

vi.mock("@/lib/session", () => ({
  getSessionToken: vi.fn(),
}));

vi.mock("@/lib/auth-service", () => ({
  getCurrentUser: vi.fn(),
}));

vi.mock("@/lib/accounts-service", () => ({
  getAccounts: vi.fn(),
}));

vi.mock("@/lib/categories-service", () => ({
  getCategories: vi.fn(),
}));

vi.mock("@/app/actions/currencies", () => ({
  getCurrenciesAction: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  redirect: vi.fn(),
}));

const mockAccount: Account = {
  id: "acc-1",
  user_id: "usr-1",
  name: "Everyday Checking",
  type: "checking",
  currency: "USD",
  description: "Primary checking account",
  is_active: true,
  created_at: "2026-09-07T00:00:00Z",
  updated_at: "2026-09-07T00:00:00Z",
};

describe("AccountsPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(currenciesActions.getCurrenciesAction).mockResolvedValue({
      success: true,
      currencies: [{ code: "USD", name: "US Dollar", symbol: "$", decimal_digits: 2 }],
    });
    vi.mocked(categoriesService.getCategories).mockResolvedValue({
      success: true,
      categories: [],
    });
  });

  afterEach(() => {
    cleanup();
  });

  it("redirects unauthenticated user to /login when token is missing", async () => {
    vi.mocked(session.getSessionToken).mockResolvedValue(null);

    await AccountsPage();

    expect(redirect).toHaveBeenCalledWith("/login");
  });

  it("renders page with user accounts when authenticated", async () => {
    vi.mocked(session.getSessionToken).mockResolvedValue("valid-token");
    vi.mocked(authService.getCurrentUser).mockResolvedValue({
      success: true,
      status: 200,
      user: {
        id: "usr-1",
        email: "alex@example.com",
        base_currency: "EUR",
        created_at: "2026-09-07T00:00:00Z",
        updated_at: "2026-09-07T00:00:00Z",
      },
    });
    vi.mocked(accountsService.getAccounts).mockResolvedValue({
      success: true,
      accounts: [mockAccount],
    });

    const pageComponent = await AccountsPage();
    render(pageComponent);

    expect(screen.getByRole("heading", { name: "Accounts" })).toBeTruthy();
    expect(screen.getByText("Everyday Checking")).toBeTruthy();
  });

  it("passes resolved initialTab from searchParams to AccountsView", async () => {
    vi.mocked(session.getSessionToken).mockResolvedValue("valid-token");
    vi.mocked(authService.getCurrentUser).mockResolvedValue({
      success: true,
      status: 200,
      user: {
        id: "usr-1",
        email: "alex@example.com",
        base_currency: "USD",
        created_at: "2026-09-07T00:00:00Z",
        updated_at: "2026-09-07T00:00:00Z",
      },
    });
    vi.mocked(accountsService.getAccounts).mockResolvedValue({
      success: true,
      accounts: [mockAccount],
    });

    const pageComponent = await AccountsPage({
      searchParams: Promise.resolve({ tab: "banking" }),
    });
    render(pageComponent);

    expect(screen.getByRole("tab", { name: /Banking/i, selected: true })).toBeTruthy();
    expect(screen.getByText("Add Bank Account")).toBeTruthy();
  });

  it("displays error banner when fetching accounts fails", async () => {
    vi.mocked(session.getSessionToken).mockResolvedValue("valid-token");
    vi.mocked(authService.getCurrentUser).mockResolvedValue({
      success: true,
      status: 200,
      user: {
        id: "usr-1",
        email: "alex@example.com",
        base_currency: "USD",
        created_at: "2026-09-07T00:00:00Z",
        updated_at: "2026-09-07T00:00:00Z",
      },
    });
    vi.mocked(accountsService.getAccounts).mockResolvedValue({
      success: false,
      error: "Unable to connect to accounts server.",
    });

    const pageComponent = await AccountsPage();
    render(pageComponent);

    expect(
      screen.getByText("Failed to load accounts: Unable to connect to accounts server."),
    ).toBeTruthy();
  });
});
