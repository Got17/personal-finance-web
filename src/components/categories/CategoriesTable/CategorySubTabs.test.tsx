import { describe, expect, it, vi, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { CategorySubTabs, CategoryTab } from "./CategorySubTabs";

describe("CategorySubTabs", () => {
  afterEach(() => {
    cleanup();
  });

  it("renders all tabs with correct counts", () => {
    const handleTabChange = vi.fn();
    render(
      <CategorySubTabs
        activeTab={CategoryTab.All}
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
        activeTab={CategoryTab.All}
        onTabChange={handleTabChange}
        allCount={10}
        expenseCount={7}
        incomeCount={3}
      />
    );

    fireEvent.click(screen.getByRole("tab", { name: /expenses/i }));
    expect(handleTabChange).toHaveBeenCalledWith(CategoryTab.Expense);
  });

  it("navigates tabs using arrow keys", () => {
    const handleTabChange = vi.fn();
    render(
      <CategorySubTabs
        activeTab={CategoryTab.All}
        onTabChange={handleTabChange}
        allCount={10}
        expenseCount={7}
        incomeCount={3}
      />
    );

    const tabList = screen.getByRole("tablist");
    fireEvent.keyDown(tabList, { key: "ArrowRight" });
    expect(handleTabChange).toHaveBeenCalledWith(CategoryTab.Expense);

    fireEvent.keyDown(tabList, { key: "End" });
    expect(handleTabChange).toHaveBeenCalledWith(CategoryTab.Income);

    fireEvent.keyDown(tabList, { key: "Home" });
    expect(handleTabChange).toHaveBeenCalledWith(CategoryTab.All);
  });
});
