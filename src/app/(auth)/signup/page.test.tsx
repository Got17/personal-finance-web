import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import SignupPage from "./page";
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

describe("SignupPage", () => {
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

    await SignupPage();

    expect(redirect).toHaveBeenCalledWith("/");
  });

  it("renders signup page when token is stale or invalid (prevents infinite redirect loops)", async () => {
    vi.mocked(session.getSessionToken).mockResolvedValue("stale-invalid-token");
    vi.mocked(authService.getCurrentUser).mockResolvedValue({
      success: false,
      status: 401,
      error: "Unauthenticated.",
    });

    const pageComponent = await SignupPage();
    render(pageComponent);

    expect(redirect).not.toHaveBeenCalled();
    expect(
      screen.getByRole("heading", { name: /create your financial home/i }),
    ).toBeTruthy();
  });

  it("renders signup page for unauthenticated user", async () => {
    vi.mocked(session.getSessionToken).mockResolvedValue(null);

    const pageComponent = await SignupPage();
    render(pageComponent);

    expect(
      screen.getByRole("heading", { name: /create your financial home/i }),
    ).toBeTruthy();
    expect(screen.getByLabelText(/email/i)).toBeTruthy();
    expect(screen.getByLabelText(/^create a password/i)).toBeTruthy();
    expect(screen.getByRole("button", { name: /create workspace/i })).toBeTruthy();
    expect(screen.getByText(/already have a workspace\?/i)).toBeTruthy();
  });
});
