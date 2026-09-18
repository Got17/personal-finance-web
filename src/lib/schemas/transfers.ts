import { z } from "zod";
import { validateTransferPrecision } from "@/lib/currency-utils";

const currencySchema = z.string().trim().toUpperCase().regex(/^[A-Z]{3}$/, {
  message: "Currency must be a valid 3-letter ISO currency code (e.g. USD).",
});

export const historicalFXQuoteSchema = z.object({
  id: z.string().optional(),
  from_currency: currencySchema.optional(),
  to_currency: currencySchema.optional(),
  rate: z.number().positive({ message: "Exchange rate must be greater than zero." }),
  effective_date: z.string().optional(),
  provenance: z.enum(["provider", "manual_override"]),
  record_id: z.string().optional(),
});

export type HistoricalFXQuote = z.infer<typeof historicalFXQuoteSchema>;

export const transferFeeInputSchema = z.object({
  account_id: z.string().trim().min(1, { message: "Please select a fee account." }),
  category_id: z.string().trim().min(1, { message: "Please select an expense category for the fee." }),
  amount_minor: z.number().int().positive({ message: "Fee amount must be greater than zero." }),
  currency: currencySchema,
  note: z.preprocess(
    (val) => typeof val === "string" && val.trim() === "" ? undefined : val,
    z.string().trim().max(1000, { message: "Note must be 1,000 characters or fewer." }).optional(),
  ),
});

export type TransferFeeInput = z.infer<typeof transferFeeInputSchema>;

export const createTransferSchema = z
  .object({
    account_id: z.string().trim().optional(),
    source_account_id: z.string().trim().optional(),
    destination_account_id: z
      .string()
      .trim()
      .min(1, { message: "Please select a destination account." }),
    amount_minor: z
      .number()
      .int()
      .positive({ message: "Source amount must be greater than zero." })
      .optional(),
    source_amount_minor: z
      .number()
      .int()
      .positive({ message: "Source amount must be greater than zero." })
      .optional(),
    destination_amount_minor: z
      .number()
      .int()
      .positive({ message: "Destination amount must be greater than zero." })
      .optional(),
    currency: currencySchema.optional(),
    source_currency: currencySchema.optional(),
    destination_currency: currencySchema.optional(),
    date: z.iso.datetime({ message: "Please enter a valid date." }),
    note: z.preprocess(
      (val) => typeof val === "string" && val.trim() === "" ? undefined : val,
      z.string().trim().max(1000, { message: "Note must be 1,000 characters or fewer." }).optional(),
    ),
    rate: z.number().positive().optional(),
    fx_quote: historicalFXQuoteSchema.optional(),
    fee: transferFeeInputSchema.optional(),
  })
  .refine(
    (data) => Boolean((data.source_account_id && data.source_account_id.length > 0) || (data.account_id && data.account_id.length > 0)),
    {
      message: "Please select a source account.",
      path: ["source_account_id"],
    },
  )
  .refine(
    (data) => (data.source_amount_minor !== undefined && data.source_amount_minor > 0) || (data.amount_minor !== undefined && data.amount_minor > 0),
    {
      message: "Source amount must be greater than zero.",
      path: ["source_amount_minor"],
    },
  )
  .refine(
    (data) => {
      const srcId = data.source_account_id || data.account_id;
      return srcId !== data.destination_account_id;
    },
    {
      message: "Source and destination accounts must be distinct.",
      path: ["destination_account_id"],
    },
  )
  .refine(
    (data) => {
      const srcCurrency = data.source_currency || data.currency;
      const destCurrency = data.destination_currency;
      if (srcCurrency && destCurrency && srcCurrency === destCurrency) {
        const srcAmount = data.source_amount_minor ?? data.amount_minor;
        if (data.destination_amount_minor !== undefined && srcAmount !== undefined) {
          return srcAmount === data.destination_amount_minor;
        }
      }
      return true;
    },
    {
      message: "Same-currency transfer amounts must be equal.",
      path: ["destination_amount_minor"],
    },
  )
  .refine(
    (data) => {
      const srcCurrency = data.source_currency || data.currency;
      const destCurrency = data.destination_currency;
      if (srcCurrency && destCurrency && srcCurrency !== destCurrency) {
        const effRate = data.rate ?? data.fx_quote?.rate;
        return Boolean(effRate && effRate > 0);
      }
      return true;
    },
    {
      message: "Exchange rate is required for cross-currency transfers.",
      path: ["rate"],
    },
  )
  .refine(
    (data) => {
      const srcCurrency = data.source_currency || data.currency;
      const destCurrency = data.destination_currency;
      if (srcCurrency && destCurrency && srcCurrency !== destCurrency) {
        const effRate = data.rate ?? data.fx_quote?.rate;
        const srcAmount = data.source_amount_minor ?? data.amount_minor;
        if (effRate && srcAmount && data.destination_amount_minor) {
          return validateTransferPrecision(
            srcCurrency,
            destCurrency,
            srcAmount,
            data.destination_amount_minor,
            effRate,
          );
        }
      }
      return true;
    },
    {
      message: "Destination amount does not match rate conversion precision.",
      path: ["destination_amount_minor"],
    },
  );

