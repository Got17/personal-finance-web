"use server";

import { getCurrencies } from "@/lib/currencies-service";
import { Currency } from "@/lib/schemas/currencies";

export interface GetCurrenciesActionResult {
  success: boolean;
  currencies?: Currency[];
  error?: string;
}

export async function getCurrenciesAction(): Promise<GetCurrenciesActionResult> {
  const result = await getCurrencies();

  if (!result.success) {
    return {
      success: false,
      error: result.error,
    };
  }

  return {
    success: true,
    currencies: result.currencies,
  };
}
