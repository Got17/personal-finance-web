import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { describe, expect, it, vi, afterEach } from "vitest";
import { EditCategoryModal } from "./EditCategoryModal";
import { Category } from "@/lib/schemas/categories";

const mockCategory: Category = {
  id: "cat-1",
  user_id: "usr-1",
  name: "Groceries",
  type: "expense",
  is_active: true,
  created_at: "2026-09-08T00:00:00Z",
  updated_at: "2026-09-08T00:00:00Z",
};

describe("EditCategoryModal", () => {
  afterEach(() => {
    cleanup();
  });

  it("does not render when isOpen is false or category is null", () => {
    const { container } = render(
      <EditCategoryModal
        isOpen={false}
        category={mockCategory}
        onClose={vi.fn()}
        onCategoryUpdated={vi.fn()}
      />,
    );
    expect(container.firstChild).toBeNull();

    const { container: containerNull } = render(
      <EditCategoryModal
        isOpen={true}
        category={null}
        onClose={vi.fn()}
        onCategoryUpdated={vi.fn()}
      />,
    );
    expect(containerNull.firstChild).toBeNull();
  });

  it("renders edit modal content when isOpen is true and category is provided", () => {
    render(
      <EditCategoryModal
        isOpen={true}
        category={mockCategory}
        onClose={vi.fn()}
        onCategoryUpdated={vi.fn()}
      />,
    );

    expect(screen.getByTestId("edit-category-modal")).toBeTruthy();
    expect(screen.getByRole("heading", { name: "Edit Category" })).toBeTruthy();
    expect((screen.getByLabelText(/Category Name/i) as HTMLInputElement).value).toBe("Groceries");
  });

  it("calls onClose when close button or ESC key is pressed", () => {
    const onClose = vi.fn();
    render(
      <EditCategoryModal
        isOpen={true}
        category={mockCategory}
        onClose={onClose}
        onCategoryUpdated={vi.fn()}
      />,
    );

    const closeBtn = screen.getByRole("button", { name: /Close modal/i });
    fireEvent.click(closeBtn);
    expect(onClose).toHaveBeenCalledTimes(1);

    fireEvent.keyDown(document, { key: "Escape" });
    expect(onClose).toHaveBeenCalledTimes(2);
  });
});
