import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { DeleteFinancialRecordModal } from "./DeleteFinancialRecordModal";
import { Account } from "@/lib/schemas/accounts";
import { Category } from "@/lib/schemas/categories";
import { FinancialRecord } from "@/lib/schemas/financial-records";

const { archiveFinancialRecordAction } = vi.hoisted(() => ({
  archiveFinancialRecordAction: vi.fn(),
}));

vi.mock("@/app/actions/financial-records", () => ({
  archiveFinancialRecordAction,
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
  note: "Supermarket run",
  is_active: true,
  created_at: "2026-09-13T12:00:00.000Z",
  updated_at: "2026-09-13T12:00:00.000Z",
};

describe("DeleteFinancialRecordModal", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(cleanup);

  it("does not render when isOpen is false", () => {
    render(
      <DeleteFinancialRecordModal
        isOpen={false}
        record={mockRecord}
        accounts={mockAccounts}
        categories={mockCategories}
        onClose={vi.fn()}
        onRecordDeleted={vi.fn()}
      />,
    );

    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("does not render when record is null", () => {
    render(
      <DeleteFinancialRecordModal
        isOpen={true}
        record={null}
        accounts={mockAccounts}
        categories={mockCategories}
        onClose={vi.fn()}
        onRecordDeleted={vi.fn()}
      />,
    );

    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("renders transaction details and prompt", () => {
    render(
      <DeleteFinancialRecordModal
        isOpen={true}
        record={mockRecord}
        accounts={mockAccounts}
        categories={mockCategories}
        onClose={vi.fn()}
        onRecordDeleted={vi.fn()}
      />,
    );

    expect(screen.getByRole("dialog")).toBeTruthy();
    expect(screen.getByRole("heading", { name: "Delete Transaction" })).toBeTruthy();
    expect(screen.getByText(/Supermarket run/)).toBeTruthy();
    expect(screen.getByText(/\$42\.68/)).toBeTruthy();
  });

  it("deletes record when confirmed and calls onRecordDeleted", async () => {
    archiveFinancialRecordAction.mockResolvedValue({
      success: true,
      record: { ...mockRecord, is_active: false },
    });

    const onRecordDeleted = vi.fn();
    const onClose = vi.fn();

    render(
      <DeleteFinancialRecordModal
        isOpen={true}
        record={mockRecord}
        accounts={mockAccounts}
        categories={mockCategories}
        onClose={onClose}
        onRecordDeleted={onRecordDeleted}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: /^delete$/i }));

    await waitFor(() => {
      expect(archiveFinancialRecordAction).toHaveBeenCalledWith("rec-1");
      expect(onRecordDeleted).toHaveBeenCalledWith(expect.objectContaining({ id: "rec-1" }));
      expect(onClose).toHaveBeenCalled();
    });
  });

  it("displays server error banner if archiving fails", async () => {
    archiveFinancialRecordAction.mockResolvedValue({
      success: false,
      error: "Unable to delete this transaction.",
    });

    render(
      <DeleteFinancialRecordModal
        isOpen={true}
        record={mockRecord}
        accounts={mockAccounts}
        categories={mockCategories}
        onClose={vi.fn()}
        onRecordDeleted={vi.fn()}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: /^delete$/i }));

    await waitFor(() => {
      expect(screen.getByRole("alert").textContent).toContain("Unable to delete this transaction.");
    });
  });

  it("closes without archiving when Cancel is clicked", () => {
    const onClose = vi.fn();
    render(
      <DeleteFinancialRecordModal
        isOpen={true}
        record={mockRecord}
        accounts={mockAccounts}
        categories={mockCategories}
        onClose={onClose}
        onRecordDeleted={vi.fn()}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: /^cancel$/i }));
    expect(onClose).toHaveBeenCalled();
    expect(archiveFinancialRecordAction).not.toHaveBeenCalled();
  });
});
