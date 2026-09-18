import { describe, expect, it, vi, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { AccountSubTabs, AccountTab, getAccountTabForType, accountMatchesTab } from "./AccountSubTabs";

describe("AccountSubTabs", () => {
  afterEach(() => {
    cleanup();
  });

  it("classifies account types correctly into tabs", () => {
    expect(getAccountTabForType("checking")).toBe(AccountTab.Banking);
    expect(getAccountTabForType("savings")).toBe(AccountTab.Banking);
    expect(getAccountTabForType("cash")).toBe(AccountTab.Banking);
    expect(getAccountTabForType("credit_card")).toBeNull();
    expect(getAccountTabForType("loan")).toBeNull();
    expect(getAccountTabForType("investment")).toBe(AccountTab.Investment);
    expect(getAccountTabForType("other")).toBe(AccountTab.Investment);

    expect(accountMatchesTab("checking", AccountTab.All)).toBe(true);
    expect(accountMatchesTab("checking", AccountTab.Banking)).toBe(true);
    expect(accountMatchesTab("credit_card", AccountTab.All)).toBe(true);
    expect(accountMatchesTab("credit_card", AccountTab.Banking)).toBe(false);
    expect(accountMatchesTab("credit_card", AccountTab.Investment)).toBe(false);
  });

  it("renders all tabs with their counts and active state", () => {
    const onTabChange = vi.fn();

    render(
      <AccountSubTabs
        activeTab={AccountTab.All}
        onTabChange={onTabChange}
        allCount={5}
        bankingCount={3}
        investmentCount={2}
      />
    );

    expect(screen.getByRole("tab", { name: /All 5/i })).toBeTruthy();
    expect(screen.getByRole("tab", { name: /Banking 3/i })).toBeTruthy();
    expect(screen.queryByRole("tab", { name: /Credit & Loans/i })).toBeNull();
    expect(screen.getByRole("tab", { name: /Investments 2/i })).toBeTruthy();

    fireEvent.click(screen.getByRole("tab", { name: /Banking 3/i }));
    expect(onTabChange).toHaveBeenCalledWith(AccountTab.Banking);
  });
});
