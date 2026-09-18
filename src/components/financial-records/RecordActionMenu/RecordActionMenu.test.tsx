import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { RecordActionMenu } from "./RecordActionMenu";

describe("RecordActionMenu", () => {
  afterEach(() => {
    cleanup();
  });
  it("renders + New button initially and does not render the menu popover", () => {
    render(
      <RecordActionMenu
        onSelectTransaction={vi.fn()}
        onSelectTransfer={vi.fn()}
      />
    );

    const button = screen.getByRole("button", { name: /Add new transaction or transfer/i });
    expect(button).toBeTruthy();
    expect(button.textContent).toContain("New");
    expect(button.className).toContain("buttonForest");
    expect(screen.queryByRole("menu")).toBeNull();
  });

  it("renders with expense variant styling when variant='expense'", () => {
    render(
      <RecordActionMenu
        variant="expense"
        onSelectTransaction={vi.fn()}
        onSelectTransfer={vi.fn()}
      />
    );

    const button = screen.getByRole("button", { name: /Add new transaction or transfer/i });
    expect(button.className).toContain("buttonExpense");
  });

  it("toggles menu open on button click and exposes menu items", () => {
    render(
      <RecordActionMenu
        onSelectTransaction={vi.fn()}
        onSelectTransfer={vi.fn()}
      />
    );

    const button = screen.getByRole("button", { name: /Add new transaction or transfer/i });
    fireEvent.click(button);

    const menu = screen.getByRole("menu");
    expect(menu).toBeTruthy();
    expect(screen.getByRole("menuitem", { name: /Transaction/i })).toBeTruthy();
    expect(screen.getByRole("menuitem", { name: /Transfer/i })).toBeTruthy();
  });

  it("calls onSelectTransaction and closes menu when clicking Transaction option", () => {
    const onSelectTransaction = vi.fn();
    const onSelectTransfer = vi.fn();

    render(
      <RecordActionMenu
        onSelectTransaction={onSelectTransaction}
        onSelectTransfer={onSelectTransfer}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: /Add new transaction or transfer/i }));
    fireEvent.click(screen.getByRole("menuitem", { name: /Transaction/i }));

    expect(onSelectTransaction).toHaveBeenCalledTimes(1);
    expect(onSelectTransfer).not.toHaveBeenCalled();
    expect(screen.queryByRole("menu")).toBeNull();
  });

  it("calls onSelectTransfer and closes menu when clicking Transfer option", () => {
    const onSelectTransaction = vi.fn();
    const onSelectTransfer = vi.fn();

    render(
      <RecordActionMenu
        onSelectTransaction={onSelectTransaction}
        onSelectTransfer={onSelectTransfer}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: /Add new transaction or transfer/i }));
    fireEvent.click(screen.getByRole("menuitem", { name: /Transfer/i }));

    expect(onSelectTransfer).toHaveBeenCalledTimes(1);
    expect(onSelectTransaction).not.toHaveBeenCalled();
    expect(screen.queryByRole("menu")).toBeNull();
  });

  it("closes menu when Escape key is pressed", () => {
    render(
      <RecordActionMenu
        onSelectTransaction={vi.fn()}
        onSelectTransfer={vi.fn()}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: /Add new transaction or transfer/i }));
    expect(screen.getByRole("menu")).toBeTruthy();

    fireEvent.keyDown(document, { key: "Escape" });
    expect(screen.queryByRole("menu")).toBeNull();
  });

  it("closes menu when clicking outside", () => {
    render(
      <div>
        <div data-testid="outside">Outside area</div>
        <RecordActionMenu
          onSelectTransaction={vi.fn()}
          onSelectTransfer={vi.fn()}
        />
      </div>
    );

    fireEvent.click(screen.getByRole("button", { name: /Add new transaction or transfer/i }));
    expect(screen.getByRole("menu")).toBeTruthy();

    fireEvent.mouseDown(screen.getByTestId("outside"));
    expect(screen.queryByRole("menu")).toBeNull();
  });
});
