import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor, cleanup } from "@testing-library/react";
import { CreateTransferModal } from "./CreateTransferModal";
import { Account } from "@/lib/schemas/accounts";
import { Category } from "@/lib/schemas/categories";
import * as actions from "@/app/actions/financial-records";

vi.mock("@/app/actions/financial-records", () => ({
  createTransferAction: vi.fn(),
  getFXQuoteAction: vi.fn(),
}));

const mockAccounts: Account[] = [
  {
    id: "acc-usd-1",
    user_id: "user-1",
    name: "Main Checking",
    type: "checking",
    currency: "USD",
    is_active: true,
    created_at: "2026-01-01T00:00:00.000Z",
    updated_at: "2026-01-01T00:00:00.000Z",
  },
  {
    id: "acc-usd-2",
    user_id: "user-1",
    name: "Emergency Savings",
    type: "checking",
    currency: "USD",
    is_active: true,
    created_at: "2026-01-01T00:00:00.000Z",
    updated_at: "2026-01-01T00:00:00.000Z",
  },
  {
    id: "acc-eur-1",
    user_id: "user-1",
    name: "Euro Account",
    type: "checking",
    currency: "EUR",
    is_active: true,
    created_at: "2026-01-01T00:00:00.000Z",
    updated_at: "2026-01-01T00:00:00.000Z",
  },
];

const mockCategories: Category[] = [
  {
    id: "cat-fee",
    user_id: "user-1",
    name: "Bank & Transfer Fees",
    type: "expense",
    is_active: true,
    created_at: "2026-01-01T00:00:00.000Z",
    updated_at: "2026-01-01T00:00:00.000Z",
  },
  {
    id: "cat-groceries",
    user_id: "user-1",
    name: "Groceries",
    type: "expense",
    is_active: true,
    created_at: "2026-01-01T00:00:00.000Z",
    updated_at: "2026-01-01T00:00:00.000Z",
  },
];

