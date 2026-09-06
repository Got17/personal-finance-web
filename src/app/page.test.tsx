import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import Home from "./page";

describe("Home", () => {
  it("welcomes the user to Personal Finance Hub", () => {
    render(<Home />);

    expect(
      screen.getByRole("heading", { name: "Personal Finance Hub" }),
    ).toBeTruthy();
  });
});
