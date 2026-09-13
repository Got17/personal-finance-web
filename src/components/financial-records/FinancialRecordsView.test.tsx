import { cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { FinancialRecordsView } from "./FinancialRecordsView";

const { createFinancialRecordAction } = vi.hoisted(() => ({
  createFinancialRecordAction: vi.fn(),
}));

vi.mock("@/app/actions/financial-records", () => ({
  createFinancialRecordAction,
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
    expect(screen.getByRole("heading", { name: "Transactions Management" })).toBeTruthy();
    expect(screen.getByRole("button", { name: /^add transaction$/i })).toBeTruthy();
    expect(screen.getByText("Supermarket run")).toBeTruthy();
    expect(screen.getByText("-$42.68")).toBeTruthy();
    expect(screen.getByText("Monthly Paycheck")).toBeTruthy();
    expect(screen.getByText("+$3,500.00")).toBeTruthy();
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
    expect(screen.getByRole("heading", { name: "Expenses Management" })).toBeTruthy();
    expect(screen.getByRole("button", { name: /^add expense$/i })).toBeTruthy();
    expect(screen.getByText("Supermarket run")).toBeTruthy();
    expect(screen.queryByText("Monthly Paycheck")).toBeNull();

    // Switch to Income
    const incomeTab = screen.getByRole("tab", { name: /income/i });
    fireEvent.click(incomeTab);
    expect(screen.getByRole("heading", { name: "Income Management" })).toBeTruthy();
    expect(screen.getByRole("button", { name: /^add income$/i })).toBeTruthy();
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
    fireEvent.change(categorySelect, { target: { value: "expense-2" } });

    expect(screen.getByText("No transactions match these filters.")).toBeTruthy();

    // Reset to All categories
    fireEvent.change(categorySelect, { target: { value: "" } });

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

    // Open modal
    const addExpenseBtn = screen.getByRole("button", { name: /^add expense$/i });
    fireEvent.click(addExpenseBtn);

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
    expect(screen.getByText("-$25.00")).toBeTruthy();
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
    fireEvent.change(dateSelect, { target: { value: "custom" } });
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
    fireEvent.change(accountSelect, { target: { value: "account-2" } });

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
    fireEvent.change(categorySelect, { target: { value: "expense-2" } });

    expect(screen.getByText("No transactions match these filters.")).toBeTruthy();

    const clearBtn = screen.getByRole("button", { name: /clear filters/i });
    fireEvent.click(clearBtn);

    expect(screen.getByText("Supermarket run")).toBeTruthy();
  });
});
