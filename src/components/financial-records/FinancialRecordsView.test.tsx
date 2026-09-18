import { cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { FinancialRecordsView } from "./FinancialRecordsView";
import { TransactionTab } from "./FinancialRecordsTable/TransactionSubTabs";

const {
  createFinancialRecordAction,
  updateFinancialRecordAction,
  archiveFinancialRecordAction,
} = vi.hoisted(() => ({
  createFinancialRecordAction: vi.fn(),
  updateFinancialRecordAction: vi.fn(),
  archiveFinancialRecordAction: vi.fn(),
}));

vi.mock("@/app/actions/financial-records", () => ({
  createFinancialRecordAction,
  updateFinancialRecordAction,
  archiveFinancialRecordAction,
}));

const accounts = [
  {
    id: "account-1",
    user_id: "user-1",
    name: "Daily cash",
    type: "checking" as const,
    currency: "USD",
    is_active: true,
    created_at: "",
    updated_at: "",
  },
];

const categories = [
  {
    id: "expense-1",
    user_id: "user-1",
    name: "Groceries",
    type: "expense" as const,
    is_active: true,
    created_at: "",
    updated_at: "",
  },
  {
    id: "expense-2",
    user_id: "user-1",
    name: "Transportation",
    type: "expense" as const,
    is_active: true,
    created_at: "",
    updated_at: "",
  },
  {
    id: "income-1",
    user_id: "user-1",
    name: "Salary",
    type: "income" as const,
    is_active: true,
    created_at: "",
    updated_at: "",
  },
];

const initialExpense = {
  id: "record-1",
  user_id: "user-1",
  kind: "expense" as const,
  account_id: "account-1",
  category_id: "expense-1",
  amount_minor: 4268,
  currency: "USD",
  date: "2026-09-13T12:00:00.000Z",
  note: "Supermarket run",
  is_active: true,
  created_at: "",
  updated_at: "",
};

const initialIncome = {
  id: "record-2",
  user_id: "user-1",
  kind: "income" as const,
  account_id: "account-1",
  category_id: "income-1",
  amount_minor: 350000,
  currency: "USD",
  date: "2026-09-01T12:00:00.000Z",
  note: "Monthly Paycheck",
  is_active: true,
  created_at: "",
  updated_at: "",
};

describe("FinancialRecordsView", () => {
  beforeEach(() => {
    createFinancialRecordAction.mockReset();
    updateFinancialRecordAction.mockReset();
    archiveFinancialRecordAction.mockReset();
    window.history.replaceState(null, "", "/transactions");
    localStorage.clear();
  });

  afterEach(cleanup);

  it("renders sub-tabs with All active by default and shows all initial data", () => {
    render(
      <FinancialRecordsView
        initialRecords={[initialExpense, initialIncome]}
        accounts={accounts}
        categories={categories}
      />
    );

    expect(screen.getByRole("tab", { name: /^all/i, selected: true })).toBeTruthy();
    expect(screen.getByRole("heading", { name: "Transactions" })).toBeTruthy();
    const table = screen.getByRole("table");
    expect(screen.getByText("Supermarket run")).toBeTruthy();
    expect(within(table).getByText("-$42.68")).toBeTruthy();
    expect(screen.getByText("Monthly Paycheck")).toBeTruthy();
    expect(within(table).getByText("+$3,500.00")).toBeTruthy();
    expect(screen.getByTestId("summary-cards-all")).toBeTruthy();
  });

  it("switches to Expenses and Income tabs when clicked", () => {
    render(
      <FinancialRecordsView
        initialRecords={[initialExpense, initialIncome]}
        accounts={accounts}
        categories={categories}
      />
    );

    // Switch to Expenses
    const expenseTab = screen.getByRole("tab", { name: /expenses/i });
    fireEvent.click(expenseTab);
    expect(screen.getByRole("tab", { name: /^expenses/i, selected: true })).toBeTruthy();
    expect(screen.getByRole("button", { name: /Add new transaction or transfer/i })).toBeTruthy();
    expect(screen.getByText("Supermarket run")).toBeTruthy();
    expect(screen.queryByText("Monthly Paycheck")).toBeNull();

    // Switch to Income
    const incomeTab = screen.getByRole("tab", { name: /income/i });
    fireEvent.click(incomeTab);
    expect(screen.getByRole("tab", { name: /^income/i, selected: true })).toBeTruthy();
    expect(screen.getByRole("button", { name: /Add new transaction or transfer/i })).toBeTruthy();
    expect(screen.getByText("Monthly Paycheck")).toBeTruthy();
    expect(screen.queryByText("Supermarket run")).toBeNull();
  });

  it("filters transactions when category is selected from dropdown", () => {
    render(
      <FinancialRecordsView
        initialRecords={[initialExpense]}
        accounts={accounts}
        categories={categories}
      />
    );

    // Switch to Expenses tab
    fireEvent.click(screen.getByRole("tab", { name: /expenses/i }));

    const categorySelect = screen.getByRole("combobox", { name: /filter by category/i });
    expect(categorySelect).toBeTruthy();

    // Transportation has 0 records, Groceries has 1 record
    fireEvent.click(categorySelect);
    fireEvent.click(screen.getByRole("option", { name: /transportation/i }));

    expect(screen.getByText("No transactions match these filters.")).toBeTruthy();

    // Reset to All categories
    fireEvent.click(categorySelect);
    fireEvent.click(screen.getByRole("option", { name: /all categories/i }));

    expect(screen.getByText("Supermarket run")).toBeTruthy();
  });

  it("opens modal from Expenses tab, shows validation, and adds an expense", async () => {
    createFinancialRecordAction.mockResolvedValue({
      success: true,
      record: {
        id: "record-3",
        user_id: "user-1",
        kind: "expense" as const,
        account_id: "account-1",
        category_id: "expense-2",
        amount_minor: 2500,
        currency: "USD",
        date: "2026-09-13T12:00:00.000Z",
        note: "Gas fillup",
        is_active: true,
        created_at: "",
        updated_at: "",
      },
    });

    render(
      <FinancialRecordsView
        initialRecords={[]}
        accounts={accounts}
        categories={categories}
      />
    );

    // Switch to Expenses tab
    fireEvent.click(screen.getByRole("tab", { name: /expenses/i }));

    // Open modal via New action menu
    const newBtn = screen.getByRole("button", { name: /Add new transaction or transfer/i });
    fireEvent.click(newBtn);
    fireEvent.click(screen.getByRole("menuitem", { name: /Transaction/i }));

    expect(screen.getByRole("dialog")).toBeTruthy();

    const dialog = screen.getByRole("dialog");
    const submitBtn = within(dialog).getByRole("button", { name: /add expense/i });
    fireEvent.click(submitBtn);

    expect(screen.getByRole("alert").textContent).toContain("enter an amount greater than zero");

    // Fill valid amount and note
    fireEvent.change(screen.getByLabelText(/^amount/i), { target: { value: "25.00" } });
    fireEvent.change(screen.getByLabelText(/description/i), { target: { value: "Gas fillup" } });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.queryByRole("dialog")).toBeNull();
    });

    expect(screen.getByText("Gas fillup")).toBeTruthy();
    expect(within(screen.getByRole("table")).getByText("-$25.00")).toBeTruthy();
  });

  it("filters by date preset and allows custom date range selection", () => {
    render(
      <FinancialRecordsView
        initialRecords={[initialExpense, initialIncome]}
        accounts={accounts}
        categories={categories}
      />
    );

    const dateSelect = screen.getByRole("combobox", { name: /filter by date range/i });
    expect(dateSelect).toBeTruthy();

    // Selecting custom reveals From and To inputs
    expect(screen.queryByLabelText(/start date/i)).toBeNull();
    fireEvent.click(dateSelect);
    fireEvent.click(screen.getByRole("option", { name: /custom range/i }));
    expect(screen.getByLabelText(/start date/i)).toBeTruthy();
    expect(screen.getByLabelText(/end date/i)).toBeTruthy();

    // Set custom date that excludes initialExpense (2026-09-13) but includes initialIncome (2026-09-01)
    fireEvent.change(screen.getByLabelText(/start date/i), {
      target: { value: "2026-09-01" },
    });
    fireEvent.change(screen.getByLabelText(/end date/i), {
      target: { value: "2026-09-05" },
    });

    expect(screen.getByText("Monthly Paycheck")).toBeTruthy();
    expect(screen.queryByText("Supermarket run")).toBeNull();

    // Clear filters button should be present and resets filters
    const clearBtn = screen.getByRole("button", { name: /clear filters/i });
    fireEvent.click(clearBtn);

    expect(screen.getByText("Monthly Paycheck")).toBeTruthy();
    expect(screen.getByText("Supermarket run")).toBeTruthy();
    expect(screen.queryByLabelText(/start date/i)).toBeNull();
  });

  it("filters by account and resets with clear filters", () => {
    const secondAccount = {
      id: "account-2",
      user_id: "user-1",
      name: "Savings",
      type: "savings" as const,
      currency: "USD",
      is_active: true,
      created_at: "",
      updated_at: "",
    };

    render(
      <FinancialRecordsView
        initialRecords={[initialExpense]}
        accounts={[accounts[0], secondAccount]}
        categories={categories}
      />
    );

    const accountSelect = screen.getByRole("combobox", { name: /filter by account/i });
    fireEvent.click(accountSelect);
    fireEvent.click(screen.getByRole("option", { name: /savings/i }));

    expect(screen.getByText("No transactions match these filters.")).toBeTruthy();

    const clearBtn = screen.getByRole("button", { name: /clear filters/i });
    fireEvent.click(clearBtn);

    expect(screen.getByText("Supermarket run")).toBeTruthy();
  });

  it("filters by category and resets with clear filters", () => {
    render(
      <FinancialRecordsView
        initialRecords={[initialExpense]}
        accounts={accounts}
        categories={categories}
      />
    );

    const categorySelect = screen.getByRole("combobox", { name: /filter by category/i });
    fireEvent.click(categorySelect);
    fireEvent.click(screen.getByRole("option", { name: /transportation/i }));

    expect(screen.getByText("No transactions match these filters.")).toBeTruthy();

    const clearBtn = screen.getByRole("button", { name: /clear filters/i });
    fireEvent.click(clearBtn);

    expect(screen.getByText("Supermarket run")).toBeTruthy();
  });

  it("opens edit modal when edit button is clicked and updates transaction", async () => {
    updateFinancialRecordAction.mockResolvedValue({
      success: true,
      record: {
        ...initialExpense,
        note: "Organic market",
        amount_minor: 5000,
      },
    });

    render(
      <FinancialRecordsView
        initialRecords={[initialExpense]}
        accounts={accounts}
        categories={categories}
      />,
    );

    const editButton = screen.getByRole("button", { name: "Edit Supermarket run" });
    fireEvent.click(editButton);

    expect(screen.getByRole("dialog")).toBeTruthy();
    expect(screen.getByRole("heading", { name: "Edit Transaction" })).toBeTruthy();

    fireEvent.change(screen.getByLabelText(/description/i), {
      target: { value: "Organic market" },
    });
    fireEvent.change(screen.getByLabelText(/^amount/i), {
      target: { value: "50.00" },
    });

    fireEvent.click(screen.getByRole("button", { name: /save changes/i }));

    await waitFor(() => {
      expect(screen.queryByRole("dialog")).toBeNull();
    });

    expect(screen.getByText("Organic market")).toBeTruthy();
    expect(within(screen.getByRole("table")).getByText("-$50.00")).toBeTruthy();
  });

  it("opens delete modal when delete button is clicked and removes transaction on confirmation", async () => {
    archiveFinancialRecordAction.mockResolvedValue({
      success: true,
      record: {
        ...initialExpense,
        is_active: false,
      },
    });

    render(
      <FinancialRecordsView
        initialRecords={[initialExpense, initialIncome]}
        accounts={accounts}
        categories={categories}
      />,
    );

    expect(screen.getByText("2 items")).toBeTruthy();

    const deleteButton = screen.getByRole("button", { name: "Delete Supermarket run" });
    fireEvent.click(deleteButton);

    expect(screen.getByRole("dialog")).toBeTruthy();
    expect(screen.getByRole("heading", { name: "Delete Transaction" })).toBeTruthy();

    const dialog = screen.getByRole("dialog");
    const confirmDeleteBtn = within(dialog).getByRole("button", { name: /^delete$/i });
    fireEvent.click(confirmDeleteBtn);

    await waitFor(() => {
      expect(screen.queryByRole("dialog")).toBeNull();
    });

    expect(screen.queryByText("Supermarket run")).toBeNull();
    expect(screen.getByText("1 items")).toBeTruthy();
  });

  it("respects initialTab prop and activates Expenses tab directly", () => {
    render(
      <FinancialRecordsView
        initialTab={TransactionTab.Expense}
        initialRecords={[initialExpense, initialIncome]}
        accounts={accounts}
        categories={categories}
      />
    );

    expect(screen.getByRole("tab", { name: /^expenses/i, selected: true })).toBeTruthy();
    expect(screen.getByRole("button", { name: /Add new transaction or transfer/i })).toBeTruthy();
    expect(screen.getByText("Supermarket run")).toBeTruthy();
    expect(screen.queryByText("Monthly Paycheck")).toBeNull();
  });

  it("saves tab to localStorage and updates URL query string on tab change", () => {
    const replaceStateSpy = vi.spyOn(window.history, "replaceState");
    const setItemSpy = vi.spyOn(Storage.prototype, "setItem");

    render(
      <FinancialRecordsView
        initialRecords={[initialExpense, initialIncome]}
        accounts={accounts}
        categories={categories}
      />
    );

    const expenseTab = screen.getByRole("tab", { name: /expenses/i });
    fireEvent.click(expenseTab);

    expect(setItemSpy).toHaveBeenCalledWith("pf_transactions_active_tab", "expense");
    expect(replaceStateSpy).toHaveBeenCalled();
  });

  it("restores active tab from localStorage if no initialTab was specified", async () => {
    vi.spyOn(Storage.prototype, "getItem").mockReturnValue("income");

    render(
      <FinancialRecordsView
        initialRecords={[initialExpense, initialIncome]}
        accounts={accounts}
        categories={categories}
      />
    );

    await waitFor(() => {
      expect(screen.getByRole("tab", { name: /^income/i, selected: true })).toBeTruthy();
    });
    expect(screen.getByRole("button", { name: /Add new transaction or transfer/i })).toBeTruthy();
    expect(screen.getByText("Monthly Paycheck")).toBeTruthy();
    expect(screen.queryByText("Supermarket run")).toBeNull();
  });

  it("opens Add Income modal when selecting Transaction from New menu on Income tab", async () => {
    vi.spyOn(Storage.prototype, "getItem").mockReturnValue(null);
    createFinancialRecordAction.mockResolvedValueOnce({
      success: true,
      record: {
        id: "record-new-inc",
        user_id: "user-1",
        kind: "income" as const,
        account_id: "account-1",
        category_id: "income-1",
        amount_minor: 500000,
        currency: "USD",
        date: "2026-09-17T12:00:00.000Z",
        note: "Consulting bonus",
        is_active: true,
        created_at: "",
        updated_at: "",
      },
    });

    render(
      <FinancialRecordsView
        initialRecords={[initialExpense, initialIncome]}
        accounts={accounts}
        categories={categories}
      />
    );

    const incomeTab = screen.getByRole("tab", { name: /income/i });
    fireEvent.click(incomeTab);

    const newBtn = screen.getByRole("button", { name: /Add new transaction or transfer/i });
    fireEvent.click(newBtn);
    fireEvent.click(screen.getByRole("menuitem", { name: /Transaction/i }));

    const dialog = screen.getByRole("dialog");
    expect(within(dialog).getByText("Add New Income")).toBeTruthy();
    expect(
      within(dialog).getByText("Record an income stream into your selected account.")
    ).toBeTruthy();

    const submitBtn = within(dialog).getByRole("button", { name: /^add income$/i });
    expect(submitBtn).toBeTruthy();

    // Verify income categories are available
    expect(within(dialog).getAllByText("Salary").length).toBeGreaterThan(0);

    // Fill form and submit
    fireEvent.change(within(dialog).getByLabelText(/^amount/i), {
      target: { value: "5000.00" },
    });
    fireEvent.change(within(dialog).getByLabelText(/description/i), {
      target: { value: "Consulting bonus" },
    });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.queryByRole("dialog")).toBeNull();
    });

    expect(createFinancialRecordAction).toHaveBeenCalledWith(
      expect.objectContaining({
        kind: "income",
        amount_minor: 500000,
        note: "Consulting bonus",
      })
    );
  });
});
