import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor, cleanup } from "@testing-library/react";
import { CreateAccountForm } from "./CreateAccountForm";
import * as accountsActions from "@/app/actions/accounts";
import { Account } from "@/lib/schemas/accounts";

vi.mock("@/app/actions/accounts", () => ({
  createAccountAction: vi.fn(),
}));

const mockCreatedAccount: Account = {
  id: "acc-123",
  user_id: "usr-1",
  name: "Checking Main",
  type: "checking",
  currency: "USD",
  description: "Main account",
  is_active: true,
  created_at: "2026-09-07T00:00:00Z",
  updated_at: "2026-09-07T00:00:00Z",
};

describe("CreateAccountForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it("renders form controls with default values", () => {
    render(<CreateAccountForm defaultCurrency="EUR" />);

    expect(screen.getByLabelText(/Account Name/i)).toBeTruthy();
    expect(screen.getByLabelText(/Account Type/i)).toBeTruthy();
    expect((screen.getByLabelText(/Currency/i) as HTMLInputElement).value).toBe("EUR");
    expect(screen.getByLabelText(/Active Account/i)).toBeTruthy();
  });

  it("shows client-side validation error when account name is blank", async () => {
    render(<CreateAccountForm />);

    fireEvent.click(screen.getByRole("button", { name: /\+ Add Account/i }));

    expect(await screen.findByText("Account name is required.")).toBeTruthy();
    expect(accountsActions.createAccountAction).not.toHaveBeenCalled();
  });

  it("submits valid form data and calls onAccountCreated callback", async () => {
    const handleAccountCreated = vi.fn();
    vi.mocked(accountsActions.createAccountAction).mockResolvedValueOnce({
      success: true,
      account: mockCreatedAccount,
    });

    render(<CreateAccountForm defaultCurrency="USD" onAccountCreated={handleAccountCreated} />);

    fireEvent.change(screen.getByLabelText(/Account Name/i), {
      target: { value: "Checking Main" },
    });
    fireEvent.change(screen.getByLabelText(/Description/i), {
      target: { value: "Main account" },
    });

    fireEvent.click(screen.getByRole("button", { name: /\+ Add Account/i }));

    await waitFor(() => {
      expect(accountsActions.createAccountAction).toHaveBeenCalledWith({
        name: "Checking Main",
        type: "checking",
        currency: "USD",
        description: "Main account",
        is_active: true,
      });
    });

    expect(await screen.findByText('Account "Checking Main" created successfully.')).toBeTruthy();
    expect(handleAccountCreated).toHaveBeenCalledWith(mockCreatedAccount);
  });

  it("displays server error message when createAccountAction returns an error", async () => {
    vi.mocked(accountsActions.createAccountAction).mockResolvedValueOnce({
      success: false,
      error: "Account limit reached.",
    });

    render(<CreateAccountForm />);

    fireEvent.change(screen.getByLabelText(/Account Name/i), {
      target: { value: "Savings Plus" },
    });

    fireEvent.click(screen.getByRole("button", { name: /\+ Add Account/i }));

    expect(await screen.findByText("Account limit reached.")).toBeTruthy();
  });
});
