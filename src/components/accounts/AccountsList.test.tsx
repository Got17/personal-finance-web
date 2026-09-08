import { describe, expect, it, afterEach, vi } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { AccountsList } from "./AccountsList";
import { Account } from "@/lib/schemas/accounts";

const mockAccounts: Account[] = [
  {
    id: "acc-1",
    user_id: "usr-1",
    name: "Everyday Checking",
    type: "checking",
    currency: "USD",
    description: "Daily expenses",
    is_active: true,
    created_at: "2026-09-07T00:00:00Z",
    updated_at: "2026-09-07T00:00:00Z",
  },
  {
    id: "acc-2",
    user_id: "usr-1",
    name: "Old Savings",
    type: "savings",
    currency: "EUR",
    description: null,
    is_active: false,
    created_at: "2026-09-07T00:00:00Z",
    updated_at: "2026-09-07T00:00:00Z",
  },
];

describe("AccountsList", () => {
  afterEach(() => {
    cleanup();
  });

  it("renders empty state when accounts array is empty", () => {
    render(<AccountsList accounts={[]} />);

    expect(screen.getByText("No accounts created yet")).toBeTruthy();
    expect(
      screen.getByText(/Add your first bank account, savings account, or investment portfolio/i),
    ).toBeTruthy();
  });

  it("renders account cards with name, type, currency, and active status", () => {
    render(<AccountsList accounts={mockAccounts} />);

    expect(screen.getByText("Everyday Checking")).toBeTruthy();
    expect(screen.getByText("Daily expenses")).toBeTruthy();
    expect(screen.getByText("USD")).toBeTruthy();
    expect(screen.getByText("Active")).toBeTruthy();

    expect(screen.getByText("Old Savings")).toBeTruthy();
    expect(screen.getByText("EUR")).toBeTruthy();
    expect(screen.getByText("Inactive")).toBeTruthy();
  });

  it("triggers onEditClick and onDeactivateClick callbacks when action buttons are clicked", () => {
    const onEdit = vi.fn();
    const onDeactivate = vi.fn();

    render(
      <AccountsList
        accounts={mockAccounts}
        onEditClick={onEdit}
        onDeactivateClick={onDeactivate}
      />
    );

    const editBtn = screen.getByRole("button", { name: "Edit Everyday Checking" });
    fireEvent.click(editBtn);
    expect(onEdit).toHaveBeenCalledWith(mockAccounts[0]);

    const deactivateBtn = screen.getByRole("button", { name: "Deactivate Everyday Checking" });
    fireEvent.click(deactivateBtn);
    expect(onDeactivate).toHaveBeenCalledWith(mockAccounts[0]);

    // Inactive account should not show deactivate button
    expect(screen.queryByRole("button", { name: "Deactivate Old Savings" })).toBeNull();
  });

  it("renders non-interactive card container and relies on action buttons", () => {
    const onEdit = vi.fn();
    render(<AccountsList accounts={[mockAccounts[0]]} onEditClick={onEdit} />);

    const card = screen.getByTestId("account-card-acc-1");
    expect(card.getAttribute("role")).toBeNull();
    expect(card.getAttribute("tabIndex")).toBeNull();

    const editBtn = screen.getByRole("button", { name: "Edit Everyday Checking" });
    fireEvent.click(editBtn);
    expect(onEdit).toHaveBeenCalledWith(mockAccounts[0]);
  });
});


