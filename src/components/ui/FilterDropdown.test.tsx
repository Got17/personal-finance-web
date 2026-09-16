import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { FilterDropdown, FilterDropdownOption } from "./FilterDropdown";

const mockOptions: FilterDropdownOption[] = [
  { value: "all", label: "All dates" },
  { value: "this-month", label: "This month", count: 5 },
  { value: "last-month", label: "Last month", count: 2 },
];

const mockIcon = (
  <svg data-testid="mock-icon" width="16" height="16">
    <rect width="16" height="16" />
  </svg>
);

describe("FilterDropdown", () => {
  afterEach(cleanup);

  it("renders trigger button with label and selected option", () => {
    const onChange = vi.fn();
    render(
      <FilterDropdown
        label="Filter by date range"
        value="all"
        options={mockOptions}
        onChange={onChange}
        defaultIcon={mockIcon}
      />
    );

    const combobox = screen.getByRole("combobox", { name: "Filter by date range" });
    expect(combobox).toBeTruthy();
    expect(combobox.textContent).toContain("All dates");
    expect(combobox.getAttribute("aria-expanded")).toBe("false");
    expect(screen.getByTestId("mock-icon")).toBeTruthy();
  });

  it("opens menu on click and selects an option", () => {
    const onChange = vi.fn();
    render(
      <FilterDropdown
        label="Filter by date range"
        value="all"
        options={mockOptions}
        onChange={onChange}
        defaultIcon={mockIcon}
      />
    );

    const combobox = screen.getByRole("combobox", { name: "Filter by date range" });
    fireEvent.click(combobox);

    expect(combobox.getAttribute("aria-expanded")).toBe("true");
    const listbox = screen.getByRole("listbox");
    expect(listbox).toBeTruthy();

    const options = screen.getAllByRole("option");
    expect(options).toHaveLength(3);

    // Click "This month"
    fireEvent.click(options[1]);
    expect(onChange).toHaveBeenCalledWith("this-month");
    expect(screen.queryByRole("listbox")).toBeNull();
  });

  it("supports keyboard navigation with Arrow keys, Enter, and Escape", () => {
    const onChange = vi.fn();
    render(
      <FilterDropdown
        label="Filter by date range"
        value="all"
        options={mockOptions}
        onChange={onChange}
        defaultIcon={mockIcon}
      />
    );

    const combobox = screen.getByRole("combobox", { name: "Filter by date range" });

    // Press ArrowDown to open
    fireEvent.keyDown(combobox, { key: "ArrowDown" });
    expect(screen.getByRole("listbox")).toBeTruthy();

    // Navigate to next option and press Enter
    fireEvent.keyDown(combobox, { key: "ArrowDown" });
    fireEvent.keyDown(combobox, { key: "Enter" });

    expect(onChange).toHaveBeenCalledWith("this-month");
    expect(screen.queryByRole("listbox")).toBeNull();

    // Open and press Escape to close
    fireEvent.click(combobox);
    expect(screen.getByRole("listbox")).toBeTruthy();
    fireEvent.keyDown(combobox, { key: "Escape" });
    expect(screen.queryByRole("listbox")).toBeNull();
  });

  it("closes when clicking outside", () => {
    const onChange = vi.fn();
    render(
      <div>
        <span data-testid="outside">Outside area</span>
        <FilterDropdown
          label="Filter by date range"
          value="all"
          options={mockOptions}
          onChange={onChange}
          defaultIcon={mockIcon}
        />
      </div>
    );

    const combobox = screen.getByRole("combobox", { name: "Filter by date range" });
    fireEvent.click(combobox);
    expect(screen.getByRole("listbox")).toBeTruthy();

    fireEvent.mouseDown(screen.getByTestId("outside"));
    expect(screen.queryByRole("listbox")).toBeNull();
  });
});
