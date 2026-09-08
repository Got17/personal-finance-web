import { describe, expect, it, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { Card } from "./Card";

describe("Card component", () => {
  afterEach(() => {
    cleanup();
  });

  it("renders children content inside styled card wrapper", () => {
    render(
      <Card>
        <div>Card Content</div>
      </Card>,
    );

    expect(screen.getByText("Card Content")).toBeTruthy();
  });
});
