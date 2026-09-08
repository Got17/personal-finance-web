import { render, screen, fireEvent, waitFor, cleanup } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { DeactivateCategoryModal } from "./DeactivateCategoryModal";
import { Category } from "@/lib/schemas/categories";
import * as categoriesActions from "@/app/actions/categories";

vi.mock("@/app/actions/categories", () => ({
  deactivateCategoryAction: vi.fn(),
}));

const mockCategory: Category = {
  id: "cat-1",
  user_id: "usr-1",
  name: "Groceries",
  type: "expense",
  is_active: true,
  created_at: "2026-09-08T00:00:00Z",
  updated_at: "2026-09-08T00:00:00Z",
};

describe("DeactivateCategoryModal", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it("does not render when isOpen is false or category is null", () => {
    const { container } = render(
      <DeactivateCategoryModal
        isOpen={false}
        category={mockCategory}
        onClose={vi.fn()}
        onCategoryDeactivated={vi.fn()}
      />,
    );
    expect(container.firstChild).toBeNull();
  });

  it("renders modal confirmation with category name when open", () => {
    render(
      <DeactivateCategoryModal
        isOpen={true}
        category={mockCategory}
        onClose={vi.fn()}
        onCategoryDeactivated={vi.fn()}
      />,
    );

    expect(screen.getByTestId("deactivate-category-modal")).toBeTruthy();
    expect(screen.getByRole("heading", { name: "Deactivate Category" })).toBeTruthy();
    expect(screen.getByText(/Groceries/i)).toBeTruthy();
  });

  it("calls deactivateCategoryAction on confirmation and invokes callback", async () => {
    const deactivatedCategory: Category = { ...mockCategory, is_active: false };
    vi.mocked(categoriesActions.deactivateCategoryAction).mockResolvedValue({
      success: true,
      category: deactivatedCategory,
    });

    const onDeactivated = vi.fn();
    const onClose = vi.fn();

    render(
      <DeactivateCategoryModal
        isOpen={true}
        category={mockCategory}
        onClose={onClose}
        onCategoryDeactivated={onDeactivated}
      />,
    );

    const confirmBtn = screen.getByRole("button", { name: /^Deactivate Category$/i });
    fireEvent.click(confirmBtn);

    await waitFor(() => {
      expect(categoriesActions.deactivateCategoryAction).toHaveBeenCalledWith("cat-1");
      expect(onDeactivated).toHaveBeenCalledWith(deactivatedCategory);
      expect(onClose).toHaveBeenCalled();
    });
  });

  it("displays authorization or server error banner on failure", async () => {
    vi.mocked(categoriesActions.deactivateCategoryAction).mockResolvedValue({
      success: false,
      error: "You do not have permission to perform this action on this category.",
    });

    render(
      <DeactivateCategoryModal
        isOpen={true}
        category={mockCategory}
        onClose={vi.fn()}
        onCategoryDeactivated={vi.fn()}
      />,
    );

    const confirmBtn = screen.getByRole("button", { name: /^Deactivate Category$/i });
    fireEvent.click(confirmBtn);

    expect(
      await screen.findByText(
        "You do not have permission to perform this action on this category.",
      ),
    ).toBeTruthy();
  });
});
