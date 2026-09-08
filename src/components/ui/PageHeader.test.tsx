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
});
