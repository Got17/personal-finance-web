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
    name: "Brokerage Reserve",
    type: "investment",
    currency: "EUR",
    is_active: true,
    created_at: "2026-09-07T00:00:00Z",
    updated_at: "2026-09-07T00:00:00Z",
  },
];

import { AccountTab } from "../AccountsTable/AccountSubTabs";

describe("AccountSummaryCards", () => {
  afterEach(() => {
    cleanup();
  });

  it("renders summary cards for all tab", () => {
    render(<AccountSummaryCards accounts={mockAccounts} activeTab={AccountTab.All} />);
    expect(screen.getByTestId("summary-cards-all")).toBeTruthy();
    expect(screen.getByText("Banking Accounts")).toBeTruthy();
    expect(screen.getByText("Investments & Assets")).toBeTruthy();
    expect(screen.getByText("Total Accounts")).toBeTruthy();
  });

  it("renders summary cards for banking tab", () => {
    render(<AccountSummaryCards accounts={mockAccounts} activeTab={AccountTab.Banking} />);
    expect(screen.getByTestId("summary-cards-banking")).toBeTruthy();
    expect(screen.getByText("Available for transaction records")).toBeTruthy();
  });

  it("renders summary cards for investment tab", () => {
    render(<AccountSummaryCards accounts={mockAccounts} activeTab={AccountTab.Investment} />);
    expect(screen.getByTestId("summary-cards-investment")).toBeTruthy();
    expect(screen.getByText("Tracked asset portfolios")).toBeTruthy();
  });
});
