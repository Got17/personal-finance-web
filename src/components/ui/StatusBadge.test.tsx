import { describe, expect, it, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { StatusBadge } from "./StatusBadge";

describe("StatusBadge", () => {
  afterEach(() => {
    cleanup();
  });

  it("renders active badge when isActive is true", () => {
    render(<StatusBadge isActive={true} />);
    expect(screen.getByText("Active")).toBeTruthy();
  });

  it("renders inactive badge when isActive is false", () => {
    render(<StatusBadge isActive={false} />);
    expect(screen.getByText("Inactive")).toBeTruthy();
  });

  it("renders custom labels when provided", () => {
    render(<StatusBadge isActive={true} activeLabel="Enabled" inactiveLabel="Disabled" />);
    expect(screen.getByText("Enabled")).toBeTruthy();
  });
});
