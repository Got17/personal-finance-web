import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import HomePage from "./page";
describe("HomePage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it("renders the public dashboard prototype", async () => {
    const pageComponent = await HomePage();
    render(pageComponent);

    expect(
      screen.getByRole("heading", { name: "Your money, in focus." }),
    ).toBeTruthy();
    expect(
      screen.getByText(/net worth/i),
    ).toBeTruthy();
  });
});
