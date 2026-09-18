import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor, cleanup } from "@testing-library/react";
import { CreateAccountForm } from "./CreateAccountForm";
import * as accountsActions from "@/app/actions/accounts";
import * as currenciesActions from "@/app/actions/currencies";
import { Account } from "@/lib/schemas/accounts";

vi.mock("@/app/actions/accounts", () => ({
  createAccountAction: vi.fn(),
}));

vi.mock("@/app/actions/currencies", () => ({
  getCurrenciesAction: vi.fn(),
}));

const mockCurrencies = [
  { code: "LAK", name: "Lao Kip", symbol: "₭", decimal_digits: 0 },
  { code: "USD", name: "US Dollar", symbol: "$", decimal_digits: 2 },
  { code: "EUR", name: "Euro", symbol: "€", decimal_digits: 2 },
];

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
    vi.mocked(currenciesActions.getCurrenciesAction).mockResolvedValue({
      success: true,
      currencies: mockCurrencies,
    });
  });

  afterEach(() => {
    cleanup();
  });

  it("renders form controls with default values, loading the currency dropdown from the API", async () => {
    render(<CreateAccountForm defaultCurrency="EUR" />);

    expect(screen.getByLabelText(/Account Name/i)).toBeTruthy();
    expect(screen.getByLabelText(/Account Type/i)).toBeTruthy();
    expect(screen.getByLabelText(/Active Account/i)).toBeTruthy();

    await waitFor(() => {
      expect((screen.getByLabelText(/Currency/i) as HTMLSelectElement).value).toBe("EUR");
    });
    expect(currenciesActions.getCurrenciesAction).toHaveBeenCalled();
  });

  it("offers only account types supported by the API", () => {
    render(<CreateAccountForm />);

    const typeOptions = Array.from(
      (screen.getByLabelText(/Account Type/i) as HTMLSelectElement).options,
      (option) => option.value,
    );

    expect(typeOptions).toEqual(["checking", "savings", "investment", "cash", "other"]);
  });
  it("disables the currency dropdown while currencies are loading", () => {
    vi.mocked(currenciesActions.getCurrenciesAction).mockReturnValue(new Promise(() => {}));

    render(<CreateAccountForm defaultCurrency="USD" />);

    expect((screen.getByLabelText(/Currency/i) as HTMLSelectElement).disabled).toBe(true);
  });

  it("keeps the currency dropdown usable with just the default code if the currency fetch fails", async () => {    vi.mocked(currenciesActions.getCurrenciesAction).mockResolvedValue({
      success: false,
      error: "Unable to connect to currencies server.",
    });

    render(<CreateAccountForm defaultCurrency="USD" />);

    await waitFor(() => {
      expect((screen.getByLabelText(/Currency/i) as HTMLSelectElement).disabled).toBe(false);
    });
    expect((screen.getByLabelText(/Currency/i) as HTMLSelectElement).value).toBe("USD");
    expect(screen.getByText("Unable to connect to currencies server.")).toBeTruthy();
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
