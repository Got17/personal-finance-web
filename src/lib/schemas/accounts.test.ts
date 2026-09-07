import { describe, expect, it } from "vitest";
import { createAccountSchema } from "./accounts";

describe("createAccountSchema", () => {
  it("validates correct account input with default active state", () => {
    const result = createAccountSchema.safeParse({
      name: "Everyday Checking",
      type: "checking",
      currency: "usd",
      description: "Primary daily checking account",
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toEqual({
        name: "Everyday Checking",
        type: "checking",
        currency: "USD",
        description: "Primary daily checking account",
        is_active: true,
      });
    }
  });

  it("rejects empty account name", () => {
    const result = createAccountSchema.safeParse({
      name: "  ",
      type: "savings",
      currency: "EUR",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe("Account name is required.");
    }
  });

  it("rejects invalid account type", () => {
    const result = createAccountSchema.safeParse({
      name: "Crypto Vault",
      type: "crypto",
      currency: "USD",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe("Please select a valid account type.");
    }
  });

  it("rejects invalid currency code", () => {
    const result = createAccountSchema.safeParse({
      name: "Emergency Savings",
      type: "savings",
      currency: "US",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe(
        "Currency must be a valid 3-letter ISO currency code (e.g. USD).",
      );
    }
  });
});
