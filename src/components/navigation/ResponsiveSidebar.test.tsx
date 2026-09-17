import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { ResponsiveSidebar } from "./ResponsiveSidebar";

vi.mock("next/navigation", () => ({
  usePathname: vi.fn(() => "/"),
  useRouter: vi.fn(() => ({
    push: vi.fn(),
    refresh: vi.fn(),
  })),
}));

const mockUser = {
  email: "alex@example.com",
  base_currency: "USD",
};

describe("ResponsiveSidebar", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it("renders mobile header with hamburger button and desktop sidebar with profile info", () => {
    render(<ResponsiveSidebar user={mockUser} />);

    expect(screen.getByRole("button", { name: "Open navigation menu" })).toBeTruthy();
    expect(screen.getByRole("navigation", { name: "Primary navigation" })).toBeTruthy();
    expect(screen.getByText("alex@example.com")).toBeTruthy();
    expect(screen.getByText("Base currency: USD")).toBeTruthy();
  });

  it("opens drawer when hamburger button is clicked and closes when close button is clicked", () => {
    render(<ResponsiveSidebar user={mockUser} />);

    const hamburgerBtn = screen.getByRole("button", { name: "Open navigation menu" });
    expect(hamburgerBtn.getAttribute("aria-expanded")).toBe("false");
    expect(screen.queryByTestId("sidebar-backdrop")).toBeNull();

    // Click hamburger button to open
    fireEvent.click(hamburgerBtn);

    expect(hamburgerBtn.getAttribute("aria-expanded")).toBe("true");
    expect(screen.getByTestId("sidebar-backdrop")).toBeTruthy();

    // Click close button
    const closeBtn = screen.getByRole("button", { name: "Close navigation menu" });
    fireEvent.click(closeBtn);

    expect(hamburgerBtn.getAttribute("aria-expanded")).toBe("false");
    expect(screen.queryByTestId("sidebar-backdrop")).toBeNull();
  });

  it("closes drawer when backdrop is clicked", () => {
    render(<ResponsiveSidebar user={mockUser} />);

    const hamburgerBtn = screen.getByRole("button", { name: "Open navigation menu" });
    fireEvent.click(hamburgerBtn);

    const backdrop = screen.getByTestId("sidebar-backdrop");
    fireEvent.click(backdrop);

    expect(screen.queryByTestId("sidebar-backdrop")).toBeNull();
  });

  it("closes drawer when Escape key is pressed", () => {
    render(<ResponsiveSidebar user={mockUser} />);

    const hamburgerBtn = screen.getByRole("button", { name: "Open navigation menu" });
    fireEvent.click(hamburgerBtn);

    expect(screen.getByTestId("sidebar-backdrop")).toBeTruthy();

    fireEvent.keyDown(window, { key: "Escape" });

    expect(screen.queryByTestId("sidebar-backdrop")).toBeNull();
  });

  it("closes drawer when a navigation link is clicked", () => {
    render(<ResponsiveSidebar user={mockUser} />);

    const hamburgerBtn = screen.getByRole("button", { name: "Open navigation menu" });
    fireEvent.click(hamburgerBtn);

    expect(screen.getByTestId("sidebar-backdrop")).toBeTruthy();

    const accountsLink = screen.getByRole("link", { name: /Accounts/i });
    accountsLink.addEventListener("click", (e) => e.preventDefault());
    fireEvent.click(accountsLink);

    expect(screen.queryByTestId("sidebar-backdrop")).toBeNull();
  });
});