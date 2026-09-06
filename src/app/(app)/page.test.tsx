import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import HomePage from "./page";
import * as session from "@/lib/session";
import { redirect } from "next/navigation";

vi.mock("@/lib/session", () => ({
  getSessionToken: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  redirect: vi.fn(),
}));

describe("Protected HomePage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it("redirects unauthenticated user to /login", async () => {
    vi.mocked(session.getSessionToken).mockResolvedValue(null);

    await HomePage();

    expect(redirect).toHaveBeenCalledWith("/login");
  });

  it("renders protected content for authenticated user", async () => {
    vi.mocked(session.getSessionToken).mockResolvedValue("valid-user-token");

    const pageComponent = await HomePage();
    render(pageComponent);

    expect(
      screen.getByRole("heading", { name: "Personal Finance Hub" }),
    ).toBeTruthy();
    expect(
      screen.getByText(/your private place to understand the whole financial picture/i),
    ).toBeTruthy();
  });
});
