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

  it("renders sub-tabs for Expenses and Income and shows initial data", () => {
    render(
      <FinancialRecordsView
        initialRecords={[initialExpense, initialIncome]}
        accounts={accounts}
        categories={categories}
      />
    );

    expect(screen.getByRole("heading", { name: "Expenses Management" })).toBeTruthy();
    expect(screen.getByText("Supermarket run")).toBeTruthy();
    expect(screen.getByText("-$42.68")).toBeTruthy();
  });

  it("switches to Income tab when clicked", () => {
    render(
      <FinancialRecordsView
        initialRecords={[initialExpense, initialIncome]}
        accounts={accounts}
        categories={categories}
      />
    );

    const incomeTab = screen.getByRole("tab", { name: /income/i });
    fireEvent.click(incomeTab);

    expect(screen.getByRole("heading", { name: "Income Management" })).toBeTruthy();
    expect(screen.getByText("Monthly Paycheck")).toBeTruthy();
    expect(screen.getByText("+$3,500.00")).toBeTruthy();
  });

  it("filters transactions when category pill is selected", () => {
    render(
      <FinancialRecordsView
        initialRecords={[initialExpense]}
        accounts={accounts}
        categories={categories}
      />
    );

    // Transportation has 0 records, Groceries has 1 record
    const transportPill = screen.getByRole("button", { name: /transportation/i });
    fireEvent.click(transportPill);

    expect(screen.getByText("No transactions match these filters.")).toBeTruthy();

    const allPill = screen.getByRole("button", { name: /^all/i });
    fireEvent.click(allPill);

    expect(screen.getByText("Supermarket run")).toBeTruthy();
  });

  it("opens modal, shows validation, and adds an expense", async () => {
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

    // Open modal
    const addExpenseBtn = screen.getByRole("button", { name: /^add expense$/i });
    fireEvent.click(addExpenseBtn);

    expect(screen.getByRole("dialog")).toBeTruthy();

    const dialog = screen.getByRole("dialog");
    const submitBtn = within(dialog).getByRole("button", { name: /\+ add expense/i });
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
});
