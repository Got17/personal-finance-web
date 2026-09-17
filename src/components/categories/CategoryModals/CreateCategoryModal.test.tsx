import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { CreateCategoryModal } from "./CreateCategoryModal";

describe("CreateCategoryModal", () => {
  const mockOnClose = vi.fn();
  const mockOnCategoryCreated = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it("does not render when isOpen is false", () => {
    render(
      <CreateCategoryModal
        isOpen={false}
        onClose={mockOnClose}
        onCategoryCreated={mockOnCategoryCreated}
      />,
    );

    expect(screen.queryByTestId("create-category-modal")).toBeNull();
  });

  it("renders modal dialog when isOpen is true", () => {
    render(
      <CreateCategoryModal
        isOpen={true}
        onClose={mockOnClose}
        onCategoryCreated={mockOnCategoryCreated}
      />,
    );

    expect(screen.getByTestId("create-category-modal")).toBeTruthy();
    expect(screen.getByText("Add New Category")).toBeTruthy();
  });

  it("calls onClose when close button is clicked", () => {
    render(
      <CreateCategoryModal
        isOpen={true}
        onClose={mockOnClose}
        onCategoryCreated={mockOnCategoryCreated}
      />,
    );

    const closeBtn = screen.getByLabelText("Close modal");
    fireEvent.click(closeBtn);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });
});
