import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { EmptyState } from "./EmptyState";

describe("EmptyState component", () => {
  const mockOnAction = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it("renders title and description", () => {
    render(
      <EmptyState title="No items found" description="Create your first item to get started." />,
    );

    expect(screen.getByText("No items found")).toBeTruthy();
    expect(screen.getByText("Create your first item to get started.")).toBeTruthy();
  });

  it("renders action button and handles clicks when provided", () => {
    render(
      <EmptyState
        title="No items found"
        description="Create your first item to get started."
        actionLabel="+ Add Item"
        onAction={mockOnAction}
      />,
    );

    const actionBtn = screen.getByRole("button", { name: "+ Add Item" });
    expect(actionBtn).toBeTruthy();

    fireEvent.click(actionBtn);
    expect(mockOnAction).toHaveBeenCalledTimes(1);
  });
});
