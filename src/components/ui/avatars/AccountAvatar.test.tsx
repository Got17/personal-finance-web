import { describe, expect, it, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { AccountAvatar } from "./AccountAvatar";

describe("AccountAvatar", () => {
  afterEach(() => {
    cleanup();
  });

  it("renders correctly for checking account", () => {
    render(<AccountAvatar type="checking" />);
    expect(screen.getByTestId("account-avatar")).toBeTruthy();
  });

  it("renders correctly for other accounts", () => {
    render(<AccountAvatar type="other" />);
    expect(screen.getByTestId("account-avatar")).toBeTruthy();
  });

  it("renders correctly for savings, investment, and cash", () => {
    render(<AccountAvatar type="savings" />);
    render(<AccountAvatar type="investment" />);
    render(<AccountAvatar type="cash" />);
    expect(screen.getAllByTestId("account-avatar")).toHaveLength(3);
  });
});
