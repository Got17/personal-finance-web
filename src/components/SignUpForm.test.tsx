import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor, cleanup } from "@testing-library/react";
import { SignUpForm } from "./SignUpForm";
import * as authActions from "@/app/actions/auth";
import { useRouter } from "next/navigation";

vi.mock("@/app/actions/auth", () => ({
  signUpAction: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: vi.fn(() => ({
    push: vi.fn(),
    refresh: vi.fn(),
  })),
}));

describe("SignUpForm", () => {
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

  it("renders email, password, workspace name inputs, and create workspace button", () => {
    render(<SignUpForm />);

    expect(screen.getByLabelText(/email/i)).toBeTruthy();
    expect(screen.getByLabelText(/password/i)).toBeTruthy();
    expect(screen.getByLabelText(/workspace name/i)).toBeTruthy();
    expect(screen.getByRole("button", { name: /create workspace/i })).toBeTruthy();
  });

  it("provides client-side feedback for short passwords without calling signUpAction", async () => {
    render(<SignUpForm />);

    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: "user@example.com" },
    });
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: "short" },
    });

    fireEvent.click(screen.getByRole("button", { name: /create workspace/i }));

    await waitFor(() => {
      expect(
        screen.getByText("Password must be at least 8 characters."),
      ).toBeTruthy();
    });

    expect(authActions.signUpAction).not.toHaveBeenCalled();
    expect(mockPush).not.toHaveBeenCalled();
  });

  it("displays duplicate-identity error state when email is already registered", async () => {
    vi.mocked(authActions.signUpAction).mockResolvedValue({
      success: false,
      error: "An account with this email already exists.",
    });

    render(<SignUpForm />);

    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: "existing@example.com" },
    });
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: "password123" },
    });

    fireEvent.click(screen.getByRole("button", { name: /create workspace/i }));

    await waitFor(() => {
      expect(
        screen.getByText("An account with this email already exists."),
      ).toBeTruthy();
    });

    expect(mockPush).not.toHaveBeenCalled();
  });

  it("displays unexpected API error state when connection fails", async () => {
    vi.mocked(authActions.signUpAction).mockResolvedValue({
      success: false,
      error: "Unable to connect to authentication server.",
    });

    render(<SignUpForm />);

    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: "user@example.com" },
    });
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: "password123" },
    });

    fireEvent.click(screen.getByRole("button", { name: /create workspace/i }));

    await waitFor(() => {
      expect(
        screen.getByText("Unable to connect to authentication server."),
      ).toBeTruthy();
    });

    expect(mockPush).not.toHaveBeenCalled();
  });

  it("redirects to setup flow (/setup) on successful signup", async () => {
    vi.mocked(authActions.signUpAction).mockResolvedValue({
      success: true,
    });

    render(<SignUpForm />);

    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: "newuser@example.com" },
    });
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: "securepassword123" },
    });
    fireEvent.change(screen.getByLabelText(/workspace name/i), {
      target: { value: "Alex's Finance" },
    });

    fireEvent.click(screen.getByRole("button", { name: /create workspace/i }));

    await waitFor(() => {
      expect(authActions.signUpAction).toHaveBeenCalledWith({
        email: "newuser@example.com",
        password: "securepassword123",
        workspaceName: "Alex's Finance",
      });
      expect(mockPush).toHaveBeenCalledWith("/setup");
      expect(mockRefresh).toHaveBeenCalled();
    });
  });
});
