import { describe, expect, it, vi, beforeEach } from "vitest";
import { signInAction, signOutAction } from "./auth";
import * as authService from "@/lib/auth-service";
import * as session from "@/lib/session";
import { redirect } from "next/navigation";

vi.mock("@/lib/auth-service", () => ({
  authenticateUser: vi.fn(),
}));

vi.mock("@/lib/session", () => ({
  setSessionToken: vi.fn(),
  clearSessionToken: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  redirect: vi.fn(),
}));

describe("auth actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("signInAction", () => {
    it("returns error if email or password missing", async () => {
      const result = await signInAction({ email: "", password: "" });
      expect(result).toEqual({
        success: false,
        error: "Email and password are required.",
      });
      expect(authService.authenticateUser).not.toHaveBeenCalled();
    });

    it("authenticates and sets token on success", async () => {
      vi.mocked(authService.authenticateUser).mockResolvedValue({
        success: true,
        accessToken: "mock-token-xyz",
      });

      const result = await signInAction({
        email: "test@example.com",
        password: "password123",
      });

      expect(authService.authenticateUser).toHaveBeenCalledWith({
        email: "test@example.com",
        password: "password123",
      });
      expect(session.setSessionToken).toHaveBeenCalledWith("mock-token-xyz");
      expect(result).toEqual({ success: true });
    });

    it("returns error on authentication failure", async () => {
      vi.mocked(authService.authenticateUser).mockResolvedValue({
        success: false,
        error: "Invalid email or password.",
      });

      const result = await signInAction({
        email: "test@example.com",
        password: "wrong",
      });

      expect(session.setSessionToken).not.toHaveBeenCalled();
      expect(result).toEqual({
        success: false,
        error: "Invalid email or password.",
      });
    });
  });

  describe("signOutAction", () => {
    it("clears session token and redirects to /login", async () => {
      await signOutAction();
      expect(session.clearSessionToken).toHaveBeenCalled();
      expect(redirect).toHaveBeenCalledWith("/login");
    });
  });
});
