import {
  CreateTransferInput,
  createTransferSchema,
  TransferResponse,
  transferResponseToFinancialRecord,
  transferFeeResponseToFinancialRecord,
} from "@/lib/schemas/transfers";
import { FinancialRecord } from "@/lib/schemas/financial-records";

function getBaseUrl(): string {
  return process.env.API_BASE_URL || "http://localhost:8080";
}

type Result<T> =
  | ({ success: true } & T)
  | { success: false; error: string; status?: number };

async function dataFor(response: Response) {
  try {
    return (await response.json()) as {
      success?: boolean;
      message?: string;
      error?: string;
      data?: unknown;
    };
  } catch {
    return null;
  }
}

function errorMessage(
  response: Response,
  data: { message?: string; error?: string } | null,
): string {
  if (data?.message) return data.message;
  if (data?.error) return data.error;
  if (response.status === 401 || response.status === 403) {
    return "Unauthenticated or invalid token.";
  }
  if (response.ok) {
    return "Invalid response from server.";
  }
  return `HTTP error ${response.status}`;
}

export async function getFXQuote(
  token: string,
  from: string,
  to: string,
  date?: string,
): Promise<Result<{ rate: number; from_currency: string; to_currency: string; date: string }>> {
  const params = new URLSearchParams({ from, to });
  if (date) params.set("date", date);

  try {
    const headers: Record<string, string> = {};
    if (token) headers.Authorization = `Bearer ${token}`;

    const response = await fetch(`${getBaseUrl()}/v1/fx-quotes?${params.toString()}`, {
      headers,
    });
    const data = await dataFor(response);
    if (!response.ok || !data?.success || !data.data) {
      return { success: false, error: errorMessage(response, data), status: response.status };
    }
    const quoteData = data.data as {
      rate: number;
      from_currency: string;
      to_currency: string;
      date: string;
    };
    return {
      success: true,
      rate: quoteData.rate,
      from_currency: quoteData.from_currency,
      to_currency: quoteData.to_currency,
      date: quoteData.date,
    };
  } catch {
    return { success: false, error: "Unable to retrieve FX quote from server." };
  }
}

export async function createTransfer(
  token: string,
  input: CreateTransferInput,
): Promise<Result<{ record: FinancialRecord; feeRecord?: FinancialRecord }>> {
  const validation = createTransferSchema.safeParse(input);
  if (!validation.success) {
    return {
      success: false,
      error: validation.error.issues[0]?.message || "Invalid transfer details provided.",
    };
  }

  const payload = validation.data;
  const sourceAccountId = payload.source_account_id || payload.account_id!;
  const sourceAmountMinor = payload.source_amount_minor ?? payload.amount_minor!;
  const destinationAccountId = payload.destination_account_id;
  const destinationAmountMinor = payload.destination_amount_minor;
  const rate = payload.rate ?? payload.fx_quote?.rate;

  const requestBody: Record<string, unknown> = {
    source_account_id: sourceAccountId,
    destination_account_id: destinationAccountId,
    source_amount_minor: sourceAmountMinor,
    date: payload.date,
  };
  if (destinationAmountMinor !== undefined) {
    requestBody.destination_amount_minor = destinationAmountMinor;
  }
  if (payload.note) {
    requestBody.note = payload.note;
  }
  if (rate !== undefined && rate > 0) {
    requestBody.rate = rate;
  }
  if (payload.fee) {
    requestBody.fee = {
      account_id: payload.fee.account_id,
      category_id: payload.fee.category_id,
      amount_minor: payload.fee.amount_minor,
      note: payload.fee.note,
    };
  }

  try {
    // 1. Send transfer creation request matching OpenAPI spec
    let response = await fetch(`${getBaseUrl()}/v1/transfers`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(requestBody),
    });

    // Fallback: If /v1/transfers endpoint is unavailable, fall back to /v1/financial-records
    if (response.status === 404) {
      response = await fetch(`${getBaseUrl()}/v1/financial-records`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          kind: "transfer",
          account_id: sourceAccountId,
          destination_account_id: destinationAccountId,
          amount_minor: sourceAmountMinor,
          destination_amount_minor: destinationAmountMinor,
          currency: payload.source_currency || payload.currency,
          destination_currency: payload.destination_currency,
          date: payload.date,
          note: payload.note,
          historical_fx_quote: payload.fx_quote,
        }),
      });
    }

    const data = await dataFor(response);
    if (!response.ok || !data?.success || !data.data) {
      return { success: false, error: errorMessage(response, data), status: response.status };
    }

    const rawData = data.data as Record<string, unknown>;
    let transferRecord: FinancialRecord;
    let feeRecord: FinancialRecord | undefined;

    if ("source_account_id" in rawData) {
      const transferData = rawData as unknown as TransferResponse;
      transferRecord = transferResponseToFinancialRecord(transferData);
      if (transferData.transfer_fee) {
        feeRecord = transferFeeResponseToFinancialRecord(transferData.transfer_fee, transferRecord.id);
      }
    } else {
      transferRecord = rawData as unknown as FinancialRecord;
    }

    // Fallback: If fee was not created atomically by the server, create linked expense
    if (!feeRecord && payload.fee) {
      const feeResponse = await fetch(`${getBaseUrl()}/v1/financial-records`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          kind: "expense",
          account_id: payload.fee.account_id,
          category_id: payload.fee.category_id,
          amount_minor: payload.fee.amount_minor,
          currency: payload.fee.currency,
          date: payload.date,
          note: payload.fee.note || `Transfer fee for ${payload.note || "Transfer"}`,
          linked_transfer_id: transferRecord.id,
        }),
      });

      const feeData = await dataFor(feeResponse);
      if (feeResponse.ok && feeData?.success && feeData.data) {
        feeRecord = feeData.data as FinancialRecord;
      }
    }

    return { success: true, record: transferRecord, feeRecord };
  } catch {
    return { success: false, error: "Unable to connect to financial records server." };
  }
}

export interface ListTransferFilter {
  startDate?: string;
  endDate?: string;
  accountId?: string;
  includeArchived?: boolean;
}

export async function listTransfers(
  token: string,
  filter?: ListTransferFilter,
): Promise<Result<{ transfers: TransferResponse[] }>> {
  const params = new URLSearchParams();
  if (filter?.startDate) params.set("start_date", filter.startDate);
  if (filter?.endDate) params.set("end_date", filter.endDate);
  if (filter?.accountId) params.set("account_id", filter.accountId);
  if (filter?.includeArchived) params.set("include_archived", "true");

  const query = params.toString();
  const url = `${getBaseUrl()}/v1/transfers${query ? `?${query}` : ""}`;

  try {
    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await dataFor(response);
    if (!response.ok || !data?.success || !Array.isArray(data.data)) {
      return { success: false, error: errorMessage(response, data), status: response.status };
    }
    return { success: true, transfers: data.data as TransferResponse[] };
  } catch {
    return { success: false, error: "Unable to retrieve transfers from server." };
  }
}

export async function getTransfer(
  token: string,
  id: string,
): Promise<Result<{ transfer: TransferResponse }>> {
  try {
    const response = await fetch(`${getBaseUrl()}/v1/transfers/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await dataFor(response);
    if (!response.ok || !data?.success || !data.data) {
      return { success: false, error: errorMessage(response, data), status: response.status };
    }
    return { success: true, transfer: data.data as TransferResponse };
  } catch {
    return { success: false, error: "Unable to retrieve transfer from server." };
  }
}
