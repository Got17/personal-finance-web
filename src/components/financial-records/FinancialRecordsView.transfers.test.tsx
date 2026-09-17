import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, within, cleanup } from "@testing-library/react";
import { FinancialRecordsView } from "./FinancialRecordsView";
import { FinancialRecord } from "@/lib/schemas/financial-records";
import { Account } from "@/lib/schemas/accounts";
import { Category } from "@/lib/schemas/categories";

const mockAccounts: Account[] = [
  {
    id: "acc-usd-1",
    user_id: "user-1",
    name: "Main Checking",
    type: "checking",
    currency: "USD",
    is_active: true,
    created_at: "2026-01-01T00:00:00.000Z",
    updated_at: "2026-01-01T00:00:00.000Z",
  },
  {
    id: "acc-usd-2",
    user_id: "user-1",
    name: "High-Yield Savings",
    type: "checking",
    currency: "USD",
    is_active: true,
    created_at: "2026-01-01T00:00:00.000Z",
    updated_at: "2026-01-01T00:00:00.000Z",
  },
  {
    id: "acc-eur-1",
    user_id: "user-1",
    name: "Euro Travel",
    type: "checking",
    currency: "EUR",
    is_active: true,
    created_at: "2026-01-01T00:00:00.000Z",
    updated_at: "2026-01-01T00:00:00.000Z",
  },
];

const mockCategories: Category[] = [
  {
    id: "cat-fee",
    user_id: "user-1",
    name: "Bank Fees",
    type: "expense",
    is_active: true,
    created_at: "2026-01-01T00:00:00.000Z",
    updated_at: "2026-01-01T00:00:00.000Z",
  },
  {
    id: "cat-groceries",
    user_id: "user-1",
    name: "Groceries",
    type: "expense",
    is_active: true,
    created_at: "2026-01-01T00:00:00.000Z",
    updated_at: "2026-01-01T00:00:00.000Z",
  },
];

const mockRecords: FinancialRecord[] = [
  {
    id: "rec-transfer-same",
    user_id: "user-1",
    kind: "transfer",
    account_id: "acc-usd-1",
    destination_account_id: "acc-usd-2",
    amount_minor: 50000,
    destination_amount_minor: 50000,
    currency: "USD",
    destination_currency: "USD",
    date: "2026-09-17T12:00:00.000Z",
    note: "Emergency fund transfer",
    is_active: true,
    created_at: "2026-09-17T12:00:00.000Z",
    updated_at: "2026-09-17T12:00:00.000Z",
  },
  {
    id: "rec-transfer-cross",
    user_id: "user-1",
    kind: "transfer",
    account_id: "acc-usd-1",
    destination_account_id: "acc-eur-1",
    amount_minor: 10000,
    destination_amount_minor: 9200,
    currency: "USD",
    destination_currency: "EUR",
    date: "2026-09-16T12:00:00.000Z",
    note: "Vacation exchange",
    is_active: true,
    created_at: "2026-09-16T12:00:00.000Z",
    updated_at: "2026-09-16T12:00:00.000Z",
  },
  {
    id: "rec-fee",
    user_id: "user-1",
    kind: "expense",
    account_id: "acc-usd-1",
    category_id: "cat-fee",
    amount_minor: 300,
    currency: "USD",
    date: "2026-09-16T12:00:00.000Z",
    note: "FX Wire Fee",
    linked_transfer_id: "rec-transfer-cross",
    is_active: true,
    created_at: "2026-09-16T12:00:00.000Z",
    updated_at: "2026-09-16T12:00:00.000Z",
  },
];

describe("FinancialRecordsView transfers", () => {
  beforeEach(() => {
    localStorage.clear();
    window.history.replaceState(null, "", "/");
    vi.clearAllMocks();
  });

  afterEach(() => {
    localStorage.clear();
    cleanup();
  });

  it("displays Transfers sub-tab with count and renders same and cross-currency transfers", () => {
    render(
      <FinancialRecordsView
        initialRecords={mockRecords}
        accounts={mockAccounts}
        categories={mockCategories}
      />
    );

    // Subtabs: All (3), Expenses (1), Income (0), Transfers (2)
    const transferTab = screen.getByRole("tab", { name: /Transfers/i });
    expect(transferTab).toBeTruthy();
    expect(within(transferTab).getByText("2")).toBeTruthy();

    // Table rows: check notes and account descriptions
    expect(screen.getByText("Emergency fund transfer")).toBeTruthy();
    expect(screen.getByText("Main Checking → High-Yield Savings")).toBeTruthy();
    expect(screen.getByText("Vacation exchange")).toBeTruthy();
    expect(screen.getByText("Main Checking → Euro Travel")).toBeTruthy();

    // Cross currency display: $100.00 → €92.00
    expect(screen.getByText(/\$100\.00 → €92\.00/)).toBeTruthy();

    // Linked fee display with Fee tag
    expect(screen.getByText("FX Wire Fee")).toBeTruthy();
    expect(screen.getByText("Fee")).toBeTruthy();
  });

  it("filters to only transfers when Transfers sub-tab is selected", () => {
    render(
      <FinancialRecordsView
        initialRecords={mockRecords}
        accounts={mockAccounts}
        categories={mockCategories}
      />
    );

    const transferTab = screen.getByRole("tab", { name: /Transfers/i });
    fireEvent.click(transferTab);

    // Should only show the 2 transfers, NOT the fee expense
    expect(screen.getByText("Emergency fund transfer")).toBeTruthy();
    expect(screen.getByText("Vacation exchange")).toBeTruthy();
    expect(screen.queryByText("FX Wire Fee")).toBeNull();

    // Primary action button updates to Transfer Funds
    expect(screen.getByRole("button", { name: /Transfer Funds/i })).toBeTruthy();
  });

  it("opens CreateTransferModal when clicking Transfer button", () => {
    render(
      <FinancialRecordsView
        initialRecords={mockRecords}
        accounts={mockAccounts}
        categories={mockCategories}
      />
    );

    // On "All" tab, click "Transfer" action button
    const transferBtn = screen.getByRole("button", { name: /^Transfer$/i });
    fireEvent.click(transferBtn);

    expect(screen.getByTestId("create-transfer-modal")).toBeTruthy();
  });
});
