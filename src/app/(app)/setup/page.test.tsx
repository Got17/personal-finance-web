import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { render, screen, cleanup, fireEvent } from "@testing-library/react";
import SetupPage from "./page";
import * as session from "@/lib/session";
import { redirect, useRouter } from "next/navigation";

vi.mock("@/lib/session", () => ({
  getSessionToken: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  redirect: vi.fn(),
  useRouter: vi.fn(() => ({
    push: vi.fn(),
    refresh: vi.fn(),
  })),
}));

describe("SetupPage", () => {
  const mockPush = vi.fn();
  const mockRefresh = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useRouter).mockReturnValue({
      push: mockPush,
      refresh: mockRefresh,
      back: vi.fn(),
      forward: vi.fn(),
      prefetch: vi.fn(),
      replace: vi.fn(),
      bfcacheId: "",
    });
  });

  afterEach(() => {
    cleanup();
  });

  it("redirects unauthenticated user to /login", async () => {
    vi.mocked(session.getSessionToken).mockResolvedValue(null);

    await SetupPage();

    expect(redirect).toHaveBeenCalledWith("/login");
  });

  it("renders base-currency setup page for authenticated user", async () => {
    vi.mocked(session.getSessionToken).mockResolvedValue("valid-token");

    const pageComponent = await SetupPage();
    render(pageComponent);

    expect(
      screen.getByRole("heading", { name: /choose your base currency/i }),
    ).toBeTruthy();
    expect(screen.getByLabelText(/select base currency/i)).toBeTruthy();
    expect(screen.getByRole("button", { name: /complete setup/i })).toBeTruthy();
  });

  it("navigates to dashboard / on completing setup", async () => {
    vi.mocked(session.getSessionToken).mockResolvedValue("valid-token");

    const pageComponent = await SetupPage();
    render(pageComponent);

    fireEvent.click(screen.getByRole("button", { name: /complete setup/i }));

    expect(mockPush).toHaveBeenCalledWith("/");
  });
});
