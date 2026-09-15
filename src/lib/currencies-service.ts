import { Currency } from "@/lib/schemas/currencies";
import { ERROR_MESSAGES } from "@/lib/constants/errors";

function getBaseUrl(): string {
  return process.env.API_BASE_URL || "http://localhost:8080";
}

export type GetCurrenciesResult =
  | { success: true; currencies: Currency[] }
  | { success: false; error: string };

export async function getCurrencies(): Promise<GetCurrenciesResult> {
  const baseUrl = getBaseUrl();

  try {
    const response = await fetch(`${baseUrl}/v1/currencies`, {
      method: "GET",
      next: { revalidate: 3600 },
    });

    let data: {
      success?: boolean;
      message?: string;
      error?: string;
      data?: Currency[];
    } | null = null;
    try {
      data = await response.json();
    } catch {
      // Empty or non-JSON body
    }

    if (!response.ok || !data?.success) {
      const errorMessage =
        data?.message ||
        data?.error ||
        (response.ok ? ERROR_MESSAGES.CURRENCIES.INVALID_RESPONSE : `HTTP error ${response.status}`);
      return { success: false, error: errorMessage };
    }

    if (!Array.isArray(data.data)) {
      return {
        success: false,
        error: ERROR_MESSAGES.CURRENCIES.INVALID_RESPONSE,
      };
    }

    return {
      success: true,
      currencies: data.data,
    };
  } catch {
    return {
      success: false,
      error: ERROR_MESSAGES.CURRENCIES.CANNOT_CONNECT,
    };
  }
}
