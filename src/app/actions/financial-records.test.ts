import { describe, expect, it, vi, beforeEach } from "vitest";
import {
  createFinancialRecordAction,
  getFinancialRecordsAction,
  updateFinancialRecordAction,
  archiveFinancialRecordAction,
} from "./financial-records";
import * as session from "@/lib/session";
import * as financialRecordsService from "@/lib/financial-records-service";
import { FinancialRecord } from "@/lib/schemas/financial-records";
import { revalidatePath } from "next/cache";

vi.mock("@/lib/session", () => ({
  getSessionToken: vi.fn(),
  withAuth: vi.fn(async (handler) => {
    const token = await session.getSessionToken();
    if (!token) {
      return { success: false, error: "Unauthenticated." };
    }
    return handler(token);
  }),
}));

vi.mock("@/lib/financial-records-service", () => ({
  createFinancialRecord: vi.fn(),
  getFinancialRecords: vi.fn(),
  updateFinancialRecord: vi.fn(),
  archiveFinancialRecord: vi.fn(),
}));

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

const mockRecord: FinancialRecord = {
  id: "rec-1",
  user_id: "user-1",
  kind: "expense",
  account_id: "acc-1",
  category_id: "cat-1",
  amount_minor: 4200,
  currency: "USD",
  date: "2026-09-13T12:00:00.000Z",
  note: "Coffee",
  is_active: true,
  created_at: "2026-09-13T12:00:00.000Z",
  updated_at: "2026-09-13T12:00:00.000Z",
};

describe("financial-records server actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("createFinancialRecordAction", () => {
    it("returns error if user is unauthenticated", async () => {
      vi.mocked(session.getSessionToken).mockResolvedValue(null);

      const result = await createFinancialRecordAction({
        kind: "expense",
        account_id: "acc-1",
        category_id: "cat-1",
        amount_minor: 4200,
        currency: "USD",
        date: mockRecord.date,
      });

      expect(result).toEqual({ success: false, error: "Unauthenticated." });
    });

    it("creates record and revalidates /transactions on success", async () => {
      vi.mocked(session.getSessionToken).mockResolvedValue("test-token");
      vi.mocked(financialRecordsService.createFinancialRecord).mockResolvedValue({
        success: true,
        record: mockRecord,
      });

      const result = await createFinancialRecordAction({
        kind: "expense",
        account_id: "acc-1",
        category_id: "cat-1",
        amount_minor: 4200,
        currency: "USD",
        date: mockRecord.date,
      });

      expect(result).toEqual({ success: true, record: mockRecord });
      expect(revalidatePath).toHaveBeenCalledWith("/transactions");
    });
  });

  describe("getFinancialRecordsAction", () => {
    it("calls service with token and filters", async () => {
      vi.mocked(session.getSessionToken).mockResolvedValue("test-token");
      vi.mocked(financialRecordsService.getFinancialRecords).mockResolvedValue({
        success: true,
        records: [mockRecord],
      });

      const result = await getFinancialRecordsAction({ kind: "expense" });
      expect(result).toEqual({ success: true, records: [mockRecord] });
      expect(financialRecordsService.getFinancialRecords).toHaveBeenCalledWith("test-token", {
        kind: "expense",
      });
    });
  });

  describe("updateFinancialRecordAction", () => {
    it("returns error if unauthenticated", async () => {
      vi.mocked(session.getSessionToken).mockResolvedValue(null);

      const result = await updateFinancialRecordAction("rec-1", {
        note: "Updated note",
      });

      expect(result).toEqual({ success: false, error: "Unauthenticated." });
    });

    it("updates record and revalidates /transactions on success", async () => {
      vi.mocked(session.getSessionToken).mockResolvedValue("test-token");
      const updated = { ...mockRecord, note: "Updated note" };
      vi.mocked(financialRecordsService.updateFinancialRecord).mockResolvedValue({
        success: true,
        record: updated,
      });

      const result = await updateFinancialRecordAction("rec-1", {
        note: "Updated note",
      });

      expect(result).toEqual({ success: true, record: updated });
      expect(financialRecordsService.updateFinancialRecord).toHaveBeenCalledWith(
        "test-token",
        "rec-1",
        { note: "Updated note" },
      );
      expect(revalidatePath).toHaveBeenCalledWith("/transactions");
    });
  });

  describe("archiveFinancialRecordAction", () => {
    it("returns error if unauthenticated", async () => {
      vi.mocked(session.getSessionToken).mockResolvedValue(null);

      const result = await archiveFinancialRecordAction("rec-1");
      expect(result).toEqual({ success: false, error: "Unauthenticated." });
    });

    it("archives record and revalidates /transactions on success", async () => {
      vi.mocked(session.getSessionToken).mockResolvedValue("test-token");
      const archived = { ...mockRecord, is_active: false };
      vi.mocked(financialRecordsService.archiveFinancialRecord).mockResolvedValue({
        success: true,
        record: archived,
      });

      const result = await archiveFinancialRecordAction("rec-1");
      expect(result).toEqual({ success: true, record: archived });
      expect(financialRecordsService.archiveFinancialRecord).toHaveBeenCalledWith(
        "test-token",
        "rec-1",
      );
      expect(revalidatePath).toHaveBeenCalledWith("/transactions");
    });
  });

  describe("createTransferAction", () => {
    it("returns error if unauthenticated", async () => {
      vi.mocked(session.getSessionToken).mockResolvedValue(null);

      const { createTransferAction } = await import("./financial-records");
      const result = await createTransferAction({
        account_id: "acc-1",
        destination_account_id: "acc-2",
        amount_minor: 5000,
        destination_amount_minor: 5000,
        currency: "USD",
        destination_currency: "USD",
        date: mockRecord.date,
      });

      expect(result).toEqual({ success: false, error: "Unauthenticated." });
    });
  });

  describe("getFXQuoteAction", () => {
    it("returns error if unauthenticated", async () => {
      vi.mocked(session.getSessionToken).mockResolvedValue(null);

      const { getFXQuoteAction } = await import("./financial-records");
      const result = await getFXQuoteAction("USD", "EUR");

      expect(result).toEqual({ success: false, error: "Unauthenticated." });
    });
  });
});

