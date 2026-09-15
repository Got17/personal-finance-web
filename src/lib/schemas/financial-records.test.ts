import { describe, expect, it } from "vitest";
import { createFinancialRecordSchema, updateFinancialRecordSchema } from "./financial-records";

describe("createFinancialRecordSchema", () => {
  it("accepts a positive minor-unit income record", () => {
    expect(createFinancialRecordSchema.safeParse({
      kind: "income",
      account_id: "account-1",
      category_id: "category-1",
      amount_minor: 385000,
      currency: "USD",
      date: "2026-09-13T09:00:00.000Z",
      note: "September salary",
    }).success).toBe(true);
  });

  it("rejects non-positive minor-unit amounts and invalid currency", () => {
    const result = createFinancialRecordSchema.safeParse({
      kind: "expense",
      account_id: "account-1",
      category_id: "category-1",
      amount_minor: 0,
      currency: "usd",
      date: "2026-09-13T09:00:00.000Z",
    });

    expect(result.success).toBe(false);
  });
});

describe("updateFinancialRecordSchema", () => {
  it("accepts valid partial update fields", () => {
    const result = updateFinancialRecordSchema.safeParse({
      amount_minor: 5000,
      note: "Updated note",
    });
    expect(result.success).toBe(true);
  });

  it("accepts valid full update fields", () => {
    const result = updateFinancialRecordSchema.safeParse({
      kind: "expense",
      account_id: "account-2",
      category_id: "category-2",
      amount_minor: 12500,
      currency: "EUR",
      date: "2026-09-14T10:00:00.000Z",
      note: "Office supplies",
    });
    expect(result.success).toBe(true);
  });

  it("rejects non-positive minor-unit amounts and invalid currency", () => {
    expect(updateFinancialRecordSchema.safeParse({ amount_minor: -100 }).success).toBe(false);
    expect(updateFinancialRecordSchema.safeParse({ currency: "invalid" }).success).toBe(false);
    expect(updateFinancialRecordSchema.safeParse({ kind: "invalid" }).success).toBe(false);
  });
});
