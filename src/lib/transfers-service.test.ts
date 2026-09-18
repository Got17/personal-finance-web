import { describe, it, expect, vi, beforeEach } from "vitest";
import { createTransfer, getFXQuote } from "./transfers-service";
import { CreateTransferInput } from "./schemas/transfers";

describe("transfers-service", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  const validSameCurrencyTransfer: CreateTransferInput = {
    account_id: "acc-source-1",
    destination_account_id: "acc-dest-2",
    amount_minor: 5000,
    destination_amount_minor: 5000,
    currency: "USD",
    destination_currency: "USD",
    date: "2026-09-17T12:00:00.000Z",
    note: "Funds movement",
  };

  describe("getFXQuote", () => {
    it("fetches fx quote successfully", async () => {
      const mockQuote = {
        rate: 0.92,
        from_currency: "USD",
        to_currency: "EUR",
        date: "2026-09-17T12:00:00.000Z",
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ success: true, data: mockQuote }),
      });

      const result = await getFXQuote("test-token", "USD", "EUR", "2026-09-17T12:00:00.000Z");
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.rate).toBe(0.92);
        expect(result.from_currency).toBe("USD");
        expect(result.to_currency).toBe("EUR");
      }
    });

    it("handles fx quote fetch failure gracefully", async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 404,
        json: () => Promise.resolve({ success: false, error: "Rate unavailable" }),
      });

      const result = await getFXQuote("test-token", "USD", "LAK");
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBeDefined();
      }
    });
  });

  describe("createTransfer", () => {
    it("creates same-currency transfer successfully via /v1/transfers", async () => {
      const mockRecord = {
        id: "tr-123",
        user_id: "user-1",
        kind: "transfer",
        account_id: "acc-source-1",
        destination_account_id: "acc-dest-2",
        amount_minor: 5000,
        destination_amount_minor: 5000,
        currency: "USD",
        destination_currency: "USD",
        date: "2026-09-17T12:00:00.000Z",
        note: "Funds movement",
        is_active: true,
        created_at: "2026-09-17T12:00:00.000Z",
        updated_at: "2026-09-17T12:00:00.000Z",
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ success: true, data: mockRecord }),
      });

      const result = await createTransfer("test-token", validSameCurrencyTransfer);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.record.id).toBe("tr-123");
        expect(result.record.kind).toBe("transfer");
      }
    });

    it("creates cross-currency transfer with retained FX quote", async () => {
      const crossCurrencyTransfer: CreateTransferInput = {
        account_id: "acc-source-1",
        destination_account_id: "acc-dest-2",
        amount_minor: 10000,
        destination_amount_minor: 9200,
        currency: "USD",
        destination_currency: "EUR",
        date: "2026-09-17T12:00:00.000Z",
        fx_quote: {
          rate: 0.92,
          provenance: "provider",
        },
      };

      const mockRecord = {
        id: "tr-cross-123",
        user_id: "user-1",
        kind: "transfer",
        account_id: "acc-source-1",
        destination_account_id: "acc-dest-2",
        amount_minor: 10000,
        destination_amount_minor: 9200,
        currency: "USD",
        destination_currency: "EUR",
        date: "2026-09-17T12:00:00.000Z",
        is_active: true,
        historical_fx_quote: {
          rate: 0.92,
          provenance: "provider",
          from_currency: "USD",
          to_currency: "EUR",
          effective_date: "2026-09-17T12:00:00.000Z",
        },
        created_at: "2026-09-17T12:00:00.000Z",
        updated_at: "2026-09-17T12:00:00.000Z",
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ success: true, data: mockRecord }),
      });

      const result = await createTransfer("test-token", crossCurrencyTransfer);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.record.id).toBe("tr-cross-123");
        expect(result.record.destination_amount_minor).toBe(9200);
      }
    });

    it("creates linked transfer fee expense when fee is specified", async () => {
      const transferWithFee: CreateTransferInput = {
        ...validSameCurrencyTransfer,
        fee: {
          account_id: "acc-source-1",
          category_id: "cat-bank-fees",
          amount_minor: 250,
          currency: "USD",
          note: "Transfer processing fee",
        },
      };

      const mockTransferRecord = {
        id: "tr-123",
        user_id: "user-1",
        kind: "transfer",
        account_id: "acc-source-1",
        destination_account_id: "acc-dest-2",
        amount_minor: 5000,
        destination_amount_minor: 5000,
        currency: "USD",
        destination_currency: "USD",
        date: "2026-09-17T12:00:00.000Z",
        is_active: true,
        created_at: "2026-09-17T12:00:00.000Z",
        updated_at: "2026-09-17T12:00:00.000Z",
      };

      const mockFeeRecord = {
        id: "fee-456",
        user_id: "user-1",
        kind: "expense",
        account_id: "acc-source-1",
        category_id: "cat-bank-fees",
        amount_minor: 250,
        currency: "USD",
        date: "2026-09-17T12:00:00.000Z",
        note: "Transfer processing fee",
        linked_transfer_id: "tr-123",
        is_active: true,
        created_at: "2026-09-17T12:00:00.000Z",
        updated_at: "2026-09-17T12:00:00.000Z",
      };

      global.fetch = vi
        .fn()
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ success: true, data: mockTransferRecord }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ success: true, data: mockFeeRecord }),
        });

      const result = await createTransfer("test-token", transferWithFee);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.record.id).toBe("tr-123");
        expect(result.feeRecord?.id).toBe("fee-456");
        expect(result.feeRecord?.kind).toBe("expense");
      }
    });

    it("creates transfer with atomic fee response directly from OpenAPI /v1/transfers", async () => {
      const transferWithFee: CreateTransferInput = {
        ...validSameCurrencyTransfer,
        fee: {
          account_id: "acc-source-1",
          category_id: "cat-bank-fees",
          amount_minor: 250,
          currency: "USD",
          note: "Transfer processing fee",
        },
      };

      const openApiTransferResponse = {
        id: "tr-openapi-1",
        user_id: "user-1",
        kind: "transfer",
        source_account_id: "acc-source-1",
        destination_account_id: "acc-dest-2",
        source_amount_minor: 5000,
        destination_amount_minor: 5000,
        source_currency: "USD",
        destination_currency: "USD",
        date: "2026-09-17T12:00:00.000Z",
        transfer_fee_record_id: "fee-openapi-1",
        transfer_fee: {
          id: "fee-openapi-1",
          user_id: "user-1",
          kind: "expense",
          account_id: "acc-source-1",
          category_id: "cat-bank-fees",
          amount_minor: 250,
          currency: "USD",
          date: "2026-09-17T12:00:00.000Z",
          note: "Transfer processing fee",
          is_active: true,
          created_at: "2026-09-17T12:00:00.000Z",
          updated_at: "2026-09-17T12:00:00.000Z",
        },
        is_active: true,
        created_at: "2026-09-17T12:00:00.000Z",
        updated_at: "2026-09-17T12:00:00.000Z",
      };

      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ success: true, data: openApiTransferResponse }),
      });

      const result = await createTransfer("test-token", transferWithFee);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.record.id).toBe("tr-openapi-1");
        expect(result.record.account_id).toBe("acc-source-1");
        expect(result.record.amount_minor).toBe(5000);
        expect(result.feeRecord?.id).toBe("fee-openapi-1");
        expect(result.feeRecord?.linked_transfer_id).toBe("tr-openapi-1");
      }
      expect(global.fetch).toHaveBeenCalledTimes(1);
    });

    it("fails validation if input is invalid", async () => {
      const invalidInput = {
        ...validSameCurrencyTransfer,
        amount_minor: -10,
      } as unknown as CreateTransferInput;

      const result = await createTransfer("test-token", invalidInput);
      expect(result.success).toBe(false);
    });
  });

  describe("listTransfers and getTransfer", () => {
    it("lists transfers with filter parameters", async () => {
      const { listTransfers } = await import("./transfers-service");
      const mockList = [
        {
          id: "tr-1",
          user_id: "user-1",
          kind: "transfer",
          source_account_id: "acc-1",
          destination_account_id: "acc-2",
          source_amount_minor: 1000,
          destination_amount_minor: 1000,
          source_currency: "USD",
          destination_currency: "USD",
          date: "2026-09-17T12:00:00.000Z",
          is_active: true,
          created_at: "2026-09-17T12:00:00.000Z",
          updated_at: "2026-09-17T12:00:00.000Z",
        },
      ];

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ success: true, data: mockList }),
      });

      const res = await listTransfers("test-token", { accountId: "acc-1" });
      expect(res.success).toBe(true);
      if (res.success) {
        expect(res.transfers.length).toBe(1);
        expect(res.transfers[0]?.id).toBe("tr-1");
      }
    });

    it("gets a single transfer by id", async () => {
      const { getTransfer } = await import("./transfers-service");
      const mockItem = {
        id: "tr-1",
        user_id: "user-1",
        kind: "transfer",
        source_account_id: "acc-1",
        destination_account_id: "acc-2",
        source_amount_minor: 1000,
        destination_amount_minor: 1000,
        source_currency: "USD",
        destination_currency: "USD",
        date: "2026-09-17T12:00:00.000Z",
        is_active: true,
        created_at: "2026-09-17T12:00:00.000Z",
        updated_at: "2026-09-17T12:00:00.000Z",
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ success: true, data: mockItem }),
      });

      const res = await getTransfer("test-token", "tr-1");
      expect(res.success).toBe(true);
      if (res.success) {
        expect(res.transfer.id).toBe("tr-1");
      }
    });
  });
});
