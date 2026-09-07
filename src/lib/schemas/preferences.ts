import { z } from "zod";
export { SUPPORTED_CURRENCIES } from "@/lib/constants/currencies";

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
