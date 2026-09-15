import { describe, expect, it, vi, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { AccountSubTabs, getAccountTabForType, accountMatchesTab } from "./AccountSubTabs";

describe("AccountSubTabs", () => {
  afterEach(() => {
    cleanup();
  });

  it("classifies account types correctly into tabs", () => {
    expect(getAccountTabForType("checking")).toBe("banking");
    expect(getAccountTabForType("savings")).toBe("banking");
    expect(getAccountTabForType("cash")).toBe("banking");
    expect(getAccountTabForType("credit_card")).toBe("credit");
    expect(getAccountTabForType("loan")).toBe("credit");
    expect(getAccountTabForType("investment")).toBe("investment");
    expect(getAccountTabForType("other")).toBe("investment");

    expect(accountMatchesTab("checking", "all")).toBe(true);
    expect(accountMatchesTab("checking", "banking")).toBe(true);
    expect(accountMatchesTab("checking", "credit")).toBe(false);
  });

  it("renders all tabs with their counts and active state", () => {
    const onTabChange = vi.fn();

    render(
      <AccountSubTabs
        activeTab="all"
        onTabChange={onTabChange}
        allCount={5}
        bankingCount={3}
        creditCount={1}
        investmentCount={1}
      />
    );

    expect(screen.getByRole("tab", { name: /All 5/i })).toBeTruthy();
    expect(screen.getByRole("tab", { name: /Banking 3/i })).toBeTruthy();
    expect(screen.getByRole("tab", { name: /Credit & Loans 1/i })).toBeTruthy();
    expect(screen.getByRole("tab", { name: /Investments 1/i })).toBeTruthy();

    fireEvent.click(screen.getByRole("tab", { name: /Banking 3/i }));
    expect(onTabChange).toHaveBeenCalledWith("banking");
  });
});
