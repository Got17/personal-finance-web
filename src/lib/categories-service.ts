import {
  Category,
  CreateCategoryInput,
  createCategorySchema,
  UpdateCategoryInput,
  updateCategorySchema,
} from "@/lib/schemas/categories";
import { ERROR_MESSAGES } from "@/lib/constants/errors";

function getBaseUrl(): string {
  return process.env.API_BASE_URL || "http://localhost:8080";
}

export type GetCategoriesResult =
  | { success: true; categories: Category[] }
  | { success: false; error: string; status?: number };

export type CreateCategoryResult =
  | { success: true; category: Category }
  | { success: false; error: string; status?: number };

export type UpdateCategoryResult =
  | { success: true; category: Category }
  | { success: false; error: string; status?: number };

export type DeactivateCategoryResult =
  | { success: true; category: Category }
  | { success: false; error: string; status?: number };

export async function getCategories(token: string): Promise<GetCategoriesResult> {
  const baseUrl = getBaseUrl();

  try {
    const response = await fetch(`${baseUrl}/v1/categories`, {
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
      data?: Category[];
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
          ? ERROR_MESSAGES.AUTH.UNAUTHENTICATED_OR_INVALID_TOKEN
          : response.ok
          ? ERROR_MESSAGES.CATEGORIES.INVALID_RESPONSE
          : `HTTP error ${response.status}`);
      return { success: false, error: errorMessage, status: response.status };
    }

    if (!Array.isArray(data.data)) {
      return {
        success: false,
        error: ERROR_MESSAGES.CATEGORIES.INVALID_RESPONSE,
        status: response.status,
      };
    }

    return {
      success: true,
      categories: data.data,
    };
  } catch {
    return {
      success: false,
      error: ERROR_MESSAGES.CATEGORIES.CANNOT_CONNECT,
    };
  }
}

export async function createCategory(
  token: string,
  input: CreateCategoryInput,
): Promise<CreateCategoryResult> {
  const validation = createCategorySchema.safeParse(input);
  if (!validation.success) {
    const firstIssue = validation.error.issues[0];
    return {
      success: false,
      error: firstIssue?.message || ERROR_MESSAGES.CATEGORIES.INVALID_DETAILS,
    };
  }

  const baseUrl = getBaseUrl();

  try {
    const response = await fetch(`${baseUrl}/v1/categories`, {
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
      data?: Category;
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
          ? ERROR_MESSAGES.AUTH.UNAUTHENTICATED_OR_INVALID_TOKEN
          : response.status === 422
          ? ERROR_MESSAGES.CATEGORIES.VALIDATION_FAILED
          : response.ok
          ? ERROR_MESSAGES.CATEGORIES.INVALID_RESPONSE
          : `HTTP error ${response.status}`);
      return { success: false, error: errorMessage, status: response.status };
    }

    return {
      success: true,
      category: data.data,
    };
  } catch {
    return {
      success: false,
      error: ERROR_MESSAGES.CATEGORIES.CANNOT_CONNECT,
    };
  }
}

export async function updateCategory(
  token: string,
  id: string,
  input: UpdateCategoryInput,
): Promise<UpdateCategoryResult> {
  const validation = updateCategorySchema.safeParse(input);
  if (!validation.success) {
    const firstIssue = validation.error.issues[0];
    return {
      success: false,
      error: firstIssue?.message || ERROR_MESSAGES.CATEGORIES.INVALID_UPDATE_DETAILS,
    };
  }

  const baseUrl = getBaseUrl();

  try {
    const response = await fetch(`${baseUrl}/v1/categories/${id}`, {
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
      data?: Category;
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
        (response.status === 401
          ? ERROR_MESSAGES.AUTH.UNAUTHENTICATED_OR_INVALID_TOKEN
          : response.status === 403
          ? ERROR_MESSAGES.CATEGORIES.FORBIDDEN
          : response.status === 404
          ? ERROR_MESSAGES.CATEGORIES.NOT_FOUND
          : response.status === 422
          ? ERROR_MESSAGES.CATEGORIES.VALIDATION_FAILED
          : response.ok
          ? ERROR_MESSAGES.CATEGORIES.INVALID_RESPONSE
          : `HTTP error ${response.status}`);
      return { success: false, error: errorMessage, status: response.status };
    }

    return {
      success: true,
      category: data.data,
    };
  } catch {
    return {
      success: false,
      error: ERROR_MESSAGES.CATEGORIES.CANNOT_CONNECT,
    };
  }
}

export async function deactivateCategory(
  token: string,
  id: string,
): Promise<DeactivateCategoryResult> {
  const baseUrl = getBaseUrl();

  try {
    const response = await fetch(`${baseUrl}/v1/categories/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    let data: {
      success?: boolean;
      message?: string;
      error?: string;
      data?: Category;
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
        (response.status === 401
          ? ERROR_MESSAGES.AUTH.UNAUTHENTICATED_OR_INVALID_TOKEN
          : response.status === 403
          ? ERROR_MESSAGES.CATEGORIES.FORBIDDEN
          : response.status === 404
          ? ERROR_MESSAGES.CATEGORIES.NOT_FOUND
          : response.ok
          ? ERROR_MESSAGES.CATEGORIES.INVALID_RESPONSE
          : `HTTP error ${response.status}`);
      return { success: false, error: errorMessage, status: response.status };
    }

    return {
      success: true,
      category: data.data,
    };
  } catch {
    return {
      success: false,
      error: ERROR_MESSAGES.CATEGORIES.CANNOT_CONNECT,
    };
  }
}

