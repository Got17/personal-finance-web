import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import AppLayout from "./layout";
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
  })),
}));

describe("AppLayout", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it("redirects unauthenticated user to /login", async () => {
    vi.mocked(session.getSessionToken).mockResolvedValue(null);

    await AppLayout({ children: <div>Dashboard content</div> });

    expect(redirect).toHaveBeenCalledWith("/login");
  });

  it("renders protected layout for authenticated user", async () => {
    vi.mocked(session.getSessionToken).mockResolvedValue("valid-token");

    const layoutComponent = await AppLayout({
      children: <div>Dashboard content</div>,
    });
    render(layoutComponent);

    expect(screen.getByText("Dashboard content")).toBeTruthy();
    expect(screen.getByRole("navigation", { name: "Primary navigation" })).toBeTruthy();
  });
});
