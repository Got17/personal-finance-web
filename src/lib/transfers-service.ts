import {
  CreateTransferInput,
  createTransferSchema,
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
    const response = await fetch(`${getBaseUrl()}/v1/fx-quotes?${params.toString()}`, {
      headers: { Authorization: `Bearer ${token}` },
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

  try {
    // 1. Send transfer creation request
    let response = await fetch(`${getBaseUrl()}/v1/transfers`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    // If /v1/transfers is not yet deployed (parallel implementation), fall back to /v1/financial-records
    if (response.status === 404) {
      response = await fetch(`${getBaseUrl()}/v1/financial-records`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          kind: "transfer",
          account_id: payload.account_id,
          destination_account_id: payload.destination_account_id,
          amount_minor: payload.amount_minor,
          destination_amount_minor: payload.destination_amount_minor,
          currency: payload.currency,
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

    const transferRecord = data.data as FinancialRecord;

    // 2. If fee is included, record separate linked fee expense
    let feeRecord: FinancialRecord | undefined;
    if (payload.fee) {
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
