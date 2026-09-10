import { describe, expect, it, vi, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { ItemCard } from "./ItemCard";

describe("ItemCard", () => {
  afterEach(() => {
    cleanup();
  });

  it("renders item title, icon, subtitle, and active status badge", () => {
    render(
      <ItemCard
        id="item-1"
        title="Everyday Checking"
        icon="C"
        subtitle="Checking • USD"
        isActive={true}
      />,
    );

    expect(screen.getByRole("heading", { name: "Everyday Checking" })).toBeTruthy();
    expect(screen.getByText("C")).toBeTruthy();
    expect(screen.getByText("Checking • USD")).toBeTruthy();
    expect(screen.getByText("Active")).toBeTruthy();
  });

  it("renders description when provided", () => {
    render(
      <ItemCard
        id="item-2"
        title="Groceries"
        description="Food and daily supplies"
        isActive={true}
      />,
    );

    expect(screen.getByText("Food and daily supplies")).toBeTruthy();
  });

  it("calls onEdit and onDeactivate when action buttons are clicked", () => {
    const onEdit = vi.fn();
    const onDeactivate = vi.fn();

    render(
      <ItemCard
        id="item-3"
        title="Salary"
        isActive={true}
        onEdit={onEdit}
        onDeactivate={onDeactivate}
      />,
    );

    const editBtn = screen.getByRole("button", { name: "Edit Salary" });
    const deactivateBtn = screen.getByRole("button", { name: "Deactivate Salary" });

    fireEvent.click(editBtn);
    expect(onEdit).toHaveBeenCalledTimes(1);

    fireEvent.click(deactivateBtn);
    expect(onDeactivate).toHaveBeenCalledTimes(1);
  });
});
