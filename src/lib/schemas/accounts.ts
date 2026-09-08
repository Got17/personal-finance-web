import { z } from "zod";
import { ERROR_MESSAGES } from "@/lib/constants/errors";

export const ACCOUNT_TYPES = [
  "checking",
  "savings",
  "credit_card",
  "investment",
  "cash",
  "loan",
  "other",
] as const;

export type AccountType = (typeof ACCOUNT_TYPES)[number];

export interface Account {
  id: string;
  user_id: string;
  name: string;
  type: AccountType;
  currency: string;
  description?: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export const createAccountSchema = z.object({
  name: z.string().trim().min(1, { message: "Account name is required." }),
  type: z.enum(ACCOUNT_TYPES, {
    message: "Please select a valid account type.",
  }),
  currency: z
    .string()
    .trim()
    .toUpperCase()
    .regex(/^[A-Z]{3}$/, {
      message: "Currency must be a valid 3-letter ISO currency code (e.g. USD).",
    }),
  description: z.preprocess(
    (value) => {
      if (typeof value !== "string") return value;
      const trimmed = value.trim();
      return trimmed === "" ? undefined : trimmed;
    },
    z.string().optional(),
  ),
  is_active: z.boolean().default(true),
});

export type CreateAccountInput = z.infer<typeof createAccountSchema>;

export const updateAccountSchema = z
  .object({
    name: z.string().trim().min(1, { message: "Account name is required." }).optional(),
    type: z
      .enum(ACCOUNT_TYPES, {
        message: "Please select a valid account type.",
      })
      .optional(),
    currency: z
      .string()
      .trim()
      .toUpperCase()
      .regex(/^[A-Z]{3}$/, {
        message: "Currency must be a valid 3-letter ISO currency code (e.g. USD).",
      })
      .optional(),
    description: z.preprocess(
      (value) => {
        if (typeof value !== "string") return value;
        const trimmed = value.trim();
        return trimmed === "" ? undefined : trimmed;
      },
      z.string().optional().nullable(),
    ),
    is_active: z.boolean().optional(),
  })
  .refine((data) => Object.values(data).some((val) => val !== undefined), {
    message: ERROR_MESSAGES.ACCOUNTS.AT_LEAST_ONE_FIELD_REQUIRED,
  });

export type UpdateAccountInput = z.infer<typeof updateAccountSchema>;

