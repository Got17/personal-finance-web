import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { getCategories, createCategory } from "./categories-service";
import { ERROR_MESSAGES } from "@/lib/constants/errors";

describe("categories-service", () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  describe("getCategories", () => {
    it("returns categories on successful API response", async () => {
      const mockCategories = [
        {
          id: "cat-1",
          user_id: "usr-1",
          name: "Salary",
          type: "income" as const,
          is_active: true,
          created_at: "2026-09-08T00:00:00Z",
          updated_at: "2026-09-08T00:00:00Z",
        },
      ];

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({
          success: true,
          data: mockCategories,
          message: "Categories retrieved successfully.",
        }),
      });

      const result = await getCategories("test-token");

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.categories).toEqual(mockCategories);
      }
      expect(global.fetch).toHaveBeenCalledWith("http://localhost:8080/v1/categories", {
        method: "GET",
        cache: "no-store",
        headers: {
          Authorization: "Bearer test-token",
        },
      });
    });

    it("returns authentication error on 401 response", async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 401,
        json: async () => ({
          success: false,
          error: "Unauthenticated",
          message: "Unauthenticated or invalid token.",
        }),
      });

      const result = await getCategories("invalid-token");

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe(
          ERROR_MESSAGES.AUTH.UNAUTHENTICATED_OR_INVALID_TOKEN,
        );
        expect(result.status).toBe(401);
      }
    });

    it("returns invalid response error when data is not an array", async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({
          success: true,
          data: "not-an-array",
        }),
      });

      const result = await getCategories("test-token");

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe(ERROR_MESSAGES.CATEGORIES.INVALID_RESPONSE);
      }
    });

    it("handles connection errors gracefully", async () => {
      global.fetch = vi.fn().mockRejectedValue(new Error("Network Error"));

      const result = await getCategories("test-token");

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe(ERROR_MESSAGES.CATEGORIES.CANNOT_CONNECT);
      }
    });
  });

  describe("createCategory", () => {
    it("validates input before making network request", async () => {
      global.fetch = vi.fn();

      const result = await createCategory("test-token", {
        name: "   ",
        type: "income",
        is_active: true,
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe("Category name is required.");
      }
      expect(global.fetch).not.toHaveBeenCalled();
    });

    it("returns created category on HTTP 201 response", async () => {
      const mockCreatedCategory = {
        id: "cat-2",
        user_id: "usr-1",
        name: "Groceries",
        type: "expense" as const,
        is_active: true,
        created_at: "2026-09-08T00:00:00Z",
        updated_at: "2026-09-08T00:00:00Z",
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 201,
        json: async () => ({
          success: true,
          data: mockCreatedCategory,
          message: "Category created successfully.",
        }),
      });

      const result = await createCategory("test-token", {
        name: "Groceries",
        type: "expense",
        is_active: true,
      });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.category).toEqual(mockCreatedCategory);
      }
      expect(global.fetch).toHaveBeenCalledWith("http://localhost:8080/v1/categories", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer test-token",
        },
        body: JSON.stringify({
          name: "Groceries",
          type: "expense",
          is_active: true,
        }),
      });
    });

    it("handles HTTP 422 validation failure", async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 422,
        json: async () => ({
          success: false,
          error: "Unprocessable Entity",
          message: "Validation failed on categories server.",
        }),
      });

      const result = await createCategory("test-token", {
        name: "Invalid",
        type: "income",
        is_active: true,
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe(ERROR_MESSAGES.CATEGORIES.VALIDATION_FAILED);
        expect(result.status).toBe(422);
      }
    });

    it("handles network error gracefully", async () => {
      global.fetch = vi.fn().mockRejectedValue(new Error("Fetch failure"));

      const result = await createCategory("test-token", {
        name: "Salary",
        type: "income",
        is_active: true,
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe(ERROR_MESSAGES.CATEGORIES.CANNOT_CONNECT);
      }
    });
  });
});
