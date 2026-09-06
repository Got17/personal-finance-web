import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import LoginPage from "./page";
import * as session from "@/lib/session";
import { redirect } from "next/navigation";

vi.mock("@/lib/session", () => ({
  getSessionToken: vi.fn(),
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

  it("redirects authenticated user to /", async () => {
    vi.mocked(session.getSessionToken).mockResolvedValue("existing-valid-token");

    await LoginPage();

    expect(redirect).toHaveBeenCalledWith("/");
  });

  it("renders sign-in page for unauthenticated user", async () => {
    vi.mocked(session.getSessionToken).mockResolvedValue(null);

    const pageComponent = await LoginPage();
    render(pageComponent);

    expect(
      screen.getByRole("heading", { name: /sign in to your financial home/i }),
    ).toBeTruthy();
    expect(screen.getByLabelText(/email/i)).toBeTruthy();
    expect(screen.getByLabelText(/password/i)).toBeTruthy();
  });
});
