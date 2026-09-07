import {
  Account,
  CreateAccountInput,
  createAccountSchema,
  UpdateAccountInput,
  updateAccountSchema,
} from "@/lib/schemas/accounts";

function getBaseUrl(): string {
  return process.env.API_BASE_URL || "http://localhost:8080";
}

export type GetAccountsResult =
  | { success: true; accounts: Account[] }
  | { success: false; error: string; status?: number };

export type CreateAccountResult =
  | { success: true; account: Account }
  | { success: false; error: string; status?: number };

export type UpdateAccountResult =
  | { success: true; account: Account }
  | { success: false; error: string; status?: number };

export type DeactivateAccountResult =
  | { success: true; account: Account }
  | { success: false; error: string; status?: number };

export async function getAccounts(token: string): Promise<GetAccountsResult> {
  const baseUrl = getBaseUrl();

  try {
    const response = await fetch(`${baseUrl}/v1/accounts`, {
      method: "GET",
      cache: "no-store",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    let data: {
      success?: boolean;
      message?: string;
      error?: string;
      data?: Account[];
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
        (response.status === 401 || response.status === 403
          ? "Unauthenticated or invalid token."
          : response.ok
          ? "Invalid response from accounts server."
          : `HTTP error ${response.status}`);
      return { success: false, error: errorMessage, status: response.status };
    }

    if (!Array.isArray(data.data)) {
      return {
        success: false,
        error: "Invalid response from accounts server.",
        status: response.status,
      };
    }

    return {
      success: true,
      accounts: data.data,
    };
  } catch {
    return {
      success: false,
      error: "Unable to connect to accounts server.",
    };
  }
}

export async function createAccount(
  token: string,
  input: CreateAccountInput,
): Promise<CreateAccountResult> {
  const validation = createAccountSchema.safeParse(input);
  if (!validation.success) {
    const firstIssue = validation.error.issues[0];
    return {
      success: false,
      error: firstIssue?.message || "Invalid account details provided.",
    };
  }

  const baseUrl = getBaseUrl();

  try {
    const response = await fetch(`${baseUrl}/v1/accounts`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(validation.data),
    });

    let data: {
      success?: boolean;
      message?: string;
      error?: string;
      data?: Account;
    } | null = null;
    try {
      data = await response.json();
    } catch {
      // Empty or non-JSON body
    }

    if (!response.ok || !data?.success || !data?.data) {
      const errorMessage =
        data?.message ||
        data?.error ||
        (response.status === 401 || response.status === 403
          ? "Unauthenticated or invalid token."
          : response.status === 422
          ? "Validation failed on accounts server."
          : response.ok
          ? "Invalid response from accounts server."
          : `HTTP error ${response.status}`);
      return { success: false, error: errorMessage, status: response.status };
    }

    return {
      success: true,
      account: data.data,
    };
  } catch {
    return {
      success: false,
      error: "Unable to connect to accounts server.",
    };
  }
}

export async function updateAccount(
  token: string,
  id: string,
  input: UpdateAccountInput,
): Promise<UpdateAccountResult> {
  const validation = updateAccountSchema.safeParse(input);
  if (!validation.success) {
    const firstIssue = validation.error.issues[0];
    return {
      success: false,
      error: firstIssue?.message || "Invalid account update details provided.",
    };
  }

  const baseUrl = getBaseUrl();

  try {
    const response = await fetch(`${baseUrl}/v1/accounts/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(validation.data),
    });

    let data: {
      success?: boolean;
      message?: string;
      error?: string;
      data?: Account;
    } | null = null;
    try {
      data = await response.json();
    } catch {
      // Empty or non-JSON body
    }

    if (!response.ok || !data?.success || !data?.data) {
      const errorMessage =
        data?.message ||
        data?.error ||
        (response.status === 401 || response.status === 403
          ? "Unauthenticated or invalid token."
          : response.status === 404
          ? "Account not found."
          : response.status === 422
          ? "Validation failed on accounts server."
          : response.ok
          ? "Invalid response from accounts server."
          : `HTTP error ${response.status}`);
      return { success: false, error: errorMessage, status: response.status };
    }

    return {
      success: true,
      account: data.data,
    };
  } catch {
    return {
      success: false,
      error: "Unable to connect to accounts server.",
    };
  }
}

export async function deactivateAccount(
  token: string,
  id: string,
): Promise<DeactivateAccountResult> {
  const baseUrl = getBaseUrl();

  try {
    const response = await fetch(`${baseUrl}/v1/accounts/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    let data: {
      success?: boolean;
      message?: string;
      error?: string;
      data?: Account;
    } | null = null;
    try {
      data = await response.json();
    } catch {
      // Empty or non-JSON body
    }

    if (!response.ok || !data?.success || !data?.data) {
      const errorMessage =
        data?.message ||
        data?.error ||
        (response.status === 401 || response.status === 403
          ? "Unauthenticated or invalid token."
          : response.status === 404
          ? "Account not found."
          : response.ok
          ? "Invalid response from accounts server."
          : `HTTP error ${response.status}`);
      return { success: false, error: errorMessage, status: response.status };
    }

    return {
      success: true,
      account: data.data,
    };
  } catch {
    return {
      success: false,
      error: "Unable to connect to accounts server.",
    };
  }
}

