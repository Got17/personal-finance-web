import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ActionButton } from "./ActionButton";

describe("ActionButton", () => {
  afterEach(cleanup);

  it("renders with children and default plus icon", () => {
    render(<ActionButton>Add Income</ActionButton>);

    const button = screen.getByRole("button", { name: /add income/i });
    expect(button).toBeTruthy();
    expect(button.textContent).toContain("Add Income");
    expect(button.querySelector("svg")).toBeTruthy();
  });

  it("allows hiding icon with showIcon={false}", () => {
    render(<ActionButton showIcon={false}>Add Item</ActionButton>);

    const button = screen.getByRole("button", { name: /add item/i });
    expect(button.querySelector("svg")).toBeNull();
  });

  it("renders custom icon when provided", () => {
    render(
      <ActionButton icon={<span data-testid="custom-icon">★</span>}>
        Add Star
      </ActionButton>,
    );

    expect(screen.getByTestId("custom-icon")).toBeTruthy();
  });

  it("triggers onClick callback when clicked", () => {
    const handleClick = vi.fn();
    render(<ActionButton onClick={handleClick}>Click Me</ActionButton>);

    fireEvent.click(screen.getByRole("button", { name: /click me/i }));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it("disables button and does not trigger onClick when disabled", () => {
    const handleClick = vi.fn();
    render(
      <ActionButton onClick={handleClick} disabled>
        Disabled
      </ActionButton>,
    );

    const button = screen.getByRole("button", { name: /disabled/i });
    expect((button as HTMLButtonElement).disabled).toBe(true);
    fireEvent.click(button);
    expect(handleClick).not.toHaveBeenCalled();
  });

  it("renders with specific variant styles", () => {
    const { rerender } = render(
      <ActionButton variant="expense">Expense</ActionButton>,
    );
    expect(screen.getByRole("button", { name: /expense/i })).toBeTruthy();

    rerender(<ActionButton variant="transaction">Transaction</ActionButton>);
    expect(screen.getByRole("button", { name: /transaction/i })).toBeTruthy();
  });
});
