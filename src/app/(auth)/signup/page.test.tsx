import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import SignupPage from "./page";
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

describe("SignupPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it("redirects authenticated user to /", async () => {
    vi.mocked(session.getSessionToken).mockResolvedValue("existing-valid-token");

    await SignupPage();

    expect(redirect).toHaveBeenCalledWith("/");
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
