import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import CategoriesPage from "./page";
import * as session from "@/lib/session";
import * as authService from "@/lib/auth-service";
import * as categoriesService from "@/lib/categories-service";
import { redirect } from "next/navigation";
import { Category } from "@/lib/schemas/categories";

vi.mock("@/lib/session", () => ({
  getSessionToken: vi.fn(),
}));

vi.mock("@/lib/auth-service", () => ({
  getCurrentUser: vi.fn(),
}));

vi.mock("@/lib/categories-service", () => ({
  getCategories: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  redirect: vi.fn(),
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

describe("CategoriesPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it("redirects unauthenticated user to /login when token is missing", async () => {
    vi.mocked(session.getSessionToken).mockResolvedValue(null);

    await CategoriesPage();

    expect(redirect).toHaveBeenCalledWith("/login");
  });

  it("renders page with user categories when authenticated", async () => {
    vi.mocked(session.getSessionToken).mockResolvedValue("valid-token");
    vi.mocked(authService.getCurrentUser).mockResolvedValue({
      success: true,
      status: 200,
      user: {
        id: "usr-1",
        email: "alex@example.com",
        base_currency: "USD",
        created_at: "2026-09-07T00:00:00Z",
        updated_at: "2026-09-07T00:00:00Z",
      },
    });
    vi.mocked(categoriesService.getCategories).mockResolvedValue({
      success: true,
      categories: [mockCategory],
    });

    const pageComponent = await CategoriesPage();
    render(pageComponent);

    expect(screen.getByRole("heading", { name: "Categories" })).toBeTruthy();
    expect(screen.getByText("Salary")).toBeTruthy();
  });

  it("displays error banner when fetching categories fails", async () => {
    vi.mocked(session.getSessionToken).mockResolvedValue("valid-token");
    vi.mocked(authService.getCurrentUser).mockResolvedValue({
      success: true,
      status: 200,
      user: {
        id: "usr-1",
        email: "alex@example.com",
        base_currency: "USD",
        created_at: "2026-09-07T00:00:00Z",
        updated_at: "2026-09-07T00:00:00Z",
      },
    });
    vi.mocked(categoriesService.getCategories).mockResolvedValue({
      success: false,
      error: "Unable to connect to categories server.",
    });

    const pageComponent = await CategoriesPage();
    render(pageComponent);

    expect(
      screen.getByText("Failed to load categories: Unable to connect to categories server."),
    ).toBeTruthy();
  });
});
