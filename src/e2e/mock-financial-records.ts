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

  // POST /v1/transfers
  if (path === "/v1/transfers" && method === "POST") {
    const accountId = String(body.account_id || "");
    const destAccountId = String(body.destination_account_id || "");
    const amountMinor = Number(body.amount_minor);
    const destAmountMinor = Number(body.destination_amount_minor);
    const currency = String(body.currency || "");
    const destCurrency = String(body.destination_currency || "");

    if (accountId === destAccountId) {
      return jsonResponse({ success: false, error: "VALIDATION_FAILED", message: "Source and destination accounts must be distinct" }, 422);
    }

    if (currency === destCurrency && amountMinor !== destAmountMinor) {
      return jsonResponse({ success: false, error: "VALIDATION_FAILED", message: "Same-currency transfer amounts must be equal" }, 422);
    }

    const fxQuote = body.fx_quote as { rate?: number; provenance?: "provider" | "manual_override" } | undefined;
    if (currency !== destCurrency) {
      if (!fxQuote || !fxQuote.rate) {
        return jsonResponse({ success: false, error: "VALIDATION_FAILED", message: "Exchange rate is required for cross-currency transfers" }, 422);
      }
      if (!validateTransferPrecision(currency, destCurrency, amountMinor, destAmountMinor, fxQuote.rate)) {
        return jsonResponse({ success: false, error: "VALIDATION_FAILED", message: "Destination amount does not match rate conversion precision" }, 422);
      }
    }

    const transferId = generateId("tr");
    const now = new Date().toISOString();
    const transferRecord: FinancialRecord = {
      id: transferId,
      user_id: currentUser.id,
      kind: "transfer",
      account_id: accountId,
      destination_account_id: destAccountId,
      amount_minor: amountMinor,
      destination_amount_minor: destAmountMinor,
      currency,
      destination_currency: destCurrency,
      date: String(body.date || now),
      note: typeof body.note === "string" ? body.note : undefined,
      is_active: true,
      historical_fx_quote: fxQuote?.rate
        ? {
            rate: fxQuote.rate,
            from_currency: currency,
            to_currency: destCurrency,
            provenance: fxQuote.provenance || "provider",
            effective_date: String(body.date || now),
          }
        : undefined,
      created_at: now,
      updated_at: now,
    };
    records.set(transferId, transferRecord);

    return jsonResponse({ success: true, data: transferRecord, message: "Transfer created" }, 201);
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
