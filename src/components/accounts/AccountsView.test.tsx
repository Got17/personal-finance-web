import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { AccountsView } from "./AccountsView";
import { Account } from "@/lib/schemas/accounts";
import * as currenciesActions from "@/app/actions/currencies";

vi.mock("@/app/actions/currencies", () => ({
  getCurrenciesAction: vi.fn(),
}));

const mockChecking: Account = {
  id: "acc-1",
  user_id: "usr-1",
  name: "Everyday Checking",
  type: "checking",
  currency: "USD",
  description: "Primary account",
  is_active: true,
  created_at: "2026-09-07T00:00:00Z",
  updated_at: "2026-09-07T00:00:00Z",
};

const mockCredit: Account = {
  id: "acc-2",
  user_id: "usr-1",
  name: "Sapphire Preferred",
  type: "credit_card",
  currency: "USD",
  description: "Travel card",
  is_active: false,
  created_at: "2026-09-07T00:00:00Z",
  updated_at: "2026-09-07T00:00:00Z",
};

const mockInvestment: Account = {
  id: "acc-3",
  user_id: "usr-1",
  name: "Vanguard Brokerage",
  type: "investment",
  currency: "USD",
  description: "Index funds",
  is_active: true,
  created_at: "2026-09-07T00:00:00Z",
  updated_at: "2026-09-07T00:00:00Z",
};

const mockAccounts = [mockChecking, mockCredit, mockInvestment];

