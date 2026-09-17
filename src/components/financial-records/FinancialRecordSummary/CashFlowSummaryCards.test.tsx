import { describe, it, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { CashFlowSummaryCards } from "./CashFlowSummaryCards";
import { FinancialRecord } from "@/lib/schemas/financial-records";
import { Category } from "@/lib/schemas/categories";

afterEach(() => {
  cleanup();
});

const mockCategories: Category[] = [
  { id: "cat-salary", user_id: "u1", name: "Salary", type: "income", is_active: true, created_at: "", updated_at: "" },
  { id: "cat-groceries", user_id: "u1", name: "Groceries", type: "expense", is_active: true, created_at: "", updated_at: "" },
];

const mockRecords: FinancialRecord[] = [
  {
    id: "r1",
    user_id: "u1",
    kind: "income",
    account_id: "acc1",
    category_id: "cat-salary",
    amount_minor: 10000000,
    currency: "LAK",
    date: "2026-09-13T00:00:00Z",
    note: "Monthly pay",
    is_active: true,
    created_at: "",
    updated_at: "",
  },
  {
    id: "r2",
    user_id: "u1",
    kind: "expense",
    account_id: "acc1",
    category_id: "cat-groceries",
    amount_minor: 2500000,
    currency: "LAK",
    date: "2026-09-12T00:00:00Z",
    note: "Supermarket",
    is_active: true,
    created_at: "",
    updated_at: "",
  },
];

import { TransactionTab } from "../FinancialRecordsTable/TransactionSubTabs";

describe("CashFlowSummaryCards", () => {
  it("renders inflow, outflow, and net cards on 'all' tab", () => {
    render(
      <CashFlowSummaryCards
        records={mockRecords}
        categories={mockCategories}
        activeTab={TransactionTab.All}
      />
    );

    expect(screen.getByTestId("summary-cards-all")).toBeTruthy();
    expect(screen.getByText("Total Inflow")).toBeTruthy();
    expect(screen.getByText("Total Outflow")).toBeTruthy();
    expect(screen.getByText("Net Cash Flow")).toBeTruthy();
    expect(screen.getByText(/\+LAK.*100,000\.00/)).toBeTruthy();
    expect(screen.getByText(/-LAK.*25,000\.00/)).toBeTruthy();
    expect(screen.getByText(/\+LAK.*75,000\.00/)).toBeTruthy();
  });

  it("renders income specific cards on 'income' tab", () => {
    render(
      <CashFlowSummaryCards
        records={mockRecords}
        categories={mockCategories}
        activeTab={TransactionTab.Income}
      />
    );

    expect(screen.getByTestId("summary-cards-income")).toBeTruthy();
    expect(screen.getByText("Total Received")).toBeTruthy();
    expect(screen.getByText("Income Streams")).toBeTruthy();
    expect(screen.getByText("Top Source")).toBeTruthy();
    expect(screen.getByText(/\+LAK.*100,000\.00/)).toBeTruthy();
    expect(screen.getByText("Salary")).toBeTruthy();
  });

  it("renders expense specific cards on 'expense' tab", () => {
    render(
      <CashFlowSummaryCards
        records={mockRecords}
        categories={mockCategories}
        activeTab={TransactionTab.Expense}
      />
    );

    expect(screen.getByTestId("summary-cards-expense")).toBeTruthy();
    expect(screen.getByText("Total Spending")).toBeTruthy();
    expect(screen.getByText("Expense Count")).toBeTruthy();
    expect(screen.getByText("Top Category")).toBeTruthy();
    expect(screen.getByText(/-LAK.*25,000\.00/)).toBeTruthy();
    expect(screen.getByText("Groceries")).toBeTruthy();
  });

  it("handles multi-currency records gracefully", () => {
    const multiCurrencyRecords: FinancialRecord[] = [
      ...mockRecords,
      {
        id: "r3",
        user_id: "u1",
        kind: "income",
        account_id: "acc2",
        category_id: "cat-salary",
        amount_minor: 5000,
        currency: "USD",
        date: "2026-09-13T00:00:00Z",
        note: "Consulting",
        is_active: true,
        created_at: "",
        updated_at: "",
      },
    ];

    render(
      <CashFlowSummaryCards
        records={multiCurrencyRecords}
        categories={mockCategories}
        activeTab={TransactionTab.All}
      />
    );

    expect(screen.getByText("+1 other currency")).toBeTruthy();
    expect(screen.getByText("Multi-currency")).toBeTruthy();
  });
});
