import { describe, expect, it } from "vitest";
import { signUpSchema } from "./auth";

describe("signUpSchema", () => {
  it("fails on invalid email format", () => {
    const result = signUpSchema.safeParse({
      email: "not-an-email",
      password: "password123",
      confirmPassword: "password123",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe("Please enter a valid email address.");
    }
  });

  it("fails when password confirmation does not match", () => {
    const result = signUpSchema.safeParse({
      email: "user@example.com",
      password: "password123",
      confirmPassword: "mismatch123",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe("Passwords do not match.");
    }
  });

  it("passes on valid inputs", () => {
    const result = signUpSchema.safeParse({
      email: "user@example.com",
      password: "password123",
      confirmPassword: "password123",
    });
    expect(result.success).toBe(true);
  });
});
