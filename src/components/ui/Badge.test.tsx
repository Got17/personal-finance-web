import { describe, expect, it, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { Badge } from "./Badge";

describe("Badge component", () => {
  afterEach(() => {
    cleanup();
  });

  it("renders text with variant styles", () => {
    render(<Badge variant="income">Income</Badge>);

    const badge = screen.getByText("Income");
    expect(badge).toBeTruthy();
  });
});
