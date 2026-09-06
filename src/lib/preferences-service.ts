function getBaseUrl(): string {
  return process.env.API_BASE_URL || "http://localhost:8080";
}

export type GetUserPreferencesResult =
  | { success: true; baseCurrency: string }
  | { success: false; error: string; status?: number };

export type UpdatePreferencesResult =
  | { success: true; baseCurrency: string }
  | { success: false; error: string; status?: number };

const CURRENCY_CODE_REGEX = /^[A-Z]{3}$/;

export async function getUserPreferences(
  token: string,
): Promise<GetUserPreferencesResult> {
  const baseUrl = getBaseUrl();

  try {
    const response = await fetch(`${baseUrl}/v1/users/me/preferences`, {
      method: "GET",
      cache: "no-store",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    let data: { success?: boolean; message?: string; data?: { base_currency?: string } } | null = null;
    try {
      data = await response.json();
    } catch {
      // Handles non-JSON or empty bodies
    }

    if (!response.ok || !data?.success) {
      const errorMessage =
        data?.message ||
        (response.status === 401 || response.status === 403
          ? "Unauthenticated or invalid token."
          : `HTTP error ${response.status}`);
      return { success: false, error: errorMessage, status: response.status };
    }

    return {
      success: true,
      baseCurrency: data.data?.base_currency || "USD",
    };
  } catch {
    return {
      success: false,
      error: "Unable to connect to preferences server.",
    };
  }
}

export async function updateBaseCurrencyPreference(
  token: string,
  baseCurrency: string,
): Promise<UpdatePreferencesResult> {
  const formattedCurrency = baseCurrency.trim().toUpperCase();

  if (!CURRENCY_CODE_REGEX.test(formattedCurrency)) {
    return {
      success: false,
      error: "Base currency must be a valid 3-letter currency code (e.g. USD, EUR).",
    };
  }

  const baseUrl = getBaseUrl();

  try {
    const response = await fetch(`${baseUrl}/v1/users/me/preferences`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        base_currency: formattedCurrency,
      }),
    });

    let data: { success?: boolean; message?: string; error?: string; data?: { base_currency?: string } } | null = null;
    try {
      data = await response.json();
    } catch {
      // Handles non-JSON response bodies
    }

    if (!response.ok || !data?.success) {
      const errorMessage =
        data?.message ||
        data?.error ||
        (response.status === 401 || response.status === 403
          ? "Unauthenticated."
          : `HTTP error ${response.status}`);
      return { success: false, error: errorMessage, status: response.status };
    }

    return {
      success: true,
      baseCurrency: data.data?.base_currency || formattedCurrency,
    };
  } catch {
    return {
      success: false,
      error: "Unable to connect to preferences server.",
    };
  }
}
