import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createFinancialRecord, getFinancialRecords } from "./financial-records-service";

const record = { id: "record-1", user_id: "user-1", kind: "expense" as const, account_id: "account-1", category_id: "category-1", amount_minor: 4268, currency: "USD", date: "2026-09-13T12:00:00.000Z", is_active: true, created_at: "2026-09-13T12:00:00.000Z", updated_at: "2026-09-13T12:00:00.000Z" };
describe("financial-records-service", () => {
  beforeEach(() => vi.stubGlobal("fetch", vi.fn())); afterEach(() => vi.restoreAllMocks());
  it("persists an income record through the public API", async () => { vi.mocked(fetch).mockResolvedValueOnce({ ok: true, status: 201, json: async () => ({ success: true, data: { ...record, kind: "income" } }) } as Response);
    await expect(createFinancialRecord("token", { kind: "income", account_id: "account-1", category_id: "category-1", amount_minor: 385000, currency: "USD", date: record.date })).resolves.toEqual({ success: true, record: { ...record, kind: "income" } });
  });
  it("requests history filters through the contract query parameters", async () => { vi.mocked(fetch).mockResolvedValueOnce({ ok: true, status: 200, json: async () => ({ success: true, data: [record] }) } as Response);
    await expect(getFinancialRecords("token", { kind: "expense", account_id: "account-1", start_date: "2026-09-01" })).resolves.toEqual({ success: true, records: [record] });
    expect(fetch).toHaveBeenCalledWith("http://localhost:8080/v1/financial-records?kind=expense&account_id=account-1&start_date=2026-09-01", expect.any(Object));
  });
});
