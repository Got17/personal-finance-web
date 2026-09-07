import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import AccountsPage from "./page";
import * as session from "@/lib/session";
import * as authService from "@/lib/auth-service";
import * as accountsService from "@/lib/accounts-service";
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
