import { describe, expect, it } from "vitest";
import { createFinancialRecordSchema } from "./financial-records";

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
