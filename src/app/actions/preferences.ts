"use server";

import { getSessionToken } from "@/lib/session";
import { updateBaseCurrencyPreference } from "@/lib/preferences-service";

export interface UpdateBaseCurrencyResult {
  success: boolean;
  baseCurrency?: string;
  error?: string;
}

export async function updateBaseCurrencyAction(
  baseCurrency: string,
): Promise<UpdateBaseCurrencyResult> {
  const token = await getSessionToken();
  if (!token) {
    return {
      success: false,
      error: "Unauthenticated.",
    };
  }

  const result = await updateBaseCurrencyPreference(token, baseCurrency);

  if (!result.success) {
    return {
      success: false,
      error: result.error,
    };
  }

  return {
    success: true,
    baseCurrency: result.baseCurrency,
  };
}