describe("CreateTransferModal", () => {
  const onClose = vi.fn();
  const onTransferCreated = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it("renders when open with distinct source and destination account options", () => {
    render(
      <CreateTransferModal
        isOpen={true}
        accounts={mockAccounts}
        categories={mockCategories}
        onClose={onClose}
        onTransferCreated={onTransferCreated}
      />
    );

    expect(screen.getByRole("dialog")).toBeTruthy();
    expect(screen.getByLabelText(/Source Account/i)).toBeTruthy();
    expect(screen.getByLabelText(/Destination Account/i)).toBeTruthy();
    expect(screen.getByRole("button", { name: /Transfer Funds/i })).toBeTruthy();
  });

  it("validates that source and destination accounts must be distinct", async () => {
    render(
      <CreateTransferModal
        isOpen={true}
        accounts={mockAccounts}
        categories={mockCategories}
        onClose={onClose}
        onTransferCreated={onTransferCreated}
      />
    );

    const destSelect = screen.getByLabelText(/Destination Account/i);
    fireEvent.change(destSelect, { target: { value: "acc-usd-1" } });

    const amountInput = screen.getByLabelText(/^Amount/i);
    fireEvent.change(amountInput, { target: { value: "100" } });

    fireEvent.click(screen.getByRole("button", { name: /Transfer Funds/i }));

    expect(
      await screen.findByText(/Source and destination accounts must be distinct/i)
    ).toBeTruthy();
    expect(actions.createTransferAction).not.toHaveBeenCalled();
  });

  it("submits valid same-currency transfer successfully", async () => {
    vi.mocked(actions.createTransferAction).mockResolvedValue({
      success: true,
      record: {
        id: "tr-1",
        user_id: "user-1",
        kind: "transfer",
        account_id: "acc-usd-1",
        destination_account_id: "acc-usd-2",
        amount_minor: 10000,
        destination_amount_minor: 10000,
        currency: "USD",
        destination_currency: "USD",
        date: "2026-09-17T12:00:00.000Z",
        is_active: true,
        created_at: "2026-09-17T12:00:00.000Z",
        updated_at: "2026-09-17T12:00:00.000Z",
      },
    });

    render(
      <CreateTransferModal
        isOpen={true}
        accounts={mockAccounts}
        categories={mockCategories}
        onClose={onClose}
        onTransferCreated={onTransferCreated}
      />
    );

    const amountInput = screen.getByLabelText(/^Amount/i);
    fireEvent.change(amountInput, { target: { value: "100" } });

    fireEvent.click(screen.getByRole("button", { name: /Transfer Funds/i }));

    await waitFor(() => {
      expect(actions.createTransferAction).toHaveBeenCalledWith(
        expect.objectContaining({
          account_id: "acc-usd-1",
          destination_account_id: "acc-usd-2",
          amount_minor: 10000,
          destination_amount_minor: 10000,
          currency: "USD",
          destination_currency: "USD",
        })
      );
      expect(onTransferCreated).toHaveBeenCalled();
      expect(onClose).toHaveBeenCalled();
    });
  });

  it("shows cross-currency flow with both native amounts, rate, and manual override", async () => {
    vi.mocked(actions.getFXQuoteAction).mockResolvedValue({
      success: true,
      rate: 0.92,
      from_currency: "USD",
      to_currency: "EUR",
      date: "2026-09-17T12:00:00.000Z",
    });

    vi.mocked(actions.createTransferAction).mockResolvedValue({
      success: true,
      record: {
        id: "tr-cross-1",
        user_id: "user-1",
        kind: "transfer",
        account_id: "acc-usd-1",
        destination_account_id: "acc-eur-1",
        amount_minor: 10000,
        destination_amount_minor: 9200,
        currency: "USD",
        destination_currency: "EUR",
        date: "2026-09-17T12:00:00.000Z",
        is_active: true,
        created_at: "2026-09-17T12:00:00.000Z",
        updated_at: "2026-09-17T12:00:00.000Z",
      },
    });

    render(
      <CreateTransferModal
        isOpen={true}
        accounts={mockAccounts}
        categories={mockCategories}
        onClose={onClose}
        onTransferCreated={onTransferCreated}
      />
    );

    const destSelect = screen.getByLabelText(/Destination Account/i);
    fireEvent.change(destSelect, { target: { value: "acc-eur-1" } });

    expect(await screen.findByLabelText(/Source Amount/i)).toBeTruthy();
    expect(screen.getByLabelText(/Destination Amount/i)).toBeTruthy();

    fireEvent.change(screen.getByLabelText(/Source Amount/i), {
      target: { value: "100" },
    });

    const manualToggle = screen.getByLabelText(/Override exchange rate manually/i);
    fireEvent.click(manualToggle);

    const rateInput = screen.getByLabelText(/^Rate Override/i);
    expect(rateInput).toBeTruthy();
    fireEvent.change(rateInput, { target: { value: "0.92" } });

    const destInput = screen.getByLabelText(/Destination Amount/i);
    fireEvent.change(destInput, { target: { value: "92.00" } });

    fireEvent.click(screen.getByRole("button", { name: /Transfer Funds/i }));

    await waitFor(() => {
      expect(actions.createTransferAction).toHaveBeenCalledWith(
        expect.objectContaining({
          account_id: "acc-usd-1",
          destination_account_id: "acc-eur-1",
          amount_minor: 10000,
          destination_amount_minor: 9200,
          currency: "USD",
          destination_currency: "EUR",
          fx_quote: expect.objectContaining({
            rate: 0.92,
            provenance: "manual_override",
          }),
        })
      );
    });
  });

  it("shows validation feedback when cross-currency precision does not match", async () => {
    render(
      <CreateTransferModal
        isOpen={true}
        accounts={mockAccounts}
        categories={mockCategories}
        onClose={onClose}
        onTransferCreated={onTransferCreated}
      />
    );

    fireEvent.change(screen.getByLabelText(/Destination Account/i), {
      target: { value: "acc-eur-1" },
    });

    fireEvent.change(screen.getByLabelText(/Source Amount/i), {
      target: { value: "100" },
    });

    fireEvent.click(screen.getByLabelText(/Override exchange rate manually/i));
    fireEvent.change(screen.getByLabelText(/^Rate Override/i), {
      target: { value: "0.92" },
    });

    fireEvent.change(screen.getByLabelText(/Destination Amount/i), {
      target: { value: "95.00" },
    });

    fireEvent.click(screen.getByRole("button", { name: /Transfer Funds/i }));

    expect(
      await screen.findByText(/Destination amount does not match rate conversion precision/i)
    ).toBeTruthy();
    expect(actions.createTransferAction).not.toHaveBeenCalled();
  });

  it("allows adding a separately categorized transfer fee expense and explains it counts as spending", async () => {
    vi.mocked(actions.createTransferAction).mockResolvedValue({
      success: true,
      record: {
        id: "tr-with-fee",
        user_id: "user-1",
        kind: "transfer",
        account_id: "acc-usd-1",
        destination_account_id: "acc-usd-2",
        amount_minor: 5000,
        destination_amount_minor: 5000,
        currency: "USD",
        destination_currency: "USD",
        date: "2026-09-17T12:00:00.000Z",
        is_active: true,
        created_at: "2026-09-17T12:00:00.000Z",
        updated_at: "2026-09-17T12:00:00.000Z",
      },
      feeRecord: {
        id: "fee-rec-1",
        user_id: "user-1",
        kind: "expense",
        account_id: "acc-usd-1",
        category_id: "cat-fee",
        amount_minor: 250,
        currency: "USD",
        date: "2026-09-17T12:00:00.000Z",
        is_active: true,
        created_at: "2026-09-17T12:00:00.000Z",
        updated_at: "2026-09-17T12:00:00.000Z",
      },
    });

    render(
      <CreateTransferModal
        isOpen={true}
        accounts={mockAccounts}
        categories={mockCategories}
        onClose={onClose}
        onTransferCreated={onTransferCreated}
      />
    );

    fireEvent.change(screen.getByLabelText(/^Amount/i), { target: { value: "50" } });

    const feeCheckbox = screen.getByLabelText(/Include transfer fee/i);
    fireEvent.click(feeCheckbox);

    expect(
      screen.getByText(/counts toward your spending and cash flow totals/i)
    ).toBeTruthy();

    const feeCategorySelect = screen.getByLabelText(/Fee Category/i);
    fireEvent.change(feeCategorySelect, { target: { value: "cat-fee" } });

    const feeAmountInput = screen.getByLabelText(/Fee Amount/i);
    fireEvent.change(feeAmountInput, { target: { value: "2.50" } });

    fireEvent.click(screen.getByRole("button", { name: /Transfer Funds/i }));

    await waitFor(() => {
      expect(actions.createTransferAction).toHaveBeenCalledWith(
        expect.objectContaining({
          fee: expect.objectContaining({
            account_id: "acc-usd-1",
            category_id: "cat-fee",
            amount_minor: 250,
            currency: "USD",
          }),
        })
      );
      expect(onTransferCreated).toHaveBeenCalled();
    });
  });
});
