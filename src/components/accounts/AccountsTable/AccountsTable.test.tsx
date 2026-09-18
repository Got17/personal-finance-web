import { describe, expect, it, vi, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { AccountsTable } from "./AccountsTable";
import { Account } from "@/lib/schemas/accounts";

const mockAccount: Account = {
  id: "acc-1",
  user_id: "usr-1",
  name: "Everyday Checking",
  type: "checking",
  currency: "USD",
  description: "Primary salary account",
  is_active: true,
  created_at: "2026-09-07T00:00:00Z",
  updated_at: "2026-09-07T00:00:00Z",
};

describe("AccountsTable", () => {
  afterEach(() => {
    cleanup();
  });

  it("renders empty state when accounts list is empty", () => {
    render(<AccountsTable accounts={[]} />);
    expect(screen.getByText("No accounts match your filters.")).toBeTruthy();
  });

  it("renders accounts table with account information, type, currency, and status", () => {
    render(<AccountsTable accounts={[mockAccount]} />);

    expect(screen.getByRole("table", { name: "Accounts table" })).toBeTruthy();
    expect(screen.getByText("Everyday Checking")).toBeTruthy();
    expect(screen.getByText("Checking")).toBeTruthy();
    expect(screen.getByText("USD")).toBeTruthy();
    expect(screen.getByText("Active")).toBeTruthy();
  });

  it("triggers onEdit and onDeactivate handlers when buttons are clicked", () => {
    const onEdit = vi.fn();
    const onDeactivate = vi.fn();

    render(
      <AccountsTable
        accounts={[mockAccount]}
        onEdit={onEdit}
        onDeactivate={onDeactivate}
      />
    );

    const editBtn = screen.getByRole("button", { name: "Edit Everyday Checking" });
    fireEvent.click(editBtn);
    expect(onEdit).toHaveBeenCalledWith(mockAccount);

    const deactivateBtn = screen.getByRole("button", { name: "Deactivate Everyday Checking" });
    fireEvent.click(deactivateBtn);
    expect(onDeactivate).toHaveBeenCalledWith(mockAccount);
  });

  it("renders onTransfer button when at least 2 active accounts exist and calls handler on click", () => {
    const onTransfer = vi.fn();
    const secondAccount: Account = {
      ...mockAccount,
      id: "acc-2",
      name: "Savings Account",
      type: "savings",
    };

    render(
      <AccountsTable
        accounts={[mockAccount, secondAccount]}
        onTransfer={onTransfer}
      />
    );

    const transferBtn = screen.getByRole("button", { name: "Transfer from Everyday Checking" });
    fireEvent.click(transferBtn);
    expect(onTransfer).toHaveBeenCalledWith(mockAccount);
  });

  it("does not render onTransfer button when fewer than 2 active accounts exist", () => {
    const onTransfer = vi.fn();

    render(
      <AccountsTable
        accounts={[mockAccount]}
        onTransfer={onTransfer}
      />
    );

    expect(screen.queryByRole("button", { name: "Transfer from Everyday Checking" })).toBeNull();
  });
});
