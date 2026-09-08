import { describe, expect, it, vi, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { SidebarNav, MobileNav } from "./Navigation";
import { usePathname } from "next/navigation";

vi.mock("next/navigation", () => ({
  usePathname: vi.fn(),
}));

describe("Navigation components", () => {
  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  describe("SidebarNav", () => {
    it("highlights Overview when pathname is /", () => {
      vi.mocked(usePathname).mockReturnValue("/");
      render(<SidebarNav />);

      const overviewLink = screen.getByRole("link", { name: /Overview/i });
      const accountsLink = screen.getByRole("link", { name: /Accounts/i });

      expect(overviewLink.className).toContain("activeNavItem");
      expect(accountsLink.className).not.toContain("activeNavItem");
    });

    it("highlights Accounts when pathname is /accounts", () => {
      vi.mocked(usePathname).mockReturnValue("/accounts");
      render(<SidebarNav />);

      const overviewLink = screen.getByRole("link", { name: /Overview/i });
      const accountsLink = screen.getByRole("link", { name: /Accounts/i });

      expect(overviewLink.className).not.toContain("activeNavItem");
      expect(accountsLink.className).toContain("activeNavItem");
    });

    it("highlights Categories when pathname is /categories", () => {
      vi.mocked(usePathname).mockReturnValue("/categories");
      render(<SidebarNav />);

      const overviewLink = screen.getByRole("link", { name: /Overview/i });
      const categoriesLink = screen.getByRole("link", { name: /Categories/i });

      expect(overviewLink.className).not.toContain("activeNavItem");
      expect(categoriesLink.className).toContain("activeNavItem");
    });
  });

  describe("MobileNav", () => {
    it("renders mobile navigation items", () => {
      vi.mocked(usePathname).mockReturnValue("/accounts");
      render(<MobileNav />);

      expect(screen.getByRole("navigation", { name: "Mobile navigation" })).toBeTruthy();
      expect(screen.getByRole("link", { name: /Accounts/i })).toBeTruthy();
    });
  });
});
