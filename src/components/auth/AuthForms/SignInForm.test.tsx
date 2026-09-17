import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor, cleanup } from "@testing-library/react";
import { SignInForm } from "./SignInForm";
import * as authActions from "@/app/actions/auth";
import { useRouter } from "next/navigation";
import { afterEach } from "vitest";

vi.mock("@/app/actions/auth", () => ({
  signInAction: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: vi.fn(() => ({
    push: vi.fn(),
    refresh: vi.fn(),
  })),
}));

describe("SignInForm", () => {
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

  it("renders email, password inputs, and sign-in button", () => {
    render(<SignInForm />);

    expect(screen.getByLabelText(/email/i)).toBeTruthy();
    expect(screen.getByLabelText(/password/i, { selector: "input" })).toBeTruthy();
    expect(screen.getByRole("button", { name: /sign in/i })).toBeTruthy();
  });

  it("toggles password visibility when eye icon button is clicked", () => {
    render(<SignInForm />);

    const passwordInput = screen.getByLabelText(/password/i, { selector: "input" }) as HTMLInputElement;
    const toggleBtn = screen.getByRole("button", { name: /show password/i });

    expect(passwordInput.type).toBe("password");

    fireEvent.click(toggleBtn);
    expect(passwordInput.type).toBe("text");
    expect(screen.getByRole("button", { name: /hide password/i })).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: /hide password/i }));
    expect(passwordInput.type).toBe("password");
  });

  it("displays error message when sign-in action returns an error", async () => {
    vi.mocked(authActions.signInAction).mockResolvedValue({
      success: false,
      error: "Invalid email or password.",
    });

    render(<SignInForm />);

    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: "user@example.com" },
    });
    fireEvent.change(screen.getByLabelText(/password/i, { selector: "input" }), {
      target: { value: "wrong" },
    });

    fireEvent.click(screen.getByRole("button", { name: /sign in/i }));

    await waitFor(() => {
      expect(screen.getByText("Invalid email or password.")).toBeTruthy();
    });

    expect(mockPush).not.toHaveBeenCalled();
  });

  it("navigates to / and refreshes router on successful sign in", async () => {
    vi.mocked(authActions.signInAction).mockResolvedValue({
      success: true,
    });

    render(<SignInForm />);

    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: "user@example.com" },
    });
    fireEvent.change(screen.getByLabelText(/password/i, { selector: "input" }), {
      target: { value: "password123" },
    });

    fireEvent.click(screen.getByRole("button", { name: /sign in/i }));

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith("/");
      expect(mockRefresh).toHaveBeenCalled();
    });
  });
});
