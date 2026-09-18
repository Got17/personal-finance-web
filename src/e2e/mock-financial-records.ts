import { FinancialRecord } from "@/lib/schemas/financial-records";
import { MockUser } from "./mock-api";
import { validateTransferPrecision } from "@/lib/currency-utils";

function jsonResponse(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

function generateId(prefix: string): string {
  return `${prefix}-${Date.now()}-${crypto.randomUUID().substring(0, 8)}`;
}

const DEFAULT_FX_RATES: Record<string, Record<string, number>> = {
  USD: { EUR: 0.92, THB: 35.5, LAK: 22000, CNY: 7.2 },
  EUR: { USD: 1.087, THB: 38.5, LAK: 23900, CNY: 7.8 },
  THB: { USD: 0.028, EUR: 0.026, LAK: 620, CNY: 0.2 },
  LAK: { USD: 0.00004545, EUR: 0.00004184, THB: 0.00161, CNY: 0.000327 },
  CNY: { USD: 0.139, EUR: 0.128, THB: 4.93, LAK: 3055 },
};

export function getMockFXRate(from: string, to: string): number {
  if (from === to) return 1.0;
  return DEFAULT_FX_RATES[from]?.[to] || 1.0;
}

export function handleFinancialRecordAndTransferRoutes(
  url: URL,
  method: string,
  body: Record<string, unknown>,
  currentUser: MockUser,
  records: Map<string, FinancialRecord>,
  accounts?: Map<string, import("@/lib/schemas/accounts").Account>,
): Response | null {
  const path = url.pathname;

  // GET /v1/fx-quotes?from=USD&to=EUR&date=...
  if (path === "/v1/fx-quotes" && method === "GET") {
    const from = url.searchParams.get("from")?.toUpperCase() || "";
    const to = url.searchParams.get("to")?.toUpperCase() || "";
    if (!from || !to) {
      return jsonResponse({ success: false, error: "VALIDATION_FAILED", message: "Currencies required" }, 422);
    }
    const rate = getMockFXRate(from, to);
    return jsonResponse({
      success: true,
      data: {
        from_currency: from,
        to_currency: to,
        rate,
        date: url.searchParams.get("date") || new Date().toISOString(),
      },
    });
  }

  // POST /v1/transfers (OpenAPI 3.1)
  if (path === "/v1/transfers" && method === "POST") {
    const sourceAccountId = String(body.source_account_id || body.account_id || "");
    const destAccountId = String(body.destination_account_id || "");
    const sourceAmountMinor = Number(body.source_amount_minor ?? body.amount_minor);
    const destAmountMinor = Number(body.destination_amount_minor ?? sourceAmountMinor);
    const srcAcct = accounts?.get(sourceAccountId);
    const destAcct = accounts?.get(destAccountId);
    const sourceCurrency = srcAcct?.currency || String(body.source_currency || body.currency || "USD");
    const destCurrency = destAcct?.currency || String(body.destination_currency || "USD");

    if (sourceAccountId === destAccountId) {
      return jsonResponse({ success: false, error: "VALIDATION_FAILED", message: "Source and destination accounts must be distinct" }, 422);
    }

    if (sourceCurrency === destCurrency && sourceAmountMinor !== destAmountMinor) {
      return jsonResponse({ success: false, error: "VALIDATION_FAILED", message: "Same-currency transfer amounts must be equal" }, 422);
    }

    const rate = typeof body.rate === "number" ? body.rate : (body.fx_quote as { rate?: number })?.rate;
    if (sourceCurrency !== destCurrency) {
      if (!rate) {
        return jsonResponse({ success: false, error: "VALIDATION_FAILED", message: "Exchange rate is required for cross-currency transfers" }, 422);
      }
      if (!validateTransferPrecision(sourceCurrency, destCurrency, sourceAmountMinor, destAmountMinor, rate)) {
        return jsonResponse({ success: false, error: "VALIDATION_FAILED", message: "Destination amount does not match rate conversion precision" }, 422);
      }
    }

    const transferId = generateId("tr");
    const now = new Date().toISOString();

    const quote = rate
      ? {
          id: generateId("fx"),
          rate,
          from_currency: sourceCurrency,
          to_currency: destCurrency,
          provenance: (body.rate !== undefined ? "manual_override" : "provider") as "manual_override" | "provider",
          effective_date: String(body.date || now),
          record_id: transferId,
          created_at: now,
        }
      : undefined;

    // Handle fee if present in CreateTransferRequest
    let feeRecord: FinancialRecord | undefined;
    const feeInput = body.fee as { account_id?: string; category_id?: string; amount_minor?: number; note?: string } | undefined;
    if (feeInput && feeInput.account_id && feeInput.amount_minor) {
      const feeId = generateId("rec");
      feeRecord = {
        id: feeId,
        user_id: currentUser.id,
        kind: "expense",
        account_id: feeInput.account_id,
        category_id: feeInput.category_id,
        amount_minor: Number(feeInput.amount_minor),
        currency: sourceCurrency,
        date: String(body.date || now),
        note: feeInput.note || "Transfer fee",
        is_active: true,
        linked_transfer_id: transferId,
        created_at: now,
        updated_at: now,
      };
      records.set(feeId, feeRecord);
    }

    const transferRecord: FinancialRecord = {
      id: transferId,
      user_id: currentUser.id,
      kind: "transfer",
      account_id: sourceAccountId,
      destination_account_id: destAccountId,
      amount_minor: sourceAmountMinor,
      destination_amount_minor: destAmountMinor,
      currency: sourceCurrency,
      destination_currency: destCurrency,
      date: String(body.date || now),
      note: typeof body.note === "string" ? body.note : undefined,
      is_active: true,
      historical_fx_quote: quote,
      transfer_fee_record_id: feeRecord?.id,
      created_at: now,
      updated_at: now,
    };
    records.set(transferId, transferRecord);

    const transferResponse = {
      id: transferId,
      user_id: currentUser.id,
      kind: "transfer",
      source_account_id: sourceAccountId,
      destination_account_id: destAccountId,
      source_amount_minor: sourceAmountMinor,
      destination_amount_minor: destAmountMinor,
      source_currency: sourceCurrency,
      destination_currency: destCurrency,
      date: String(body.date || now),
      note: typeof body.note === "string" ? body.note : undefined,
      is_active: true,
      historical_fx_quote: quote,
      transfer_fee_record_id: feeRecord?.id,
      transfer_fee: feeRecord
        ? {
            id: feeRecord.id,
            user_id: feeRecord.user_id,
            kind: "expense",
            account_id: feeRecord.account_id,
            category_id: feeRecord.category_id,
            amount_minor: feeRecord.amount_minor,
            currency: feeRecord.currency,
            date: feeRecord.date,
            note: feeRecord.note,
            is_active: feeRecord.is_active,
            created_at: feeRecord.created_at,
            updated_at: feeRecord.updated_at,
          }
        : undefined,
      created_at: now,
      updated_at: now,
    };

    return jsonResponse({ success: true, data: transferResponse, message: "Transfer created successfully" }, 201);
  }

  // GET /v1/transfers (OpenAPI 3.1)
  if (path === "/v1/transfers" && method === "GET") {
    const accountFilter = url.searchParams.get("account_id");
    const transfers = Array.from(records.values())
      .filter((r) => r.user_id === currentUser.id && r.kind === "transfer" && r.is_active)
      .filter(
        (r) =>
          !accountFilter ||
          r.account_id === accountFilter ||
          r.destination_account_id === accountFilter,
      )
      .map((r) => ({
        id: r.id,
        user_id: r.user_id,
        kind: "transfer" as const,
        source_account_id: r.account_id,
        destination_account_id: r.destination_account_id || "",
        source_amount_minor: r.amount_minor,
        destination_amount_minor: r.destination_amount_minor || r.amount_minor,
        source_currency: r.currency,
        destination_currency: r.destination_currency || r.currency,
        date: r.date,
        note: r.note,
        is_active: r.is_active,
        historical_fx_quote: r.historical_fx_quote,
        transfer_fee_record_id: r.transfer_fee_record_id,
        created_at: r.created_at,
        updated_at: r.updated_at,
      }))
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return jsonResponse({ success: true, data: transfers, message: "Transfers list." }, 200);
  }

  // GET /v1/transfers/:id (OpenAPI 3.1)
  if (path.startsWith("/v1/transfers/") && method === "GET") {
    const transferId = path.replace("/v1/transfers/", "");
    const r = records.get(transferId);
    if (!r || r.user_id !== currentUser.id || r.kind !== "transfer") {
      return jsonResponse({ success: false, error: "NOT_FOUND", message: "Transfer not found." }, 404);
    }
    const transferData = {
      id: r.id,
      user_id: r.user_id,
      kind: "transfer" as const,
      source_account_id: r.account_id,
      destination_account_id: r.destination_account_id || "",
      source_amount_minor: r.amount_minor,
      destination_amount_minor: r.destination_amount_minor || r.amount_minor,
      source_currency: r.currency,
      destination_currency: r.destination_currency || r.currency,
      date: r.date,
      note: r.note,
      is_active: r.is_active,
      historical_fx_quote: r.historical_fx_quote,
      transfer_fee_record_id: r.transfer_fee_record_id,
      created_at: r.created_at,
      updated_at: r.updated_at,
    };
    return jsonResponse({ success: true, data: transferData, message: "Transfer found." }, 200);
  }

  // /v1/financial-records collection
  if (path === "/v1/financial-records") {
    if (method === "GET") {
      const kindFilter = url.searchParams.get("kind");
      const accountFilter = url.searchParams.get("account_id");
      const categoryFilter = url.searchParams.get("category_id");
      const userRecords = Array.from(records.values())
        .filter((r) => r.user_id === currentUser.id && r.is_active)
        .filter((r) => !kindFilter || r.kind === kindFilter)
        .filter((r) => !categoryFilter || r.category_id === categoryFilter)
        .filter(
          (r) =>
            !accountFilter ||
            r.account_id === accountFilter ||
            r.destination_account_id === accountFilter,
        )
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

      return jsonResponse({ success: true, data: userRecords, message: "Records retrieved" }, 200);
    }

    if (method === "POST") {
      const recId = generateId("rec");
      const now = new Date().toISOString();
      const record: FinancialRecord = {
        id: recId,
        user_id: currentUser.id,
        kind: body.kind as FinancialRecord["kind"],
        account_id: String(body.account_id),
        destination_account_id: body.destination_account_id ? String(body.destination_account_id) : undefined,
        category_id: body.category_id ? String(body.category_id) : undefined,
        amount_minor: Number(body.amount_minor),
        destination_amount_minor: body.destination_amount_minor ? Number(body.destination_amount_minor) : undefined,
        currency: String(body.currency),
        destination_currency: body.destination_currency ? String(body.destination_currency) : undefined,
        date: String(body.date || now),
        note: typeof body.note === "string" ? body.note : undefined,
        linked_transfer_id: body.linked_transfer_id ? String(body.linked_transfer_id) : undefined,
        is_active: true,
        created_at: now,
        updated_at: now,
      };
      records.set(recId, record);
      return jsonResponse({ success: true, data: record, message: "Record created" }, 201);
    }
  }

  // /v1/financial-records/:id
  if (path.startsWith("/v1/financial-records/")) {
    const id = path.substring("/v1/financial-records/".length);
    const existing = records.get(id);
    if (!existing) {
      return jsonResponse({ success: false, error: "NOT_FOUND", message: "Record not found" }, 404);
    }
    if (existing.user_id !== currentUser.id) {
      return jsonResponse({ success: false, error: "FORBIDDEN", message: "Forbidden access" }, 403);
    }
    if (method === "GET") {
      return jsonResponse({ success: true, data: existing }, 200);
    }
    if (method === "PUT" || method === "PATCH") {
      const updated: FinancialRecord = { ...existing, ...body, updated_at: new Date().toISOString() };
      records.set(id, updated);
      return jsonResponse({ success: true, data: updated }, 200);
    }
    if (method === "DELETE") {
      const archived: FinancialRecord = { ...existing, is_active: false, updated_at: new Date().toISOString() };
      records.set(id, archived);
      return jsonResponse({ success: true, data: archived }, 200);
    }
  }

  return null;
}
