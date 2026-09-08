import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { CategoriesList } from "./CategoriesList";
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
    is_active: false,
    created_at: "2026-09-08T00:00:00Z",
    updated_at: "2026-09-08T00:00:00Z",
  },
];

describe("CategoriesList", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it("renders empty state when categories array is empty", () => {
    const mockOnAddClick = vi.fn();
    render(<CategoriesList categories={[]} onAddClick={mockOnAddClick} />);

    expect(screen.getByText("No categories yet")).toBeTruthy();
    const addBtn = screen.getByRole("button", { name: /\+ Add Category/i });
    fireEvent.click(addBtn);
    expect(mockOnAddClick).toHaveBeenCalledTimes(1);
  });

  it("renders category items with category type visible", () => {
    render(<CategoriesList categories={mockCategories} />);

    expect(screen.getByText("Salary")).toBeTruthy();
    expect(screen.getByText("Groceries")).toBeTruthy();
    expect(screen.getByText("Income")).toBeTruthy();
    expect(screen.getByText("Expense")).toBeTruthy();
  });

  it("filters category list when tab filter is selected", () => {
    render(<CategoriesList categories={mockCategories} />);

    const incomeTab = screen.getByRole("tab", { name: "Income (1)" });
    fireEvent.click(incomeTab);

    expect(screen.getByText("Salary")).toBeTruthy();
    expect(screen.queryByText("Groceries")).toBeNull();

    const expenseTab = screen.getByRole("tab", { name: "Expense (1)" });
    fireEvent.click(expenseTab);

    expect(screen.queryByText("Salary")).toBeNull();
    expect(screen.getByText("Groceries")).toBeTruthy();
  });

  it("calls onEditClick when edit button is clicked", () => {
    const onEditClick = vi.fn();
    render(<CategoriesList categories={mockCategories} onEditClick={onEditClick} />);

    const editBtn = screen.getByRole("button", { name: "Edit Salary" });
    fireEvent.click(editBtn);

    expect(onEditClick).toHaveBeenCalledWith(mockCategories[0]);
  });

  it("calls onDeactivateClick for active category and hides deactivate for inactive category", () => {
    const onDeactivateClick = vi.fn();
    render(
      <CategoriesList
        categories={mockCategories}
        onDeactivateClick={onDeactivateClick}
      />,
    );

    const deactivateBtn = screen.getByRole("button", { name: "Deactivate Salary" });
    fireEvent.click(deactivateBtn);
    expect(onDeactivateClick).toHaveBeenCalledWith(mockCategories[0]);

    expect(screen.queryByRole("button", { name: "Deactivate Groceries" })).toBeNull();
  });
});
