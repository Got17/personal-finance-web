import { describe, expect, it, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
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
});
