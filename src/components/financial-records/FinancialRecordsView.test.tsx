import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { FinancialRecordsView } from "./FinancialRecordsView";

const { createFinancialRecordAction } = vi.hoisted(() => ({ createFinancialRecordAction: vi.fn() }));
vi.mock("@/app/actions/financial-records", () => ({ createFinancialRecordAction }));
const accounts = [{ id: "account-1", user_id: "user-1", name: "Daily cash", type: "checking" as const, currency: "USD", is_active: true, created_at: "", updated_at: "" }];
const categories = [{ id: "expense-1", user_id: "user-1", name: "Groceries", type: "expense" as const, is_active: true, created_at: "", updated_at: "" }, { id: "income-1", user_id: "user-1", name: "Salary", type: "income" as const, is_active: true, created_at: "", updated_at: "" }];
const record = { id: "record-1", user_id: "user-1", kind: "expense" as const, account_id: "account-1", category_id: "expense-1", amount_minor: 4268, currency: "USD", date: "2026-09-13T12:00:00.000Z", is_active: true, created_at: "", updated_at: "" };
describe("FinancialRecordsView", () => {
  beforeEach(() => createFinancialRecordAction.mockReset());
  afterEach(cleanup);
  it("gives visible validation feedback before submission", () => { render(<FinancialRecordsView initialRecords={[]} accounts={accounts} categories={categories} />); fireEvent.click(screen.getByRole("button", { name: "Save transaction" })); expect(screen.getByRole("alert").textContent).toContain("Choose an account"); });
  it("shows a saved record and filters history by kind", async () => { createFinancialRecordAction.mockResolvedValue({ success: true, record }); render(<FinancialRecordsView initialRecords={[]} accounts={accounts} categories={categories} />); fireEvent.change(screen.getByLabelText("Account"), { target: { value: "account-1" } }); fireEvent.change(screen.getByLabelText("Category"), { target: { value: "expense-1" } }); fireEvent.change(screen.getByLabelText("Amount"), { target: { value: "42.68" } }); fireEvent.click(screen.getByRole("button", { name: "Save transaction" })); await waitFor(() => expect(screen.getByText("1 records")).toBeTruthy()); fireEvent.change(screen.getByLabelText("Filter by type"), { target: { value: "income" } }); expect(screen.getByText("No transactions match these filters.")).toBeTruthy(); });
});
