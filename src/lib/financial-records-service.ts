import {
  CreateFinancialRecordInput,
  createFinancialRecordSchema,
  FinancialRecord,
  FinancialRecordFilters,
  UpdateFinancialRecordInput,
  updateFinancialRecordSchema,
} from "@/lib/schemas/financial-records";

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

function message(
  response: Response,
  data: { message?: string; error?: string } | null,
): string {
  if (data?.message) return data.message;
  if (data?.error) return data.error;
  if (response.status === 401 || response.status === 403) {
    return "Unauthenticated or invalid token.";
  }
  if (response.ok) {
    return "Invalid response from financial records server.";
  }
  return `HTTP error ${response.status}`;
}

export async function getFinancialRecords(
  token: string,
  filters: FinancialRecordFilters = {},
): Promise<Result<{ records: FinancialRecord[] }>> {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value) params.set(key, value);
  });

  try {
    const response = await fetch(
      `${getBaseUrl()}/v1/financial-records${params.size ? `?${params}` : ""}`,
      {
        cache: "no-store",
        headers: { Authorization: `Bearer ${token}` },
      },
    );
    const data = await dataFor(response);
    if (!response.ok || !data?.success || !Array.isArray(data.data)) {
      return { success: false, error: message(response, data), status: response.status };
    }
    return { success: true, records: data.data as FinancialRecord[] };
  } catch {
    return { success: false, error: "Unable to connect to financial records server." };
  }
}

export async function createFinancialRecord(
  token: string,
  input: CreateFinancialRecordInput,
): Promise<Result<{ record: FinancialRecord }>> {
  const validation = createFinancialRecordSchema.safeParse(input);
  if (!validation.success) {
    return {
      success: false,
      error: validation.error.issues[0]?.message || "Invalid financial record details provided.",
    };
  }

  try {
    const response = await fetch(`${getBaseUrl()}/v1/financial-records`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(validation.data),
    });
    const data = await dataFor(response);
    if (!response.ok || !data?.success || !data.data) {
      return { success: false, error: message(response, data), status: response.status };
    }
    return { success: true, record: data.data as FinancialRecord };
  } catch {
    return { success: false, error: "Unable to connect to financial records server." };
  }
}

export async function updateFinancialRecord(
  token: string,
  id: string,
  input: UpdateFinancialRecordInput,
): Promise<Result<{ record: FinancialRecord }>> {
  const validation = updateFinancialRecordSchema.safeParse(input);
  if (!validation.success) {
    return {
      success: false,
      error: validation.error.issues[0]?.message || "Invalid financial record details provided.",
    };
  }

  try {
    const response = await fetch(
      `${getBaseUrl()}/v1/financial-records/${encodeURIComponent(id)}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(validation.data),
      },
    );
    const data = await dataFor(response);
    if (!response.ok || !data?.success || !data.data) {
      return { success: false, error: message(response, data), status: response.status };
    }
    return { success: true, record: data.data as FinancialRecord };
  } catch {
    return { success: false, error: "Unable to connect to financial records server." };
  }
}

export async function archiveFinancialRecord(
  token: string,
  id: string,
): Promise<Result<{ record: FinancialRecord }>> {
  try {
    const response = await fetch(
      `${getBaseUrl()}/v1/financial-records/${encodeURIComponent(id)}`,
      {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      },
    );
    const data = await dataFor(response);
    if (!response.ok || !data?.success || !data.data) {
      return { success: false, error: message(response, data), status: response.status };
    }
    return { success: true, record: data.data as FinancialRecord };
  } catch {
    return { success: false, error: "Unable to connect to financial records server." };
  }
}
