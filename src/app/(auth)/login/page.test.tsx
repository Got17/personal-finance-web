import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import LoginPage from "./page";
import * as session from "@/lib/session";
import * as authService from "@/lib/auth-service";
import { redirect } from "next/navigation";

vi.mock("@/lib/session", () => ({
  getSessionToken: vi.fn(),
}));

vi.mock("@/lib/auth-service", () => ({
  getCurrentUser: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  redirect: vi.fn(),
  useRouter: vi.fn(() => ({
    push: vi.fn(),
    refresh: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    prefetch: vi.fn(),
    replace: vi.fn(),
    bfcacheId: "",
  })),
}));

describe("LoginPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it("redirects authenticated user to / when token is valid", async () => {
    vi.mocked(session.getSessionToken).mockResolvedValue("existing-valid-token");
    vi.mocked(authService.getCurrentUser).mockResolvedValue({
      success: true,
      status: 200,
      user: { id: "u1", email: "user@example.com", created_at: "", updated_at: "" },
    });

    await LoginPage();

    expect(redirect).toHaveBeenCalledWith("/");
  });

  it("renders sign-in page when token is stale or invalid (prevents infinite redirect loops)", async () => {
    vi.mocked(session.getSessionToken).mockResolvedValue("stale-invalid-token");
    vi.mocked(authService.getCurrentUser).mockResolvedValue({
      success: false,
      status: 401,
      error: "Unauthenticated.",
    });

    const pageComponent = await LoginPage();
    render(pageComponent);

    expect(redirect).not.toHaveBeenCalled();
    expect(
      screen.getByRole("heading", { name: /sign in to your financial home/i }),
    ).toBeTruthy();
  });

  it("renders sign-in page for unauthenticated user", async () => {
    vi.mocked(session.getSessionToken).mockResolvedValue(null);

    const pageComponent = await LoginPage();
    render(pageComponent);

    expect(
      screen.getByRole("heading", { name: /sign in to your financial home/i }),
    ).toBeTruthy();
    expect(screen.getByLabelText(/email/i)).toBeTruthy();
    expect(screen.getByLabelText(/password/i, { selector: "input" })).toBeTruthy();
  });
});
