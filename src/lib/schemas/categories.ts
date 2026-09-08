import { z } from "zod";

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
