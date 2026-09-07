import { describe, expect, it, vi, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { CreateAccountModal } from "./CreateAccountModal";

describe("CreateAccountModal", () => {
  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it("does not render when isOpen is false", () => {
    render(
      <CreateAccountModal
        isOpen={false}
        onClose={vi.fn()}
        onAccountCreated={vi.fn()}
      />,
    );

    expect(screen.queryByTestId("create-account-modal")).toBeNull();
  });

  it("renders modal dialog when isOpen is true and closes on Escape key press", () => {
    const handleClose = vi.fn();
    render(
      <CreateAccountModal
        isOpen={true}
        onClose={handleClose}
        onAccountCreated={vi.fn()}
      />,
    );

    expect(screen.getByTestId("create-account-modal")).toBeTruthy();

    fireEvent.keyDown(document, { key: "Escape" });
    expect(handleClose).toHaveBeenCalled();
  });

  it("closes when clicking on the backdrop overlay", () => {
    const handleClose = vi.fn();
    render(
      <CreateAccountModal
        isOpen={true}
        onClose={handleClose}
        onAccountCreated={vi.fn()}
      />,
    );

    const backdrop = screen.getByTestId("modal-backdrop");
    fireEvent.click(backdrop);

    expect(handleClose).toHaveBeenCalled();
  });
});
