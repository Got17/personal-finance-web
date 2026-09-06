import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { SignOutButton } from "./SignOutButton";
import * as authActions from "@/app/actions/auth";

vi.mock("@/app/actions/auth", () => ({
  signOutAction: vi.fn(),
}));

describe("SignOutButton", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it("renders sign out button", () => {
    render(<SignOutButton />);
    expect(screen.getByRole("button", { name: /sign out/i })).toBeTruthy();
  });

  it("triggers signOutAction when clicked", () => {
    render(<SignOutButton />);
    fireEvent.click(screen.getByRole("button", { name: /sign out/i }));
    expect(authActions.signOutAction).toHaveBeenCalled();
  });
});
