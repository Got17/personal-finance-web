import { describe, expect, it, vi, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { ViewHeader } from "./ViewHeader";

describe("ViewHeader", () => {
  afterEach(() => {
    cleanup();
  });

  it("renders section title and count badge", () => {
    render(
      <ViewHeader
        title="Your Accounts"
        count={2}
        unitSingular="account"
        unitPlural="accounts"
      />,
    );

    expect(screen.getByRole("heading", { name: "Your Accounts" })).toBeTruthy();
    expect(screen.getByText("2 accounts")).toBeTruthy();
  });

  it("renders singular unit when count is 1", () => {
    render(
      <ViewHeader
        title="Your Categories"
        count={1}
        unitSingular="category"
        unitPlural="categories"
      />,
    );

    expect(screen.getByText("1 category")).toBeTruthy();
  });

  it("renders action button and triggers onAction callback when clicked", () => {
    const onAction = vi.fn();
    render(
      <ViewHeader
        title="Your Accounts"
        count={0}
        unitSingular="account"
        unitPlural="accounts"
        actionLabel="+ Add Account"
        onAction={onAction}
        actionAriaLabel="Add new account"
      />,
    );

    const button = screen.getByRole("button", { name: "Add new account" });
    expect(button).toBeTruthy();

    fireEvent.click(button);
    expect(onAction).toHaveBeenCalledTimes(1);
  });
});
