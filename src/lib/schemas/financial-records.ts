import { z } from "zod";

export const FINANCIAL_RECORD_KINDS = ["income", "expense"] as const;

export type FinancialRecordKind = (typeof FINANCIAL_RECORD_KINDS)[number];

export interface FinancialRecord {
  id: string;
  user_id: string;
  kind: FinancialRecordKind;
  account_id: string;
  category_id: string;
  amount_minor: number;
  currency: string;
  date: string;
  note?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

const currencySchema = z.string().trim().toUpperCase().regex(/^[A-Z]{3}$/, {
  message: "Currency must be a valid 3-letter ISO currency code (e.g. USD).",
});

export const createFinancialRecordSchema = z.object({
  kind: z.enum(FINANCIAL_RECORD_KINDS, { message: "Please select income or expense." }),
  account_id: z.string().trim().min(1, { message: "Please select an account." }),
  category_id: z.string().trim().min(1, { message: "Please select a category." }),
  amount_minor: z.number().int().positive({ message: "Amount must be greater than zero." }),
  currency: currencySchema,
  date: z.iso.datetime({ message: "Please enter a valid date." }),
  note: z.preprocess(
    (value) => typeof value === "string" && value.trim() === "" ? undefined : value,
    z.string().trim().max(1000, { message: "Note must be 1,000 characters or fewer." }).optional(),
  ),
});

export type CreateFinancialRecordInput = z.infer<typeof createFinancialRecordSchema>;

export const updateFinancialRecordSchema = z.object({
  kind: z.enum(FINANCIAL_RECORD_KINDS, { message: "Please select income or expense." }).optional(),
  account_id: z.string().trim().min(1, { message: "Please select an account." }).optional(),
  category_id: z.string().trim().min(1, { message: "Please select a category." }).optional(),
  amount_minor: z.number().int().positive({ message: "Amount must be greater than zero." }).optional(),
  currency: currencySchema.optional(),
  date: z.iso.datetime({ message: "Please enter a valid date." }).optional(),
  note: z.preprocess(
    (value) => typeof value === "string" && value.trim() === "" ? undefined : value,
    z.string().trim().max(1000, { message: "Note must be 1,000 characters or fewer." }).optional(),
  ),
});

export type UpdateFinancialRecordInput = z.infer<typeof updateFinancialRecordSchema>;

export const financialRecordFiltersSchema = z.object({
  start_date: z.iso.date().optional(),
  end_date: z.iso.date().optional(),
  kind: z.enum(FINANCIAL_RECORD_KINDS).optional(),
  account_id: z.string().min(1).optional(),
  category_id: z.string().min(1).optional(),
});

export type FinancialRecordFilters = z.infer<typeof financialRecordFiltersSchema>;
