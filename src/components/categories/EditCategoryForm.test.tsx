import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor, cleanup } from "@testing-library/react";
import { EditCategoryForm } from "./EditCategoryForm";
import { Category } from "@/lib/schemas/categories";
import * as categoriesActions from "@/app/actions/categories";

vi.mock("@/app/actions/categories", () => ({
  updateCategoryAction: vi.fn(),
}));

const mockCategory: Category = {
  id: "cat-123",
  user_id: "usr-1",
  name: "Groceries",
  type: "expense",
  is_active: true,
  created_at: "2026-09-08T00:00:00Z",
  updated_at: "2026-09-08T00:00:00Z",
};

describe("EditCategoryForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it("pre-fills form inputs with category data", () => {
    render(<EditCategoryForm category={mockCategory} />);

    const nameInput = screen.getByLabelText(/Category Name/i) as HTMLInputElement;
    const typeSelect = screen.getByLabelText(/Category Type/i) as HTMLSelectElement;
    const activeCheckbox = screen.getByLabelText(/Active Category/i) as HTMLInputElement;

    expect(nameInput.value).toBe("Groceries");
    expect(typeSelect.value).toBe("expense");
    expect(activeCheckbox.checked).toBe(true);
  });

  it("displays client-side validation error when name is blank", async () => {
    render(<EditCategoryForm category={mockCategory} />);

    const nameInput = screen.getByLabelText(/Category Name/i);
    fireEvent.change(nameInput, { target: { value: "" } });

    const submitBtn = screen.getByRole("button", { name: "Save Changes" });
    fireEvent.click(submitBtn);

    expect(await screen.findByText("Category name is required.")).toBeTruthy();
    expect(categoriesActions.updateCategoryAction).not.toHaveBeenCalled();
  });

  it("submits updated category data and invokes callback", async () => {
    const onCategoryUpdated = vi.fn();
    const updatedCategory = { ...mockCategory, name: "Food & Groceries" };

    vi.mocked(categoriesActions.updateCategoryAction).mockResolvedValue({
      success: true,
      category: updatedCategory,
    });

    render(
      <EditCategoryForm
        category={mockCategory}
        onCategoryUpdated={onCategoryUpdated}
      />,
    );

    const nameInput = screen.getByLabelText(/Category Name/i);
    fireEvent.change(nameInput, { target: { value: "Food & Groceries" } });

    const submitBtn = screen.getByRole("button", { name: "Save Changes" });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(categoriesActions.updateCategoryAction).toHaveBeenCalledWith("cat-123", {
        name: "Food & Groceries",
        type: "expense",
        is_active: true,
      });
      expect(onCategoryUpdated).toHaveBeenCalledWith(updatedCategory);
    });
  });

  it("displays server error message when update action fails", async () => {
    vi.mocked(categoriesActions.updateCategoryAction).mockResolvedValue({
      success: false,
      error: "You do not have permission to perform this action on this category.",
    });

    render(<EditCategoryForm category={mockCategory} />);

    const submitBtn = screen.getByRole("button", { name: "Save Changes" });
    fireEvent.click(submitBtn);

    expect(
      await screen.findByText(
        "You do not have permission to perform this action on this category.",
      ),
    ).toBeTruthy();
  });
});
