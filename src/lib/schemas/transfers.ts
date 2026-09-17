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
    account_id: z.string().trim().min(1, { message: "Please select a source account." }),
    destination_account_id: z
      .string()
      .trim()
      .min(1, { message: "Please select a destination account." }),
    amount_minor: z
      .number()
      .int()
      .positive({ message: "Source amount must be greater than zero." }),
    destination_amount_minor: z
      .number()
      .int()
      .positive({ message: "Destination amount must be greater than zero." }),
    currency: currencySchema,
    destination_currency: currencySchema,
    date: z.iso.datetime({ message: "Please enter a valid date." }),
    note: z.preprocess(
      (val) => typeof val === "string" && val.trim() === "" ? undefined : val,
      z.string().trim().max(1000, { message: "Note must be 1,000 characters or fewer." }).optional(),
    ),
    fx_quote: historicalFXQuoteSchema.optional(),
    fee: transferFeeInputSchema.optional(),
  })
  .refine((data) => data.account_id !== data.destination_account_id, {
    message: "Source and destination accounts must be distinct.",
    path: ["destination_account_id"],
  })
  .refine(
    (data) => {
      if (data.currency === data.destination_currency) {
        return data.amount_minor === data.destination_amount_minor;
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
      if (data.currency !== data.destination_currency) {
        return Boolean(data.fx_quote && data.fx_quote.rate > 0);
      }
      return true;
    },
    {
      message: "Exchange rate is required for cross-currency transfers.",
      path: ["fx_quote"],
    },
  )
  .refine(
    (data) => {
      if (data.currency !== data.destination_currency && data.fx_quote) {
        return validateTransferPrecision(
          data.currency,
          data.destination_currency,
          data.amount_minor,
          data.destination_amount_minor,
          data.fx_quote.rate,
        );
      }
      return true;
    },
    {
      message: "Destination amount does not match rate conversion precision.",
      path: ["destination_amount_minor"],
    },
  );

export type CreateTransferInput = z.infer<typeof createTransferSchema>;
