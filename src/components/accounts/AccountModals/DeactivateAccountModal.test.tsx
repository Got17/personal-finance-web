import { render, screen, fireEvent, waitFor, cleanup } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { DeactivateAccountModal } from "./DeactivateAccountModal";
import { Account } from "@/lib/schemas/accounts";
import * as accountsActions from "@/app/actions/accounts";

vi.mock("@/app/actions/accounts", () => ({
  deactivateAccountAction: vi.fn(),
}));

const mockAccount: Account = {
  id: "acc-1",
  user_id: "usr-1",
  name: "Everyday Checking",
  type: "checking",
  currency: "USD",
  description: "Primary checking",
  is_active: true,
  created_at: "2026-09-07T00:00:00Z",
  updated_at: "2026-09-07T00:00:00Z",
};

describe("DeactivateAccountModal", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it("does not render when isOpen is false or account is null", () => {
    const { container } = render(
      <DeactivateAccountModal
        isOpen={false}
        account={mockAccount}
        onClose={vi.fn()}
        onAccountDeactivated={vi.fn()}
      />
    );
    expect(container.firstChild).toBeNull();
  });

  it("renders modal confirmation with account name when open", () => {
    render(
      <DeactivateAccountModal
        isOpen={true}
        account={mockAccount}
        onClose={vi.fn()}
        onAccountDeactivated={vi.fn()}
      />
    );

    expect(screen.getByTestId("deactivate-account-modal")).toBeTruthy();
    expect(screen.getByRole("heading", { name: "Deactivate Account" })).toBeTruthy();
    expect(screen.getByText(/Everyday Checking/i)).toBeTruthy();
  });

  it("calls deactivateAccountAction on confirmation and invokes callback", async () => {
    const deactivatedAccount: Account = { ...mockAccount, is_active: false };
    vi.mocked(accountsActions.deactivateAccountAction).mockResolvedValue({
      success: true,
      account: deactivatedAccount,
    });

    const onDeactivated = vi.fn();
    const onClose = vi.fn();

    render(
      <DeactivateAccountModal
        isOpen={true}
        account={mockAccount}
        onClose={onClose}
        onAccountDeactivated={onDeactivated}
      />
    );

    const confirmBtn = screen.getByRole("button", { name: /^Deactivate Account$/i });
    fireEvent.click(confirmBtn);

    await waitFor(() => {
      expect(accountsActions.deactivateAccountAction).toHaveBeenCalledWith("acc-1");
      expect(onDeactivated).toHaveBeenCalledWith(deactivatedAccount);
      expect(onClose).toHaveBeenCalled();
    });
  });

  it("displays authorization or server error banner on failure", async () => {
    vi.mocked(accountsActions.deactivateAccountAction).mockResolvedValue({
      success: false,
      error: "Caller does not own the account.",
    });

    render(
      <DeactivateAccountModal
        isOpen={true}
        account={mockAccount}
        onClose={vi.fn()}
        onAccountDeactivated={vi.fn()}
      />
    );

    const confirmBtn = screen.getByRole("button", { name: /^Deactivate Account$/i });
    fireEvent.click(confirmBtn);

    expect(await screen.findByText("Caller does not own the account.")).toBeTruthy();
  });

  it("clears serverError when pressing Escape key", async () => {
    vi.mocked(accountsActions.deactivateAccountAction).mockResolvedValue({
      success: false,
      error: "Server error occurred.",
    });

    const onClose = vi.fn();

    const { rerender } = render(
      <DeactivateAccountModal
        isOpen={true}
        account={mockAccount}
        onClose={onClose}
        onAccountDeactivated={vi.fn()}
      />
    );

    const confirmBtn = screen.getByRole("button", { name: /^Deactivate Account$/i });
    fireEvent.click(confirmBtn);

    expect(await screen.findByText("Server error occurred.")).toBeTruthy();

    fireEvent.keyDown(document, { key: "Escape" });
    expect(onClose).toHaveBeenCalled();

    // Re-open modal to verify error is cleared
    rerender(
      <DeactivateAccountModal
        isOpen={true}
        account={mockAccount}
        onClose={onClose}
        onAccountDeactivated={vi.fn()}
      />
    );

    expect(screen.queryByText("Server error occurred.")).toBeNull();
  });
});
