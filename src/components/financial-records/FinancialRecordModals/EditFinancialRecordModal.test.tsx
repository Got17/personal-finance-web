import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { EditFinancialRecordModal } from "./EditFinancialRecordModal";
import { Account } from "@/lib/schemas/accounts";
import { Category } from "@/lib/schemas/categories";
import { FinancialRecord } from "@/lib/schemas/financial-records";

const { updateFinancialRecordAction } = vi.hoisted(() => ({
  updateFinancialRecordAction: vi.fn(),
}));

vi.mock("@/app/actions/financial-records", () => ({
  updateFinancialRecordAction,
}));

const mockAccounts: Account[] = [
  {
    id: "acc-1",
    user_id: "user-1",
    name: "Checking",
    type: "checking",
    currency: "USD",
    is_active: true,
    created_at: "",
    updated_at: "",
  },
  {
    id: "acc-2",
    user_id: "user-1",
    name: "Savings",
    type: "savings",
    currency: "USD",
    is_active: true,
    created_at: "",
    updated_at: "",
  },
];

const mockCategories: Category[] = [
  {
    id: "cat-1",
    user_id: "user-1",
    name: "Groceries",
    type: "expense",
    is_active: true,
    created_at: "",
    updated_at: "",
  },
  {
    id: "cat-2",
    user_id: "user-1",
    name: "Salary",
    type: "income",
    is_active: true,
    created_at: "",
    updated_at: "",
  },
];

const mockRecord: FinancialRecord = {
  id: "rec-1",
  user_id: "user-1",
  kind: "expense",
  account_id: "acc-1",
  category_id: "cat-1",
  amount_minor: 4268,
  currency: "USD",
  date: "2026-09-13T12:00:00.000Z",
  note: "Weekly groceries",
  is_active: true,
  created_at: "2026-09-13T12:00:00.000Z",
  updated_at: "2026-09-13T12:00:00.000Z",
};

describe("EditFinancialRecordModal", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(cleanup);

  it("does not render when isOpen is false", () => {
    render(
      <EditFinancialRecordModal
        isOpen={false}
        record={mockRecord}
        accounts={mockAccounts}
        categories={mockCategories}
        onClose={vi.fn()}
        onRecordUpdated={vi.fn()}
      />,
    );

    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("does not render when record is null", () => {
    render(
      <EditFinancialRecordModal
        isOpen={true}
        record={null}
        accounts={mockAccounts}
        categories={mockCategories}
        onClose={vi.fn()}
        onRecordUpdated={vi.fn()}
      />,
    );

    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("renders with prefilled values from the record", () => {
    render(
      <EditFinancialRecordModal
        isOpen={true}
        record={mockRecord}
        accounts={mockAccounts}
        categories={mockCategories}
        onClose={vi.fn()}
        onRecordUpdated={vi.fn()}
      />,
    );

    expect(screen.getByRole("dialog")).toBeTruthy();
    expect((screen.getByLabelText(/^type/i) as HTMLSelectElement).value).toBe("expense");
    expect((screen.getByLabelText(/^account/i) as HTMLSelectElement).value).toBe("acc-1");
    expect((screen.getByLabelText(/^category/i) as HTMLSelectElement).value).toBe("cat-1");
    expect((screen.getByLabelText(/^amount/i) as HTMLInputElement).value).toBe("42.68");
    expect((screen.getByLabelText(/^date/i) as HTMLInputElement).value).toBe("2026-09-13");
    expect((screen.getByLabelText(/description/i) as HTMLInputElement).value).toBe("Weekly groceries");
  });

  it("submits updated values and calls onRecordUpdated", async () => {
    const updatedRecord: FinancialRecord = {
      ...mockRecord,
      amount_minor: 5500,
      note: "Updated groceries",
    };

    updateFinancialRecordAction.mockResolvedValue({
      success: true,
      record: updatedRecord,
    });

    const onRecordUpdated = vi.fn();
    const onClose = vi.fn();

    render(
      <EditFinancialRecordModal
        isOpen={true}
        record={mockRecord}
        accounts={mockAccounts}
        categories={mockCategories}
        onClose={onClose}
        onRecordUpdated={onRecordUpdated}
      />,
    );

    fireEvent.change(screen.getByLabelText(/^amount/i), { target: { value: "55.00" } });
    fireEvent.change(screen.getByLabelText(/description/i), { target: { value: "Updated groceries" } });

    fireEvent.click(screen.getByRole("button", { name: /save changes/i }));

    await waitFor(() => {
      expect(updateFinancialRecordAction).toHaveBeenCalledWith(
        "rec-1",
        expect.objectContaining({
          kind: "expense",
          account_id: "acc-1",
          category_id: "cat-1",
          amount_minor: 5500,
          currency: "USD",
          note: "Updated groceries",
        }),
      );
      expect(onRecordUpdated).toHaveBeenCalledWith(updatedRecord);
      expect(onClose).toHaveBeenCalled();
    });
  });

  it("displays server error banner if update fails", async () => {
    updateFinancialRecordAction.mockResolvedValue({
      success: false,
      error: "Account not found.",
    });

    render(
      <EditFinancialRecordModal
        isOpen={true}
        record={mockRecord}
        accounts={mockAccounts}
        categories={mockCategories}
        onClose={vi.fn()}
        onRecordUpdated={vi.fn()}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: /save changes/i }));

    await waitFor(() => {
      expect(screen.getByRole("alert").textContent).toContain("Account not found.");
    });
  });

  it("validates that amount is positive", async () => {
    render(
      <EditFinancialRecordModal
        isOpen={true}
        record={mockRecord}
        accounts={mockAccounts}
        categories={mockCategories}
        onClose={vi.fn()}
        onRecordUpdated={vi.fn()}
      />,
    );

    fireEvent.change(screen.getByLabelText(/^amount/i), { target: { value: "0" } });
    fireEvent.click(screen.getByRole("button", { name: /save changes/i }));

    expect(screen.getByRole("alert").textContent).toContain("greater than zero");
    expect(updateFinancialRecordAction).not.toHaveBeenCalled();
  });
});
