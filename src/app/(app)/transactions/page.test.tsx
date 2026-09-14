import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import TransactionsPage from "./page";
import * as session from "@/lib/session";
import * as accountsService from "@/lib/accounts-service";
import * as categoriesService from "@/lib/categories-service";
import * as financialRecordsService from "@/lib/financial-records-service";
import { redirect } from "next/navigation";

vi.mock("@/lib/session", () => ({
  getSessionToken: vi.fn(),
}));

vi.mock("@/lib/accounts-service", () => ({
  getAccounts: vi.fn(),
}));

vi.mock("@/lib/categories-service", () => ({
  getCategories: vi.fn(),
}));

vi.mock("@/lib/financial-records-service", () => ({
  getFinancialRecords: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  redirect: vi.fn(),
}));

const mockAccount = {
  id: "acc-1",
  user_id: "usr-1",
  name: "Checking",
  type: "checking" as const,
  currency: "USD",
  is_active: true,
  created_at: "2026-09-08T00:00:00Z",
  updated_at: "2026-09-08T00:00:00Z",
};

const mockCategory = {
  id: "cat-1",
  user_id: "usr-1",
  name: "Groceries",
  type: "expense" as const,
  is_active: true,
  created_at: "2026-09-08T00:00:00Z",
  updated_at: "2026-09-08T00:00:00Z",
};

const mockRecord = {
  id: "rec-1",
  user_id: "usr-1",
  kind: "expense" as const,
  account_id: "acc-1",
  category_id: "cat-1",
  amount_minor: 1250,
  currency: "USD",
  date: "2026-09-13T00:00:00Z",
  note: "Coffee",
  is_active: true,
  created_at: "2026-09-13T00:00:00Z",
  updated_at: "2026-09-13T00:00:00Z",
};

describe("TransactionsPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it("redirects unauthenticated user to /login when token is missing", async () => {
    vi.mocked(session.getSessionToken).mockResolvedValue(null);

    await TransactionsPage();

    expect(redirect).toHaveBeenCalledWith("/login");
  });

  it("renders page with data when authenticated", async () => {
    vi.mocked(session.getSessionToken).mockResolvedValue("valid-token");
    vi.mocked(accountsService.getAccounts).mockResolvedValue({
      success: true,
      accounts: [mockAccount],
    });
    vi.mocked(categoriesService.getCategories).mockResolvedValue({
      success: true,
      categories: [mockCategory],
    });
    vi.mocked(financialRecordsService.getFinancialRecords).mockResolvedValue({
      success: true,
      records: [mockRecord],
    });

    const pageComponent = await TransactionsPage();
    render(pageComponent!);

    expect(screen.getByRole("heading", { name: "Transactions" })).toBeTruthy();
    expect(screen.getByText("Coffee")).toBeTruthy();
  });

  it("renders initialTab from searchParams when provided", async () => {
    vi.mocked(session.getSessionToken).mockResolvedValue("valid-token");
    vi.mocked(accountsService.getAccounts).mockResolvedValue({
      success: true,
      accounts: [mockAccount],
    });
    vi.mocked(categoriesService.getCategories).mockResolvedValue({
      success: true,
      categories: [mockCategory],
    });
    vi.mocked(financialRecordsService.getFinancialRecords).mockResolvedValue({
      success: true,
      records: [mockRecord],
    });

    const pageComponent = await TransactionsPage({
      searchParams: Promise.resolve({ tab: "expense" }),
    });
    render(pageComponent!);

    expect(screen.getByRole("tab", { name: /^expenses/i, selected: true })).toBeTruthy();
    expect(screen.getByRole("button", { name: /^add expense$/i })).toBeTruthy();
  });

  it("displays error message when services fail", async () => {
    vi.mocked(session.getSessionToken).mockResolvedValue("valid-token");
    vi.mocked(accountsService.getAccounts).mockResolvedValue({
      success: false,
      error: "Service failure",
    });
    vi.mocked(categoriesService.getCategories).mockResolvedValue({
      success: true,
      categories: [],
    });
    vi.mocked(financialRecordsService.getFinancialRecords).mockResolvedValue({
      success: true,
      records: [],
    });

    const pageComponent = await TransactionsPage();
    render(pageComponent!);

    expect(
      screen.getByText("We could not load your transaction workspace. Please refresh and try again."),
    ).toBeTruthy();
  });
});
