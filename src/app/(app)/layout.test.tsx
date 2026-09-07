import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import AppLayout from "./layout";
import * as session from "@/lib/session";
import * as authService from "@/lib/auth-service";
import { redirect } from "next/navigation";

vi.mock("@/lib/session", () => ({
  getSessionToken: vi.fn(),
  clearSessionToken: vi.fn(),
}));

vi.mock("@/lib/auth-service", () => ({
  getCurrentUser: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  redirect: vi.fn(),
  usePathname: vi.fn(() => "/"),
  useRouter: vi.fn(() => ({
    push: vi.fn(),
    refresh: vi.fn(),
  })),
}));

describe("AppLayout", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it("redirects unauthenticated user to /login when token is missing", async () => {
    vi.mocked(session.getSessionToken).mockResolvedValue(null);

    await AppLayout({ children: <div>Dashboard content</div> });

    expect(redirect).toHaveBeenCalledWith("/login");
  });

  it("redirects to /login when token is 401 unauthenticated", async () => {
    vi.mocked(session.getSessionToken).mockResolvedValue("invalid-token");
    vi.mocked(authService.getCurrentUser).mockResolvedValue({
      success: false,
      status: 401,
      error: "Unauthenticated or invalid token.",
    });

    await AppLayout({ children: <div>Dashboard content</div> });

    expect(redirect).toHaveBeenCalledWith("/login");
  });

  it("redirects to /login on 500 server error", async () => {
    vi.mocked(session.getSessionToken).mockResolvedValue("valid-token");
    vi.mocked(authService.getCurrentUser).mockResolvedValue({
      success: false,
      status: 500,
      error: "HTTP error 500",
    });

    await AppLayout({ children: <div>Dashboard content</div> });

    expect(redirect).toHaveBeenCalledWith("/login");
  });

  it("renders protected layout with authenticated user identity", async () => {
    vi.mocked(session.getSessionToken).mockResolvedValue("valid-token");
    vi.mocked(authService.getCurrentUser).mockResolvedValue({
      success: true,
      status: 200,
      user: {
        id: "usr-123",
        email: "alex@example.com",
        created_at: "2026-09-06T00:00:00Z",
        updated_at: "2026-09-06T00:00:00Z",
      },
    });

    const layoutComponent = await AppLayout({
      children: <div>Dashboard content</div>,
    });
    render(layoutComponent);

    expect(screen.getByText("Dashboard content")).toBeTruthy();
    expect(screen.getByRole("navigation", { name: "Primary navigation" })).toBeTruthy();
    expect(screen.getByText("alex@example.com")).toBeTruthy();
  });

  it("displays base currency in sidebar footer when set on user profile", async () => {
    vi.mocked(session.getSessionToken).mockResolvedValue("valid-token");
    vi.mocked(authService.getCurrentUser).mockResolvedValue({
      success: true,
      status: 200,
      user: {
        id: "usr-123",
        email: "alex@example.com",
        base_currency: "EUR",
        created_at: "2026-09-06T00:00:00Z",
        updated_at: "2026-09-06T00:00:00Z",
      },
    });

    const layoutComponent = await AppLayout({
      children: <div>Dashboard content</div>,
    });
    render(layoutComponent);

    expect(screen.getByText("Base currency: EUR")).toBeTruthy();
  });
});


