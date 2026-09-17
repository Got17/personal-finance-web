import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor, cleanup } from "@testing-library/react";
import { CreateCategoryForm } from "./CreateCategoryForm";
import * as categoriesActions from "@/app/actions/categories";

vi.mock("@/app/actions/categories", () => ({
  createCategoryAction: vi.fn(),
}));

describe("CreateCategoryForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it("renders form controls correctly", () => {
    render(<CreateCategoryForm />);

    expect(screen.getByLabelText(/Category Name/i)).toBeTruthy();
    expect(screen.getByLabelText(/Category Type/i)).toBeTruthy();
    expect(screen.getByRole("button", { name: /\+ Add Category/i })).toBeTruthy();
  });

  it("shows client validation error when name is empty", async () => {
    render(<CreateCategoryForm />);

    const submitBtn = screen.getByRole("button", { name: /\+ Add Category/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText("Category name is required.")).toBeTruthy();
    });
    expect(categoriesActions.createCategoryAction).not.toHaveBeenCalled();
  });

  it("submits valid input and invokes callback on success", async () => {
    const mockOnCategoryCreated = vi.fn();
    const mockCategory = {
      id: "cat-1",
      user_id: "usr-1",
      name: "Salary",
      type: "income" as const,
      is_active: true,
      created_at: "2026-09-08T00:00:00Z",
      updated_at: "2026-09-08T00:00:00Z",
    };

    vi.mocked(categoriesActions.createCategoryAction).mockResolvedValue({
      success: true,
      category: mockCategory,
    });

    render(<CreateCategoryForm onCategoryCreated={mockOnCategoryCreated} />);

    fireEvent.change(screen.getByLabelText(/Category Name/i), {
      target: { value: "Salary" },
    });
    fireEvent.change(screen.getByLabelText(/Category Type/i), {
      target: { value: "income" },
    });

    fireEvent.click(screen.getByRole("button", { name: /\+ Add Category/i }));

    await waitFor(() => {
      expect(categoriesActions.createCategoryAction).toHaveBeenCalledWith({
        name: "Salary",
        type: "income",
        is_active: true,
      });
      expect(mockOnCategoryCreated).toHaveBeenCalledWith(mockCategory);
    });
  });

  it("displays server error message when action fails", async () => {
    vi.mocked(categoriesActions.createCategoryAction).mockResolvedValue({
      success: false,
      error: "Validation failed on categories server.",
    });

    render(<CreateCategoryForm />);

    fireEvent.change(screen.getByLabelText(/Category Name/i), {
      target: { value: "Rent" },
    });
    fireEvent.change(screen.getByLabelText(/Category Type/i), {
      target: { value: "expense" },
    });

    fireEvent.click(screen.getByRole("button", { name: /\+ Add Category/i }));

    await waitFor(() => {
      expect(
        screen.getByText("Validation failed on categories server."),
      ).toBeTruthy();
    });
  });
});
