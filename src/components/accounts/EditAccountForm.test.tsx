import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor, cleanup } from "@testing-library/react";
import { EditAccountForm } from "./EditAccountForm";
import { Account } from "@/lib/schemas/accounts";
import * as accountsActions from "@/app/actions/accounts";

vi.mock("@/app/actions/accounts", () => ({
  updateAccountAction: vi.fn(),
}));

const mockAccount: Account = {
  id: "acc-1",
  user_id: "usr-1",
  name: "Everyday Checking",
  type: "checking",
  currency: "USD",
  description: "Primary daily checking account",
  is_active: true,
  created_at: "2026-09-07T00:00:00Z",
  updated_at: "2026-09-07T00:00:00Z",
};

describe("EditAccountForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it("pre-populates form inputs with current account details", () => {
    render(<EditAccountForm account={mockAccount} />);

    expect((screen.getByLabelText(/Account Name/i) as HTMLInputElement).value).toBe("Everyday Checking");
    expect((screen.getByLabelText(/Account Type/i) as HTMLSelectElement).value).toBe("checking");
    expect((screen.getByLabelText(/Currency/i) as HTMLInputElement).value).toBe("USD");
    expect((screen.getByLabelText(/Description/i) as HTMLInputElement).value).toBe("Primary daily checking account");
    expect((screen.getByLabelText(/Active Account/i) as HTMLInputElement).checked).toBe(true);
  });

  it("shows client validation error when required field is empty", async () => {
    render(<EditAccountForm account={mockAccount} />);

    const nameInput = screen.getByLabelText(/Account Name/i);
    fireEvent.change(nameInput, { target: { value: "" } });

    const submitBtn = screen.getByRole("button", { name: /Save Changes/i });
    fireEvent.click(submitBtn);

    expect(await screen.findByText("Account name is required.")).toBeTruthy();
    expect(accountsActions.updateAccountAction).not.toHaveBeenCalled();
  });

  it("submits updated details successfully and triggers callback", async () => {
    const updatedAccount: Account = {
      ...mockAccount,
      name: "Updated Everyday Checking",
      description: "Updated description",
    };

    vi.mocked(accountsActions.updateAccountAction).mockResolvedValue({
      success: true,
      account: updatedAccount,
    });

    const onUpdated = vi.fn();
    render(<EditAccountForm account={mockAccount} onAccountUpdated={onUpdated} />);

    const nameInput = screen.getByLabelText(/Account Name/i);
    fireEvent.change(nameInput, { target: { value: "Updated Everyday Checking" } });

    const submitBtn = screen.getByRole("button", { name: /Save Changes/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(accountsActions.updateAccountAction).toHaveBeenCalledWith("acc-1", {
        name: "Updated Everyday Checking",
        type: "checking",
        currency: "USD",
        description: "Primary daily checking account",
        is_active: true,
      });
      expect(onUpdated).toHaveBeenCalledWith(updatedAccount);
    });
  });

  it("displays server error message when update action returns an error", async () => {
    vi.mocked(accountsActions.updateAccountAction).mockResolvedValue({
      success: false,
      error: "Caller does not own the account.",
    });

    render(<EditAccountForm account={mockAccount} />);

    const submitBtn = screen.getByRole("button", { name: /Save Changes/i });
    fireEvent.click(submitBtn);

    expect(await screen.findByText("Caller does not own the account.")).toBeTruthy();
  });
});
