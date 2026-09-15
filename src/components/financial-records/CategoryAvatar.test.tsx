import { describe, it, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { CategoryAvatar, getCategoryAvatarThemeClass } from "./CategoryAvatar";

afterEach(() => {
  cleanup();
});

describe("CategoryAvatar", () => {
  it("maps categories to their respective theme classes", () => {
    expect(getCategoryAvatarThemeClass("Food & Drinks")).toContain("food");
    expect(getCategoryAvatarThemeClass("Transportation")).toContain("transport");
    expect(getCategoryAvatarThemeClass("Salary & Bonus")).toContain("salary");
    expect(getCategoryAvatarThemeClass("Groceries & Market")).toContain("groceries");
    expect(getCategoryAvatarThemeClass("Electric Utility")).toContain("utilities");
    expect(getCategoryAvatarThemeClass("Investments")).toContain("invest");
    expect(getCategoryAvatarThemeClass("Movies & Games")).toContain("entertainment");
    expect(getCategoryAvatarThemeClass("Miscellaneous")).toContain("default");
  });

  it("renders with proper aria-hidden and testid", () => {
    render(<CategoryAvatar categoryName="Salary" />);
    const avatar = screen.getByTestId("category-avatar");
    expect(avatar).toBeTruthy();
    expect(avatar.getAttribute("aria-hidden")).toBe("true");
  });
});
