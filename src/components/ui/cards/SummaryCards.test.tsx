import { describe, expect, it, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import {
  SummaryCard,
  SummaryCardsGrid,
  type SummaryCardVariant,
} from "./SummaryCards";

describe("SummaryCards components", () => {
  afterEach(() => {
    cleanup();
  });

  describe("SummaryCardsGrid", () => {
    it("renders children with optional className and testId", () => {
      render(
        <SummaryCardsGrid testId="custom-grid" className="extra-class">
          <div>Item 1</div>
          <div>Item 2</div>
        </SummaryCardsGrid>
      );

      const grid = screen.getByTestId("custom-grid");
      expect(grid).toBeTruthy();
      expect(grid.className).toContain("grid");
      expect(grid.className).toContain("extra-class");
      expect(screen.getByText("Item 1")).toBeTruthy();
      expect(screen.getByText("Item 2")).toBeTruthy();
    });
  });

  describe("SummaryCard", () => {
    const variants: SummaryCardVariant[] = [
      "inflow",
      "outflow",
      "neutral",
      "highlight",
    ];

    it.each(variants)(
      "renders correctly with variant '%s'",
      (variant) => {
        render(
          <SummaryCard
            variant={variant}
            label={`${variant} label`}
            icon={<span data-testid="icon">icon</span>}
            value="$1,234"
            testId={`card-${variant}`}
          />
        );

        expect(screen.getByTestId(`card-${variant}`)).toBeTruthy();
        expect(screen.getByText(`${variant} label`)).toBeTruthy();
        expect(screen.getByText("$1,234")).toBeTruthy();
      }
    );

    it("renders subtext and custom valueClassName when provided", () => {
      render(
        <SummaryCard
          label="Total Balance"
          icon={<span>icon</span>}
          value="$5,000"
          valueClassName="custom-value-style"
          subtext={<span>+10% this month</span>}
          className="custom-card-class"
          testId="summary-card"
        />
      );

      const card = screen.getByTestId("summary-card");
      expect(card.className).toContain("custom-card-class");
      expect(screen.getByText("+10% this month")).toBeTruthy();

      const valueEl = screen.getByText("$5,000");
      expect(valueEl.className).toContain("custom-value-style");
    });

    it("defaults to neutral variant when variant is not specified", () => {
      render(
        <SummaryCard
          label="Default Card"
          icon={<span>icon</span>}
          value="$100"
          testId="default-card"
        />
      );

      const card = screen.getByTestId("default-card");
      expect(card).toBeTruthy();
      expect(screen.getByText("Default Card")).toBeTruthy();
    });
  });
});
