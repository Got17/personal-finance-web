import { describe, expect, it } from "vitest";
import { createCategorySchema } from "./categories";

describe("createCategorySchema", () => {
  it("validates correct category input with default active state", () => {
    const result = createCategorySchema.safeParse({
      name: "Salary",
      type: "income",
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toEqual({
        name: "Salary",
        type: "income",
        is_active: true,
      });
    }
  });

  it("accepts expense category type", () => {
    const result = createCategorySchema.safeParse({
      name: "Groceries",
      type: "expense",
      is_active: true,
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toEqual({
        name: "Groceries",
        type: "expense",
        is_active: true,
      });
    }
  });

  it("rejects empty category name", () => {
    const result = createCategorySchema.safeParse({
      name: "   ",
      type: "income",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe("Category name is required.");
    }
  });

  it("rejects invalid category type", () => {
    const result = createCategorySchema.safeParse({
      name: "Investments",
      type: "asset",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe(
        "Please select a valid category type.",
      );
    }
  });
});
