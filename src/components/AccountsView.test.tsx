import { describe, expect, it, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { AccountsView } from "./AccountsView";
import { Account } from "@/lib/schemas/accounts";

const mockInitialAccount: Account = {
  id: "acc-1",
  user_id: "usr-1",
  name: "Everyday Checking",
  type: "checking",
  currency: "USD",
  description: "Primary account",
  is_active: true,
  created_at: "2026-09-07T00:00:00Z",
  updated_at: "2026-09-07T00:00:00Z",
};

describe("AccountsView", () => {
  afterEach(() => {
    cleanup();
  });

  it("renders initial accounts list and Add button with modal closed", () => {
    render(<AccountsView initialAccounts={[mockInitialAccount]} defaultCurrency="USD" />);

    expect(screen.getByText("Your Accounts")).toBeTruthy();
    expect(screen.getByText("1 account")).toBeTruthy();
    expect(screen.getByText("Everyday Checking")).toBeTruthy();
    expect(screen.getByRole("button", { name: /Add new account/i })).toBeTruthy();
    expect(screen.queryByTestId("create-account-modal")).toBeNull();
  });

  it("opens pop-up modal when Add button is clicked and closes on close button click", () => {
    render(<AccountsView initialAccounts={[]} defaultCurrency="USD" />);

    const addButton = screen.getByRole("button", { name: /Add new account/i });
    fireEvent.click(addButton);

    expect(screen.getByTestId("create-account-modal")).toBeTruthy();
    expect(screen.getByRole("heading", { name: "Add New Account" })).toBeTruthy();

    const closeButton = screen.getByRole("button", { name: "Close modal" });
    fireEvent.click(closeButton);

    expect(screen.queryByTestId("create-account-modal")).toBeNull();
  });
});