export type CreateTransferInput = z.infer<typeof createTransferSchema>;

export const transferFeeResponseSchema = z.object({
  id: z.string(),
  user_id: z.string(),
  kind: z.literal("expense"),
  account_id: z.string(),
  category_id: z.string().optional(),
  amount_minor: z.number().int().positive(),
  currency: currencySchema,
  date: z.string(),
  note: z.string().optional(),
  is_active: z.boolean(),
  created_at: z.string(),
  updated_at: z.string(),
});

export type TransferFeeResponse = z.infer<typeof transferFeeResponseSchema>;

export const transferResponseSchema = z.object({
  id: z.string(),
  user_id: z.string(),
  kind: z.literal("transfer"),
  source_account_id: z.string(),
  destination_account_id: z.string(),
  source_amount_minor: z.number().int().positive(),
  destination_amount_minor: z.number().int().positive(),
  source_currency: currencySchema,
  destination_currency: currencySchema,
  date: z.string(),
  note: z.string().optional(),
  historical_fx_quote_id: z.string().optional(),
  transfer_fee_record_id: z.string().optional(),
  is_active: z.boolean(),
  historical_fx_quote: historicalFXQuoteSchema.optional(),
  transfer_fee: transferFeeResponseSchema.optional(),
  created_at: z.string(),
  updated_at: z.string(),
});

export type TransferResponse = z.infer<typeof transferResponseSchema>;

import { FinancialRecord } from "./financial-records";

export function transferResponseToFinancialRecord(transfer: TransferResponse): FinancialRecord {
  return {
    id: transfer.id,
    user_id: transfer.user_id,
    kind: "transfer",
    account_id: transfer.source_account_id,
    destination_account_id: transfer.destination_account_id,
    amount_minor: transfer.source_amount_minor,
    destination_amount_minor: transfer.destination_amount_minor,
    currency: transfer.source_currency,
    destination_currency: transfer.destination_currency,
    date: transfer.date,
    note: transfer.note || "",
    is_active: transfer.is_active,
    historical_fx_quote: transfer.historical_fx_quote,
    transfer_fee_record_id: transfer.transfer_fee_record_id,
    created_at: transfer.created_at,
    updated_at: transfer.updated_at,
  };
}

export function transferFeeResponseToFinancialRecord(
  fee: TransferFeeResponse,
  linkedTransferId?: string,
): FinancialRecord {
  return {
    id: fee.id,
    user_id: fee.user_id,
    kind: "expense",
    account_id: fee.account_id,
    category_id: fee.category_id,
    amount_minor: fee.amount_minor,
    currency: fee.currency,
    date: fee.date,
    note: fee.note || "",
    is_active: fee.is_active,
    linked_transfer_id: linkedTransferId,
    created_at: fee.created_at,
    updated_at: fee.updated_at,
  };
}
