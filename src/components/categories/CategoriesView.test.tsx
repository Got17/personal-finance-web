import { describe, expect, it, afterEach } from "vitest";
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

describe("CategoriesView", () => {
  afterEach(() => {
    cleanup();
  });

  it("renders initial categories list and Add button with modal closed", () => {
    render(<CategoriesView initialCategories={[mockInitialCategory]} />);

    expect(screen.getByText("Your Categories")).toBeTruthy();
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
});
