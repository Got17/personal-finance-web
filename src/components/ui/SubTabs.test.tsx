import { describe, expect, it, vi, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { SubTabs } from "./SubTabs";

describe("SubTabs", () => {
  afterEach(() => {
    cleanup();
  });

  const tabs = [
    { id: "all", label: "All", count: 12, badgeVariant: "default" as const },
    { id: "expense", label: "Expenses", count: 8, badgeVariant: "expense" as const },
    { id: "income", label: "Income", count: 4, badgeVariant: "income" as const },
  ];

  it("renders all tabs with labels and counts", () => {
    const handleTabChange = vi.fn();
    render(
      <SubTabs
        activeTab="all"
        tabs={tabs}
        onTabChange={handleTabChange}
        ariaLabel="Transaction sub-tabs"
      />
    );

    expect(screen.getByRole("tablist", { name: "Transaction sub-tabs" })).toBeTruthy();
    expect(screen.getByRole("tab", { name: /all/i })).toBeTruthy();
    expect(screen.getByRole("tab", { name: /expenses/i })).toBeTruthy();
    expect(screen.getByRole("tab", { name: /income/i })).toBeTruthy();
    expect(screen.getByText("12")).toBeTruthy();
    expect(screen.getByText("8")).toBeTruthy();
    expect(screen.getByText("4")).toBeTruthy();
  });

  it("fires onTabChange on click", () => {
    const handleTabChange = vi.fn();
    render(<SubTabs activeTab="all" tabs={tabs} onTabChange={handleTabChange} />);

    fireEvent.click(screen.getByRole("tab", { name: /expenses/i }));
    expect(handleTabChange).toHaveBeenCalledWith("expense");
  });

  it("handles keyboard navigation with arrow keys, Home, and End", () => {
    const handleTabChange = vi.fn();
    render(<SubTabs activeTab="all" tabs={tabs} onTabChange={handleTabChange} />);

    const tablist = screen.getByRole("tablist");
    fireEvent.keyDown(tablist, { key: "ArrowRight" });
    expect(handleTabChange).toHaveBeenCalledWith("expense");

    fireEvent.keyDown(tablist, { key: "End" });
    expect(handleTabChange).toHaveBeenCalledWith("income");

    fireEvent.keyDown(tablist, { key: "Home" });
    expect(handleTabChange).toHaveBeenCalledWith("all");
  });
});