describe("AccountsView", () => {
  beforeEach(() => {
    window.history.replaceState(null, "", "/accounts");
    localStorage.clear();
    vi.mocked(currenciesActions.getCurrenciesAction).mockResolvedValue({
      success: true,
      currencies: [{ code: "USD", name: "US Dollar", symbol: "$", decimal_digits: 2 }],
    });
  });

  afterEach(() => {
    cleanup();
  });

  it("renders PageHeader with Accounts title and Add Account action button, plus table rows", () => {
    render(<AccountsView initialAccounts={mockAccounts} defaultCurrency="USD" />);

    expect(screen.getByRole("heading", { name: "Accounts" })).toBeTruthy();
    expect(screen.getByRole("button", { name: /Add new account/i })).toBeTruthy();
    expect(screen.getByText("Add Account")).toBeTruthy();

    expect(screen.getByText("Everyday Checking")).toBeTruthy();
    expect(screen.getByText("Sapphire Preferred")).toBeTruthy();
    expect(screen.getByText("Vanguard Brokerage")).toBeTruthy();
    expect(screen.getByText("3 accounts")).toBeTruthy();
  });

  it("opens pop-up modal when Add button is clicked and closes on close button click", () => {
    render(<AccountsView initialAccounts={[]} defaultCurrency="USD" />);

    const addButton = screen.getByRole("button", { name: /Add new account/i });
    fireEvent.click(addButton);

    expect(screen.getByTestId("create-account-modal")).toBeTruthy();
    expect(screen.getByRole("heading", { name: "Add New Account" })).toBeTruthy();

    const closeButton = screen.getByRole("button", { name: "Close modal" });
    fireEvent.click(closeButton);

    expect(screen.queryByTestId("create-account-modal")).toBeNull();
  });

  it("opens Edit modal when Edit button in table is clicked", () => {
    render(<AccountsView initialAccounts={mockAccounts} defaultCurrency="USD" />);

    const editBtn = screen.getByRole("button", { name: "Edit Everyday Checking" });
    fireEvent.click(editBtn);

    expect(screen.getByTestId("edit-account-modal")).toBeTruthy();
    expect(screen.getByRole("heading", { name: "Edit Account" })).toBeTruthy();
  });

  it("opens Deactivate modal when Deactivate button in table is clicked", () => {
    render(<AccountsView initialAccounts={mockAccounts} defaultCurrency="USD" />);

    const deactivateBtn = screen.getByRole("button", { name: "Deactivate Everyday Checking" });
    fireEvent.click(deactivateBtn);

    expect(screen.getByTestId("deactivate-account-modal")).toBeTruthy();
    expect(screen.getByRole("heading", { name: "Deactivate Account" })).toBeTruthy();
  });

  it("filters accounts by sub-tab and updates action button label", () => {
    render(<AccountsView initialAccounts={mockAccounts} defaultCurrency="USD" />);

    // Switch to Banking tab
    const bankingTab = screen.getByRole("tab", { name: /Banking/i });
    fireEvent.click(bankingTab);

    expect(screen.getByText("Add Bank Account")).toBeTruthy();
    expect(screen.getByText("Everyday Checking")).toBeTruthy();
    expect(screen.queryByText("Sapphire Preferred")).toBeNull();
    expect(screen.queryByText("Vanguard Brokerage")).toBeNull();

    // Switch to Credit & Loans tab
    const creditTab = screen.getByRole("tab", { name: /Credit & Loans/i });
    fireEvent.click(creditTab);

    expect(screen.getByText("Add Credit Account")).toBeTruthy();
    expect(screen.getByText("Sapphire Preferred")).toBeTruthy();
    expect(screen.queryByText("Everyday Checking")).toBeNull();
    expect(screen.queryByText("Vanguard Brokerage")).toBeNull();

    // Switch to Investments tab
    const investmentTab = screen.getByRole("tab", { name: /Investments/i });
    fireEvent.click(investmentTab);

    expect(screen.getByText("Add Investment Account")).toBeTruthy();
    expect(screen.getByText("Vanguard Brokerage")).toBeTruthy();
    expect(screen.queryByText("Everyday Checking")).toBeNull();
    expect(screen.queryByText("Sapphire Preferred")).toBeNull();
  });

  it("filters accounts by search query and allows clearing filters", () => {
    render(<AccountsView initialAccounts={mockAccounts} defaultCurrency="USD" />);

    const searchInput = screen.getByPlaceholderText("Search accounts...");
    fireEvent.change(searchInput, { target: { value: "Vanguard" } });

    expect(screen.getByText("Vanguard Brokerage")).toBeTruthy();
    expect(screen.queryByText("Everyday Checking")).toBeNull();
    expect(screen.queryByText("Sapphire Preferred")).toBeNull();
    expect(screen.getByText("1 account")).toBeTruthy();

    const clearButton = screen.getByRole("button", { name: /Clear filters/i });
    fireEvent.click(clearButton);

    expect(screen.getByText("Everyday Checking")).toBeTruthy();
    expect(screen.getByText("Sapphire Preferred")).toBeTruthy();
    expect(screen.getByText("Vanguard Brokerage")).toBeTruthy();
    expect(screen.getByText("3 accounts")).toBeTruthy();
  });

  it("filters accounts by status dropdown", () => {
    render(<AccountsView initialAccounts={mockAccounts} defaultCurrency="USD" />);

    const statusDropdown = screen.getByRole("combobox", { name: /Filter by status/i });
    fireEvent.click(statusDropdown);

    const activeOnly = screen.getByRole("option", { name: "Active only" });
    fireEvent.click(activeOnly);

    expect(screen.getByText("Everyday Checking")).toBeTruthy();
    expect(screen.getByText("Vanguard Brokerage")).toBeTruthy();
    expect(screen.queryByText("Sapphire Preferred")).toBeNull();
    expect(screen.getByText("2 accounts")).toBeTruthy();
  });

  it("renders Transfer button in header when at least 2 active accounts exist, and opens modal on click", () => {
    render(<AccountsView initialAccounts={mockAccounts} defaultCurrency="USD" />);

    const transferHeaderBtn = screen.getByRole("button", { name: /^transfer$/i });
    expect(transferHeaderBtn).toBeTruthy();

    fireEvent.click(transferHeaderBtn);

    expect(screen.getByRole("dialog")).toBeTruthy();
    expect(screen.getByRole("heading", { name: "Transfer Funds" })).toBeTruthy();
  });

  it("renders row transfer action button for active accounts and opens modal with preselected source account", () => {
    render(<AccountsView initialAccounts={mockAccounts} defaultCurrency="USD" />);

    const rowTransferBtn = screen.getByRole("button", { name: "Transfer from Everyday Checking" });
    expect(rowTransferBtn).toBeTruthy();

    fireEvent.click(rowTransferBtn);

    expect(screen.getByRole("dialog")).toBeTruthy();
    expect(screen.getByRole("heading", { name: "Transfer Funds" })).toBeTruthy();
  });

  it("does not render Transfer button in header when fewer than 2 active accounts exist", () => {
    render(<AccountsView initialAccounts={[mockChecking]} defaultCurrency="USD" />);

    expect(screen.queryByRole("button", { name: /^transfer$/i })).toBeNull();
  });
});


