import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { describe, expect, it, vi, afterEach } from "vitest";
import { EditAccountModal } from "./EditAccountModal";
import { Account } from "@/lib/schemas/accounts";

const mockAccount: Account = {
  id: "acc-1",
  user_id: "usr-1",
  name: "Everyday Checking",
  type: "checking",
  currency: "USD",
  description: "Primary daily checking",
  is_active: true,
  created_at: "2026-09-07T00:00:00Z",
  updated_at: "2026-09-07T00:00:00Z",
};

describe("EditAccountModal", () => {
  afterEach(() => {
    cleanup();
  });

  it("does not render when isOpen is false or account is null", () => {
    const { container } = render(
      <EditAccountModal isOpen={false} account={mockAccount} onClose={vi.fn()} onAccountUpdated={vi.fn()} />
    );
    expect(container.firstChild).toBeNull();

    const { container: containerNull } = render(
      <EditAccountModal isOpen={true} account={null} onClose={vi.fn()} onAccountUpdated={vi.fn()} />
    );
    expect(containerNull.firstChild).toBeNull();
  });

  it("renders edit modal content when isOpen is true and account is provided", () => {
    render(
      <EditAccountModal isOpen={true} account={mockAccount} onClose={vi.fn()} onAccountUpdated={vi.fn()} />
    );

    expect(screen.getByTestId("edit-account-modal")).toBeTruthy();
    expect(screen.getByRole("heading", { name: "Edit Account" })).toBeTruthy();
    expect((screen.getByLabelText(/Account Name/i) as HTMLInputElement).value).toBe("Everyday Checking");
  });

  it("calls onClose when close button or ESC key is pressed", () => {
    const onClose = vi.fn();
    render(
      <EditAccountModal isOpen={true} account={mockAccount} onClose={onClose} onAccountUpdated={vi.fn()} />
    );

    const closeBtn = screen.getByRole("button", { name: /Close modal/i });
    fireEvent.click(closeBtn);
    expect(onClose).toHaveBeenCalledTimes(1);

    fireEvent.keyDown(document, { key: "Escape" });
    expect(onClose).toHaveBeenCalledTimes(2);
  });
});
