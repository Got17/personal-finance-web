import { describe, expect, it, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { CategorySummaryCards } from "./CategorySummaryCards";
import { Category } from "@/lib/schemas/categories";

const mockCategories: Category[] = [
  {
    id: "cat-1",
    user_id: "usr-1",
    name: "Salary",
    type: "income",
    is_active: true,
    created_at: "2026-09-08T00:00:00Z",
    updated_at: "2026-09-08T00:00:00Z",
  },
  {
    id: "cat-2",
    user_id: "usr-1",
    name: "Groceries",
    type: "expense",
    is_active: true,
    created_at: "2026-09-08T00:00:00Z",
    updated_at: "2026-09-08T00:00:00Z",
  },
  {
    id: "cat-3",
    user_id: "usr-1",
    name: "Dining Out",
    type: "expense",
    is_active: false,
    created_at: "2026-09-08T00:00:00Z",
    updated_at: "2026-09-08T00:00:00Z",
  },
];

import { CategoryTab } from "../CategoriesTable/CategorySubTabs";

describe("CategorySummaryCards", () => {
  afterEach(() => {
    cleanup();
  });

  it("renders 3 summary cards when activeTab is all", () => {
    render(<CategorySummaryCards categories={mockCategories} activeTab={CategoryTab.All} />);

    expect(screen.getByTestId("summary-cards-all")).toBeTruthy();
    expect(screen.getByText("Expense Categories")).toBeTruthy();
    expect(screen.getByText("Income Categories")).toBeTruthy();
    expect(screen.getByText("Total Classification")).toBeTruthy();
    expect(screen.getByText("1 active, 1 inactive")).toBeTruthy();
    expect(screen.getByText("2 active in workspace")).toBeTruthy();
  });

  it("renders expense summary cards when activeTab is expense", () => {
    render(<CategorySummaryCards categories={mockCategories} activeTab={CategoryTab.Expense} />);

    expect(screen.getByTestId("summary-cards-expense")).toBeTruthy();
    expect(screen.getByText("Total Expenses")).toBeTruthy();
    expect(screen.getByText("Active Categories")).toBeTruthy();
    expect(screen.getByText("Archived Categories")).toBeTruthy();
  });

  it("renders income summary cards when activeTab is income", () => {
    render(<CategorySummaryCards categories={mockCategories} activeTab={CategoryTab.Income} />);

    expect(screen.getByTestId("summary-cards-income")).toBeTruthy();
    expect(screen.getByText("Total Income")).toBeTruthy();
    expect(screen.getByText("Active Streams")).toBeTruthy();
    expect(screen.getByText("Archived Streams")).toBeTruthy();
  });
});
