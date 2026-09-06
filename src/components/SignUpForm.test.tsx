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

  it("renders email, password, confirm password, workspace name inputs, and submit button", () => {
    render(<SignUpForm />);

    expect(screen.getByLabelText(/email/i)).toBeTruthy();
    expect(screen.getByLabelText(/^create a password/i)).toBeTruthy();
    expect(screen.getByLabelText("Confirm password", { selector: "input" })).toBeTruthy();
    expect(screen.getByLabelText(/workspace name/i)).toBeTruthy();
    expect(screen.getByRole("button", { name: /create workspace/i })).toBeTruthy();
  });

  it("toggles password visibility when eye icon button is clicked", () => {
    render(<SignUpForm />);

    const passwordInput = screen.getByLabelText(/^create a password/i) as HTMLInputElement;
    const togglePasswordBtn = screen.getByRole("button", { name: /show password/i });

    expect(passwordInput.type).toBe("password");

    fireEvent.click(togglePasswordBtn);
    expect(passwordInput.type).toBe("text");
    expect(screen.getByRole("button", { name: /hide password/i })).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: /hide password/i }));
    expect(passwordInput.type).toBe("password");
  });

  it("toggles confirm password visibility when eye icon button is clicked", () => {
    render(<SignUpForm />);

    const confirmInput = screen.getByLabelText("Confirm password", { selector: "input" }) as HTMLInputElement;
    const toggleConfirmBtn = screen.getByRole("button", { name: /show confirm password/i });

    expect(confirmInput.type).toBe("password");

    fireEvent.click(toggleConfirmBtn);
    expect(confirmInput.type).toBe("text");
    expect(screen.getByRole("button", { name: /hide confirm password/i })).toBeTruthy();
  });

  it("shows error if passwords do not match", async () => {
    render(<SignUpForm />);

    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: "user@example.com" },
    });
    fireEvent.change(screen.getByLabelText(/^create a password/i), {
      target: { value: "password123" },
    });
    fireEvent.change(screen.getByLabelText("Confirm password", { selector: "input" }), {
      target: { value: "mismatch123" },
    });

    fireEvent.click(screen.getByRole("button", { name: /create workspace/i }));

    await waitFor(() => {
      expect(screen.getByText("Passwords do not match.")).toBeTruthy();
    });

    expect(authActions.signUpAction).not.toHaveBeenCalled();
  });

  it("shows Zod email error when invalid email format is entered", async () => {
    vi.mocked(authActions.signUpAction).mockResolvedValue({
      success: false,
      error: "Please enter a valid email address.",
    });

    render(<SignUpForm />);

    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: "not-an-email" },
    });
    fireEvent.change(screen.getByLabelText(/^create a password/i), {
      target: { value: "password123" },
    });
    fireEvent.change(screen.getByLabelText("Confirm password", { selector: "input" }), {
      target: { value: "password123" },
    });

    fireEvent.click(screen.getByRole("button", { name: /create workspace/i }));

    await waitFor(() => {
      expect(screen.getByText("Please enter a valid email address.")).toBeTruthy();
    });
  });

  it("redirects to setup flow (/setup) on successful signup", async () => {
    vi.mocked(authActions.signUpAction).mockResolvedValue({
      success: true,
    });

    render(<SignUpForm />);

    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: "newuser@example.com" },
    });
    fireEvent.change(screen.getByLabelText(/^create a password/i), {
      target: { value: "securepassword123" },
    });
    fireEvent.change(screen.getByLabelText("Confirm password", { selector: "input" }), {
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
        confirmPassword: "securepassword123",
        workspaceName: "Alex's Finance",
      });
      expect(mockPush).toHaveBeenCalledWith("/setup");
      expect(mockRefresh).toHaveBeenCalled();
    });
  });
});
