"use server";

import { withAuth } from "@/lib/session";
import {
  createCategory,
  getCategories,
  updateCategory,
  deactivateCategory,
} from "@/lib/categories-service";
import {
  Category,
  CreateCategoryInput,
  UpdateCategoryInput,
} from "@/lib/schemas/categories";
import { revalidatePath } from "next/cache";

export interface CreateCategoryActionResult {
  success: boolean;
  category?: Category;
  error?: string;
}

export interface GetCategoriesActionResult {
  success: boolean;
  categories?: Category[];
  error?: string;
}

export interface UpdateCategoryActionResult {
  success: boolean;
  category?: Category;
  error?: string;
}

export interface DeactivateCategoryActionResult {
  success: boolean;
  category?: Category;
  error?: string;
}

export async function createCategoryAction(
  input: CreateCategoryInput,
): Promise<CreateCategoryActionResult> {
  return withAuth(async (token) => {
    const result = await createCategory(token, input);

    if (!result.success) {
      return {
        success: false,
        error: result.error,
      };
    }

    revalidatePath("/categories");

    return {
      success: true,
      category: result.category,
    };
  });
}

export async function getCategoriesAction(): Promise<GetCategoriesActionResult> {
  return withAuth(async (token) => {
    const result = await getCategories(token);

    if (!result.success) {
      return {
        success: false,
        error: result.error,
      };
    }

    return {
      success: true,
      categories: result.categories,
    };
  });
}

export async function updateCategoryAction(
  id: string,
  input: UpdateCategoryInput,
): Promise<UpdateCategoryActionResult> {
  return withAuth(async (token) => {
    const result = await updateCategory(token, id, input);

    if (!result.success) {
      return {
        success: false,
        error: result.error,
      };
    }

    revalidatePath("/categories");

    return {
      success: true,
      category: result.category,
    };
  });
}

export async function deactivateCategoryAction(
  id: string,
): Promise<DeactivateCategoryActionResult> {
  return withAuth(async (token) => {
    const result = await deactivateCategory(token, id);

    if (!result.success) {
      return {
        success: false,
        error: result.error,
      };
    }

    revalidatePath("/categories");

    return {
      success: true,
      category: result.category,
    };
  });
}

