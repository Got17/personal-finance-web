import { describe, expect, it } from "vitest";
import { updatePreferencesSchema } from "./preferences";

describe("updatePreferencesSchema", () => {
  it("validates standard 3-letter currency codes", () => {
    const validInputs = ["USD", "eur", "Gbp ", "JPY"];

    for (const currency of validInputs) {
      const result = updatePreferencesSchema.safeParse({ baseCurrency: currency });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.baseCurrency).toMatch(/^[A-Z]{3}$/);
      }
    }
  });

  it("rejects invalid currency codes", () => {
    const invalidInputs = ["US", "USDD", "123", "", "US-D"];

    for (const currency of invalidInputs) {
      const result = updatePreferencesSchema.safeParse({ baseCurrency: currency });
      expect(result.success).toBe(false);
    }
  });
});
