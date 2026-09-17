import { describe, expect, it, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { CategoriesView } from "./CategoriesView";
import { Category } from "@/lib/schemas/categories";

const mockInitialCategory: Category = {
  id: "cat-1",
  user_id: "usr-1",
  name: "Salary",
  type: "income",
  is_active: true,
  created_at: "2026-09-08T00:00:00Z",
  updated_at: "2026-09-08T00:00:00Z",
};

const mockExpenseCategory: Category = {
  id: "cat-2",
  user_id: "usr-1",
  name: "Groceries",
  type: "expense",
  is_active: true,
  created_at: "2026-09-08T00:00:00Z",
  updated_at: "2026-09-08T00:00:00Z",
};

describe("CategoriesView", () => {
  beforeEach(() => {
    window.history.replaceState(null, "", "/categories");
    localStorage.clear();
  });

  afterEach(() => {
    cleanup();
  });

  it("renders initial categories list and Add button with modal closed", () => {
    render(<CategoriesView initialCategories={[mockInitialCategory]} />);

    expect(screen.getByRole("heading", { name: "Categories" })).toBeTruthy();
    expect(screen.getByText("1 category")).toBeTruthy();
    expect(screen.getByText("Salary")).toBeTruthy();
    expect(screen.getByRole("button", { name: /Add new category/i })).toBeTruthy();
    expect(screen.queryByTestId("create-category-modal")).toBeNull();
  });

  it("opens modal when Add button is clicked and closes on close button click", () => {
    render(<CategoriesView initialCategories={[]} />);

    const addButton = screen.getByRole("button", { name: /Add new category/i });
    fireEvent.click(addButton);

    expect(screen.getByTestId("create-category-modal")).toBeTruthy();
    expect(screen.getByRole("heading", { name: "Add New Category" })).toBeTruthy();

    const closeButton = screen.getByRole("button", { name: "Close modal" });
    fireEvent.click(closeButton);

    expect(screen.queryByTestId("create-category-modal")).toBeNull();
  });

  it("opens EditCategoryModal when Edit button is clicked", () => {
    render(<CategoriesView initialCategories={[mockInitialCategory]} />);

    const editButton = screen.getByRole("button", { name: "Edit Salary" });
    fireEvent.click(editButton);

    expect(screen.getByTestId("edit-category-modal")).toBeTruthy();
    expect(screen.getByRole("heading", { name: "Edit Category" })).toBeTruthy();
  });

  it("opens DeactivateCategoryModal when Deactivate button is clicked", () => {
    render(<CategoriesView initialCategories={[mockInitialCategory]} />);

    const deactivateButton = screen.getByRole("button", { name: "Deactivate Salary" });
    fireEvent.click(deactivateButton);

    expect(screen.getByTestId("deactivate-category-modal")).toBeTruthy();
    expect(screen.getByRole("heading", { name: "Deactivate Category" })).toBeTruthy();
  });

  it("switches sub-tabs and dynamically updates title and action button text", () => {
    render(
      <CategoriesView
        initialCategories={[mockInitialCategory, mockExpenseCategory]}
      />
    );

    // Initial state: All
    expect(screen.getByRole("heading", { name: "Categories" })).toBeTruthy();
    expect(screen.getByRole("button", { name: /Add new category/i }).textContent).toContain("Add Category");

    // Click Expenses tab
    const expensesTab = screen.getByRole("tab", { name: /expenses/i });
    fireEvent.click(expensesTab);

    expect(screen.getByRole("tab", { name: /expenses/i, selected: true })).toBeTruthy();
    expect(screen.getByRole("button", { name: /Add new category/i }).textContent).toContain("Add Expense Category");
    expect(screen.getByText("Groceries")).toBeTruthy();
    expect(screen.queryByText("Salary")).toBeNull();

    // Click Income tab
    const incomeTab = screen.getByRole("tab", { name: /income/i });
    fireEvent.click(incomeTab);

    expect(screen.getByRole("tab", { name: /income/i, selected: true })).toBeTruthy();
    expect(screen.getByRole("button", { name: /Add new category/i }).textContent).toContain("Add Income Category");
    expect(screen.getByText("Salary")).toBeTruthy();
    expect(screen.queryByText("Groceries")).toBeNull();
  });

  it("filters categories via search input and allows clearing filters", () => {
    render(
      <CategoriesView
        initialCategories={[mockInitialCategory, mockExpenseCategory]}
      />
    );

    const searchInput = screen.getByPlaceholderText("Search categories...");
    fireEvent.change(searchInput, { target: { value: "groc" } });

    expect(screen.getByText("Groceries")).toBeTruthy();
    expect(screen.queryByText("Salary")).toBeNull();

    const clearButton = screen.getByRole("button", { name: /clear filters/i });
    fireEvent.click(clearButton);

    expect(screen.getByText("Groceries")).toBeTruthy();
    expect(screen.getByText("Salary")).toBeTruthy();
  });

  it("renders only table view with category items and actions", () => {
    render(
      <CategoriesView
        initialCategories={[mockInitialCategory, mockExpenseCategory]}
      />
    );

    expect(screen.getByRole("table", { name: "Categories table" })).toBeTruthy();
    expect(screen.getByTestId("category-row-cat-1")).toBeTruthy();
    expect(screen.getByTestId("category-row-cat-2")).toBeTruthy();
    expect(screen.queryByRole("button", { name: "Cards view" })).toBeNull();
  });
});
