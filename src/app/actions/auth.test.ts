import { describe, expect, it, vi, beforeEach } from "vitest";
import { signInAction, signUpAction, signOutAction } from "./auth";
import * as authService from "@/lib/auth-service";
import * as session from "@/lib/session";
import { redirect } from "next/navigation";

vi.mock("@/lib/auth-service", () => ({
  authenticateUser: vi.fn(),
  signUpUser: vi.fn(),
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

  describe("signUpAction", () => {
    it("returns error if email is invalid format (Zod validation)", async () => {
      const result = await signUpAction({
        email: "invalid-email",
        password: "password123",
        confirmPassword: "password123",
      });
      expect(result).toEqual({
        success: false,
        error: "Please enter a valid email address.",
      });
      expect(authService.signUpUser).not.toHaveBeenCalled();
    });

    it("returns error if password is less than 8 characters", async () => {
      const result = await signUpAction({
        email: "test@example.com",
        password: "short",
        confirmPassword: "short",
      });
      expect(result).toEqual({
        success: false,
        error: "Password must be at least 8 characters.",
      });
      expect(authService.signUpUser).not.toHaveBeenCalled();
    });

    it("returns error if passwords do not match", async () => {
      const result = await signUpAction({
        email: "test@example.com",
        password: "password123",
        confirmPassword: "differentpassword",
      });
      expect(result).toEqual({
        success: false,
        error: "Passwords do not match.",
      });
      expect(authService.signUpUser).not.toHaveBeenCalled();
    });

    it("registers user and sets token on success", async () => {
      vi.mocked(authService.signUpUser).mockResolvedValue({
        success: true,
        accessToken: "signup-token-xyz",
      });

      const result = await signUpAction({
        email: "new@example.com",
        password: "password123",
        confirmPassword: "password123",
        workspaceName: "My Workspace",
      });

      expect(authService.signUpUser).toHaveBeenCalledWith({
        email: "new@example.com",
        password: "password123",
        workspaceName: "My Workspace",
      });
      expect(session.setSessionToken).toHaveBeenCalledWith("signup-token-xyz");
      expect(result).toEqual({ success: true });
    });

    it("returns error on registration failure", async () => {
      vi.mocked(authService.signUpUser).mockResolvedValue({
        success: false,
        error: "An account with this email already exists.",
      });

      const result = await signUpAction({
        email: "existing@example.com",
        password: "password123",
        confirmPassword: "password123",
      });

      expect(session.setSessionToken).not.toHaveBeenCalled();
      expect(result).toEqual({
        success: false,
        error: "An account with this email already exists.",
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
