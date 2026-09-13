import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  archiveFinancialRecord,
  createFinancialRecord,
  getFinancialRecords,
  updateFinancialRecord,
} from "./financial-records-service";

const record = {
  id: "record-1",
  user_id: "user-1",
  kind: "expense" as const,
  account_id: "account-1",
  category_id: "category-1",
  amount_minor: 4268,
  currency: "USD",
  date: "2026-09-13T12:00:00.000Z",
  is_active: true,
  created_at: "2026-09-13T12:00:00.000Z",
  updated_at: "2026-09-13T12:00:00.000Z",
};

describe("financial-records-service", () => {
  beforeEach(() => vi.stubGlobal("fetch", vi.fn()));
  afterEach(() => vi.restoreAllMocks());

  it("persists an income record through the public API", async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      status: 201,
      json: async () => ({ success: true, data: { ...record, kind: "income" } }),
    } as Response);
    await expect(
      createFinancialRecord("token", {
        kind: "income",
        account_id: "account-1",
        category_id: "category-1",
        amount_minor: 385000,
        currency: "USD",
        date: record.date,
      }),
    ).resolves.toEqual({ success: true, record: { ...record, kind: "income" } });
  });

  it("requests history filters through the contract query parameters", async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ success: true, data: [record] }),
    } as Response);
    await expect(
      getFinancialRecords("token", {
        kind: "expense",
        account_id: "account-1",
        start_date: "2026-09-01",
      }),
    ).resolves.toEqual({ success: true, records: [record] });
    expect(fetch).toHaveBeenCalledWith(
      "http://localhost:8080/v1/financial-records?kind=expense&account_id=account-1&start_date=2026-09-01",
      expect.any(Object),
    );
  });

  it("updates an existing financial record through PUT /v1/financial-records/:id", async () => {
    const updatedRecord = { ...record, note: "Updated lunch notes", amount_minor: 5000 };
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ success: true, data: updatedRecord }),
    } as Response);

    const result = await updateFinancialRecord("token", "record-1", {
      note: "Updated lunch notes",
      amount_minor: 5000,
    });

    expect(result).toEqual({ success: true, record: updatedRecord });
    expect(fetch).toHaveBeenCalledWith(
      "http://localhost:8080/v1/financial-records/record-1",
      expect.objectContaining({
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer token",
        },
      }),
    );
    const fetchCall = vi.mocked(fetch).mock.calls[0];
    expect(JSON.parse(fetchCall[1]?.body as string)).toEqual({
      amount_minor: 5000,
      note: "Updated lunch notes",
    });
  });

  it("returns error if update validation fails", async () => {
    const result = await updateFinancialRecord("token", "record-1", {
      amount_minor: -100,
    });
    expect(result.success).toBe(false);
    expect(fetch).not.toHaveBeenCalled();
  });

  it("archives an existing financial record through DELETE /v1/financial-records/:id", async () => {
    const archivedRecord = { ...record, is_active: false };
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ success: true, data: archivedRecord }),
    } as Response);

    const result = await archiveFinancialRecord("token", "record-1");

    expect(result).toEqual({ success: true, record: archivedRecord });
    expect(fetch).toHaveBeenCalledWith(
      "http://localhost:8080/v1/financial-records/record-1",
      expect.objectContaining({
        method: "DELETE",
        headers: {
          Authorization: "Bearer token",
        },
      }),
    );
  });

  it("handles server failure when archiving", async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: false,
      status: 404,
      json: async () => ({ success: false, error: "Financial record not found." }),
    } as Response);

    const result = await archiveFinancialRecord("token", "record-unknown");
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBe("Financial record not found.");
    }
  });
});

