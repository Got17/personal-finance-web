import { describe, expect, it, vi, beforeEach } from "vitest";
import {
  createCategoryAction,
  getCategoriesAction,
  updateCategoryAction,
  deactivateCategoryAction,
} from "./categories";
import * as session from "@/lib/session";
import * as categoriesService from "@/lib/categories-service";
import { Category } from "@/lib/schemas/categories";
import { revalidatePath } from "next/cache";

vi.mock("@/lib/session", () => ({
  getSessionToken: vi.fn(),
  withAuth: vi.fn(async (handler) => {
    const token = await session.getSessionToken();
    if (!token) {
      return { success: false, error: "Unauthenticated." };
    }
    return handler(token);
  }),
}));

vi.mock("@/lib/categories-service", () => ({
  createCategory: vi.fn(),
  getCategories: vi.fn(),
  updateCategory: vi.fn(),
  deactivateCategory: vi.fn(),
}));

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

const mockCategory: Category = {
  id: "cat-1",
  user_id: "usr-1",
  name: "Salary",
  type: "income",
  is_active: true,
  created_at: "2026-09-08T00:00:00Z",
  updated_at: "2026-09-08T00:00:00Z",
};

describe("categories server actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("createCategoryAction", () => {
    it("returns error if user is unauthenticated", async () => {
      vi.mocked(session.getSessionToken).mockResolvedValue(null);

      const result = await createCategoryAction({
        name: "Salary",
        type: "income",
        is_active: true,
      });

      expect(result).toEqual({
        success: false,
        error: "Unauthenticated.",
      });
      expect(categoriesService.createCategory).not.toHaveBeenCalled();
    });

    it("creates category and revalidates /categories path on success", async () => {
      vi.mocked(session.getSessionToken).mockResolvedValue("valid-token");
      vi.mocked(categoriesService.createCategory).mockResolvedValue({
        success: true,
        category: mockCategory,
      });

      const result = await createCategoryAction({
        name: "Salary",
        type: "income",
        is_active: true,
      });

      expect(result).toEqual({
        success: true,
        category: mockCategory,
      });
      expect(categoriesService.createCategory).toHaveBeenCalledWith("valid-token", {
        name: "Salary",
        type: "income",
        is_active: true,
      });
      expect(revalidatePath).toHaveBeenCalledWith("/categories");
    });

    it("returns error message when createCategory service fails", async () => {
      vi.mocked(session.getSessionToken).mockResolvedValue("valid-token");
      vi.mocked(categoriesService.createCategory).mockResolvedValue({
        success: false,
        error: "Failed to create category. Please try again.",
      });

      const result = await createCategoryAction({
        name: "Salary",
        type: "income",
        is_active: true,
      });

      expect(result).toEqual({
        success: false,
        error: "Failed to create category. Please try again.",
      });
    });
  });

  describe("getCategoriesAction", () => {
    it("returns error if user is unauthenticated", async () => {
      vi.mocked(session.getSessionToken).mockResolvedValue(null);

      const result = await getCategoriesAction();

      expect(result).toEqual({
        success: false,
        error: "Unauthenticated.",
      });
    });

    it("returns categories when service call succeeds", async () => {
      vi.mocked(session.getSessionToken).mockResolvedValue("valid-token");
      vi.mocked(categoriesService.getCategories).mockResolvedValue({
        success: true,
        categories: [mockCategory],
      });

      const result = await getCategoriesAction();

      expect(result).toEqual({
        success: true,
        categories: [mockCategory],
      });
      expect(categoriesService.getCategories).toHaveBeenCalledWith("valid-token");
    });
  });

  describe("updateCategoryAction", () => {
    it("returns error if user is unauthenticated", async () => {
      vi.mocked(session.getSessionToken).mockResolvedValue(null);

      const result = await updateCategoryAction("cat-1", { name: "Updated Salary" });

      expect(result).toEqual({
        success: false,
        error: "Unauthenticated.",
      });
    });

    it("updates category and revalidates /categories path on success", async () => {
      vi.mocked(session.getSessionToken).mockResolvedValue("valid-token");
      const updatedCategory = { ...mockCategory, name: "Updated Salary" };
      vi.mocked(categoriesService.updateCategory).mockResolvedValue({
        success: true,
        category: updatedCategory,
      });

      const result = await updateCategoryAction("cat-1", { name: "Updated Salary" });

      expect(result).toEqual({
        success: true,
        category: updatedCategory,
      });
      expect(categoriesService.updateCategory).toHaveBeenCalledWith(
        "valid-token",
        "cat-1",
        { name: "Updated Salary" },
      );
      expect(revalidatePath).toHaveBeenCalledWith("/categories");
    });

    it("returns error message when updateCategory service fails", async () => {
      vi.mocked(session.getSessionToken).mockResolvedValue("valid-token");
      vi.mocked(categoriesService.updateCategory).mockResolvedValue({
        success: false,
        error: "Category not found.",
      });

      const result = await updateCategoryAction("cat-1", { name: "Updated" });

      expect(result).toEqual({
        success: false,
        error: "Category not found.",
      });
    });
  });

  describe("deactivateCategoryAction", () => {
    it("returns error if user is unauthenticated", async () => {
      vi.mocked(session.getSessionToken).mockResolvedValue(null);

      const result = await deactivateCategoryAction("cat-1");

      expect(result).toEqual({
        success: false,
        error: "Unauthenticated.",
      });
    });

    it("deactivates category and revalidates /categories path on success", async () => {
      vi.mocked(session.getSessionToken).mockResolvedValue("valid-token");
      const deactivatedCategory = { ...mockCategory, is_active: false };
      vi.mocked(categoriesService.deactivateCategory).mockResolvedValue({
        success: true,
        category: deactivatedCategory,
      });

      const result = await deactivateCategoryAction("cat-1");

      expect(result).toEqual({
        success: true,
        category: deactivatedCategory,
      });
      expect(categoriesService.deactivateCategory).toHaveBeenCalledWith(
        "valid-token",
        "cat-1",
      );
      expect(revalidatePath).toHaveBeenCalledWith("/categories");
    });

    it("returns error message when deactivateCategory service fails", async () => {
      vi.mocked(session.getSessionToken).mockResolvedValue("valid-token");
      vi.mocked(categoriesService.deactivateCategory).mockResolvedValue({
        success: false,
        error: "Failed to deactivate category.",
      });

      const result = await deactivateCategoryAction("cat-1");

      expect(result).toEqual({
        success: false,
        error: "Failed to deactivate category.",
      });
    });
  });
});

