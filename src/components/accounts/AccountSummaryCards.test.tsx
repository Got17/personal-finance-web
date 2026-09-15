import { describe, expect, it, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { AccountSummaryCards } from "./AccountSummaryCards";
import { Account } from "@/lib/schemas/accounts";

const mockAccounts: Account[] = [
  {
    id: "acc-1",
    user_id: "usr-1",
    name: "Checking",
    type: "checking",
    currency: "USD",
    is_active: true,
    created_at: "2026-09-07T00:00:00Z",
    updated_at: "2026-09-07T00:00:00Z",
  },
  {
    id: "acc-2",
    user_id: "usr-1",
    name: "Savings",
    type: "savings",
    currency: "USD",
    is_active: false,
    created_at: "2026-09-07T00:00:00Z",
    updated_at: "2026-09-07T00:00:00Z",
  },
  {
    id: "acc-3",
    user_id: "usr-1",
    name: "Credit Card",
    type: "credit_card",
    currency: "EUR",
    is_active: true,
    created_at: "2026-09-07T00:00:00Z",
    updated_at: "2026-09-07T00:00:00Z",
  },
];

describe("AccountSummaryCards", () => {
  afterEach(() => {
    cleanup();
  });

  it("renders summary cards for all tab", () => {
    render(<AccountSummaryCards accounts={mockAccounts} activeTab="all" />);
    expect(screen.getByTestId("summary-cards-all")).toBeTruthy();
    expect(screen.getByText("Banking Accounts")).toBeTruthy();
    expect(screen.getByText("Credit & Loans")).toBeTruthy();
    expect(screen.getByText("Total Accounts")).toBeTruthy();
  });

  it("renders summary cards for banking tab", () => {
    render(<AccountSummaryCards accounts={mockAccounts} activeTab="banking" />);
    expect(screen.getByTestId("summary-cards-banking")).toBeTruthy();
    expect(screen.getByText("Available for transaction records")).toBeTruthy();
  });

  it("renders summary cards for credit tab", () => {
    render(<AccountSummaryCards accounts={mockAccounts} activeTab="credit" />);
    expect(screen.getByTestId("summary-cards-credit")).toBeTruthy();
  });
});
