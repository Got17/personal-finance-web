import { describe, expect, it, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { PageHeader } from "./PageHeader";

describe("PageHeader component", () => {
  afterEach(() => {
    cleanup();
  });

  it("renders eyebrow, title, and subtitle", () => {
    render(
      <PageHeader
        eyebrow="Workspace"
        title="Accounts"
        subtitle="Manage bank accounts and investments."
      />,
    );

    expect(screen.getByText("Workspace")).toBeTruthy();
    expect(screen.getByRole("heading", { name: "Accounts" })).toBeTruthy();
    expect(screen.getByText("Manage bank accounts and investments.")).toBeTruthy();
  });

  it("renders action slot when provided", () => {
    render(
      <PageHeader
        eyebrow="Cash flow"
        title="Transactions"
        subtitle="Manage transactions."
        action={<button type="button">Add Transaction</button>}
      />,
    );

    expect(screen.getByRole("button", { name: "Add Transaction" })).toBeTruthy();
  });
});
