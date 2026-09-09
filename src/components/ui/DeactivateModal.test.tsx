import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor, cleanup } from "@testing-library/react";
import { DeactivateModal } from "./DeactivateModal";

interface DummyItem {
  id: string;
  name: string;
}

const mockItem: DummyItem = {
  id: "item-1",
  name: "Checking Account",
};

describe("DeactivateModal", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it("does not render when isOpen is false or item is null", () => {
    const { container } = render(
      <DeactivateModal
        isOpen={false}
        item={mockItem}
        entityName="Account"
        onClose={vi.fn()}
        onConfirm={vi.fn()}
        onDeactivated={vi.fn()}
      />,
    );
    expect(container.firstChild).toBeNull();
  });

  it("renders modal confirmation with item name when open", () => {
    render(
      <DeactivateModal
        isOpen={true}
        item={mockItem}
        entityName="Account"
        onClose={vi.fn()}
        onConfirm={vi.fn()}
        onDeactivated={vi.fn()}
        testId="deactivate-modal"
      />,
    );

    expect(screen.getByTestId("deactivate-modal")).toBeTruthy();
    expect(screen.getByRole("heading", { name: "Deactivate Account" })).toBeTruthy();
    expect(screen.getByText(/Checking Account/i)).toBeTruthy();
  });

  it("calls onConfirm and onDeactivated callback on successful confirmation", async () => {
    const onConfirm = vi.fn().mockResolvedValue({
      success: true,
      item: mockItem,
    });
    const onDeactivated = vi.fn();
    const onClose = vi.fn();

    render(
      <DeactivateModal
        isOpen={true}
        item={mockItem}
        entityName="Account"
        onClose={onClose}
        onConfirm={onConfirm}
        onDeactivated={onDeactivated}
      />,
    );

    const confirmBtn = screen.getByRole("button", { name: "Deactivate Account" });
    fireEvent.click(confirmBtn);

    await waitFor(() => {
      expect(onConfirm).toHaveBeenCalledWith("item-1");
      expect(onDeactivated).toHaveBeenCalledWith(mockItem);
      expect(onClose).toHaveBeenCalled();
    });
  });

  it("displays server error message on confirmation failure", async () => {
    const onConfirm = vi.fn().mockResolvedValue({
      success: false,
      error: "Authorization failed",
    });

    render(
      <DeactivateModal
        isOpen={true}
        item={mockItem}
        entityName="Account"
        onClose={vi.fn()}
        onConfirm={onConfirm}
        onDeactivated={vi.fn()}
      />,
    );

    const confirmBtn = screen.getByRole("button", { name: "Deactivate Account" });
    fireEvent.click(confirmBtn);

    expect(await screen.findByText("Authorization failed")).toBeTruthy();
  });

  it("displays fallback error when success is true but item is missing", async () => {
    const onConfirm = vi.fn().mockResolvedValue({
      success: true,
      item: undefined,
    });
    const onDeactivated = vi.fn();

    render(
      <DeactivateModal
        isOpen={true}
        item={mockItem}
        entityName="Account"
        onClose={vi.fn()}
        onConfirm={onConfirm}
        onDeactivated={onDeactivated}
      />,
    );

    const confirmBtn = screen.getByRole("button", { name: "Deactivate Account" });
    fireEvent.click(confirmBtn);

    expect(await screen.findByText("Failed to deactivate account. Please try again.")).toBeTruthy();
    expect(onDeactivated).not.toHaveBeenCalled();
  });

  it("handles thrown errors in onConfirm gracefully", async () => {
    const onConfirm = vi.fn().mockRejectedValue(new Error("Network disconnect"));

    render(
      <DeactivateModal
        isOpen={true}
        item={mockItem}
        entityName="Account"
        onClose={vi.fn()}
        onConfirm={onConfirm}
        onDeactivated={vi.fn()}
      />,
    );

    const confirmBtn = screen.getByRole("button", { name: "Deactivate Account" });
    fireEvent.click(confirmBtn);

    expect(await screen.findByText("Network disconnect")).toBeTruthy();
  });
});
