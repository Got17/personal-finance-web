import { describe, expect, it, vi, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { CategoriesTable } from "./CategoriesTable";
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

describe("CategoriesTable", () => {
  afterEach(() => {
    cleanup();
  });

  it("renders table with category rows and badges", () => {
    render(<CategoriesTable categories={mockCategories} />);

    expect(screen.getByRole("table", { name: "Categories table" })).toBeTruthy();
    expect(screen.getByText("Salary")).toBeTruthy();
    expect(screen.getByText("Groceries")).toBeTruthy();
    expect(screen.getByText("Income")).toBeTruthy();
    expect(screen.getByText("Expense")).toBeTruthy();
  });

  it("renders empty state when categories array is empty", () => {
    render(<CategoriesTable categories={[]} />);

    expect(screen.getByText("No categories match your filters.")).toBeTruthy();
  });

  it("calls onEdit when edit button is clicked", () => {
    const onEdit = vi.fn();
    render(<CategoriesTable categories={mockCategories} onEdit={onEdit} />);

    const editBtn = screen.getByRole("button", { name: "Edit Salary" });
    fireEvent.click(editBtn);
    expect(onEdit).toHaveBeenCalledWith(mockCategories[0]);
  });

  it("calls onDeactivate when deactivate button is clicked for active category only", () => {
    const onDeactivate = vi.fn();
    render(<CategoriesTable categories={mockCategories} onDeactivate={onDeactivate} />);

    const deactivateBtn = screen.getByRole("button", { name: "Deactivate Salary" });
    fireEvent.click(deactivateBtn);
    expect(onDeactivate).toHaveBeenCalledWith(mockCategories[0]);

    expect(screen.queryByRole("button", { name: "Deactivate Groceries" })).toBeNull();
  });
});
