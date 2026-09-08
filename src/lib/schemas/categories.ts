import { z } from "zod";
import { ERROR_MESSAGES } from "@/lib/constants/errors";

export const CATEGORY_TYPES = ["income", "expense"] as const;

export type CategoryType = (typeof CATEGORY_TYPES)[number];

export interface Category {
  id: string;
  user_id: string;
  name: string;
  type: CategoryType;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export const createCategorySchema = z.object({
  name: z.string().trim().min(1, { message: "Category name is required." }),
  type: z.enum(CATEGORY_TYPES, {
    message: "Please select a valid category type.",
  }),
  is_active: z.boolean().default(true),
});

export type CreateCategoryInput = z.infer<typeof createCategorySchema>;

export const updateCategorySchema = z
  .object({
    name: z.string().trim().min(1, { message: "Category name is required." }).optional(),
    type: z
      .enum(CATEGORY_TYPES, {
        message: "Please select a valid category type.",
      })
      .optional(),
    is_active: z.boolean().optional(),
  })
  .refine((data) => Object.values(data).some((val) => val !== undefined), {
    message: ERROR_MESSAGES.CATEGORIES.AT_LEAST_ONE_FIELD_REQUIRED,
  });

export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;

