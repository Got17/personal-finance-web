import { z } from "zod";

export const SUPPORTED_CURRENCIES = [
  { code: "USD", name: "USD — US Dollar ($)" },
  { code: "EUR", name: "EUR — Euro (€)" },
  { code: "GBP", name: "GBP — British Pound (£)" },
  { code: "CAD", name: "CAD — Canadian Dollar ($)" },
  { code: "AUD", name: "AUD — Australian Dollar ($)" },
  { code: "SGD", name: "SGD — Singapore Dollar ($)" },
  { code: "JPY", name: "JPY — Japanese Yen (¥)" },
  { code: "CHF", name: "CHF — Swiss Franc (CHF)" },
  { code: "NZD", name: "NZD — New Zealand Dollar ($)" },
] as const;

export const updatePreferencesSchema = z.object({
  baseCurrency: z
    .string()
    .trim()
    .toUpperCase()
    .regex(/^[A-Z]{3}$/, {
      message: "Base currency must be a valid 3-letter ISO 4217 currency code (e.g. USD, EUR).",
    }),
});

export type UpdatePreferencesInput = z.infer<typeof updatePreferencesSchema>;
