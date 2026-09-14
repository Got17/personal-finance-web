import { describe, expect, it, vi, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { CategorySubTabs } from "./CategorySubTabs";

describe("CategorySubTabs", () => {
  afterEach(() => {
    cleanup();
  });

  it("renders all tabs with correct counts", () => {
    const handleTabChange = vi.fn();
    render(
      <CategorySubTabs
        activeTab="all"
        onTabChange={handleTabChange}
        allCount={10}
        expenseCount={7}
        incomeCount={3}
      />
    );

    expect(screen.getByRole("tab", { name: /all/i })).toBeTruthy();
    expect(screen.getByRole("tab", { name: /expenses/i })).toBeTruthy();
    expect(screen.getByRole("tab", { name: /income/i })).toBeTruthy();
    expect(screen.getByText("10")).toBeTruthy();
    expect(screen.getByText("7")).toBeTruthy();
    expect(screen.getByText("3")).toBeTruthy();
  });

  it("calls onTabChange when tab button is clicked", () => {
    const handleTabChange = vi.fn();
    render(
      <CategorySubTabs
        activeTab="all"
        onTabChange={handleTabChange}
        allCount={10}
        expenseCount={7}
        incomeCount={3}
      />
    );

    fireEvent.click(screen.getByRole("tab", { name: /expenses/i }));
    expect(handleTabChange).toHaveBeenCalledWith("expense");
  });

  it("navigates tabs using arrow keys", () => {
    const handleTabChange = vi.fn();
    render(
      <CategorySubTabs
        activeTab="all"
        onTabChange={handleTabChange}
        allCount={10}
        expenseCount={7}
        incomeCount={3}
      />
    );

    const tabList = screen.getByRole("tablist");
    fireEvent.keyDown(tabList, { key: "ArrowRight" });
    expect(handleTabChange).toHaveBeenCalledWith("expense");

    fireEvent.keyDown(tabList, { key: "End" });
    expect(handleTabChange).toHaveBeenCalledWith("income");

    fireEvent.keyDown(tabList, { key: "Home" });
    expect(handleTabChange).toHaveBeenCalledWith("all");
  });
});
