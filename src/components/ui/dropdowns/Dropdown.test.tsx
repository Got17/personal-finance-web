import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Dropdown, DropdownOption } from "./Dropdown";

const mockOptions: DropdownOption[] = [
  { value: "checking", label: "Checking" },
  { value: "savings", label: "Savings", count: 3 },
  { value: "investment", label: "Investment", disabled: true },
];

describe("Dropdown", () => {
  afterEach(cleanup);

  it("renders form variant with label association and selected value", () => {
    const onChange = vi.fn();
    render(
      <div>
        <label htmlFor="account-type">Account Type</label>
        <Dropdown
          id="account-type"
          value="checking"
          options={mockOptions}
          onChange={onChange}
          variant="form"
        />
      </div>
    );

    const select = screen.getByLabelText("Account Type") as HTMLSelectElement;
    expect(select).toBeTruthy();
    expect(select.value).toBe("checking");

    const combobox = screen.getByRole("combobox");
    expect(combobox).toBeTruthy();
    expect(combobox.textContent).toContain("Checking");
  });

  it("supports selection via clicking custom options", () => {
    const onChange = vi.fn();
    render(
      <Dropdown
        id="account-type"
        label="Account Type"
        value="checking"
        options={mockOptions}
        onChange={onChange}
      />
    );

    const combobox = screen.getByRole("combobox");
    fireEvent.click(combobox);

    const listbox = screen.getByRole("listbox");
    expect(listbox).toBeTruthy();

    const options = screen.getAllByRole("option");
    expect(options).toHaveLength(3);

    fireEvent.click(options[1]); // Savings
    expect(onChange).toHaveBeenCalledWith("savings");
  });

  it("syncs value when native select changes", () => {
    const onChange = vi.fn();
    render(
      <div>
        <label htmlFor="account-type">Account Type</label>
        <Dropdown
          id="account-type"
          value="checking"
          options={mockOptions}
          onChange={onChange}
        />
      </div>
    );

    const select = screen.getByLabelText("Account Type");
    fireEvent.change(select, { target: { value: "savings" } });
    expect(onChange).toHaveBeenCalledWith("savings");
  });

  it("handles keyboard navigation and Escape to close", () => {
    const onChange = vi.fn();
    render(
      <Dropdown
        id="account-type"
        label="Account Type"
        value="checking"
        options={mockOptions}
        onChange={onChange}
      />
    );

    const combobox = screen.getByRole("combobox");
    fireEvent.keyDown(combobox, { key: "ArrowDown" });
    expect(screen.getByRole("listbox")).toBeTruthy();

    fireEvent.keyDown(combobox, { key: "Escape" });
    expect(screen.queryByRole("listbox")).toBeNull();
  });

  it("renders pill variant with count badges", () => {
    const onChange = vi.fn();
    render(
      <Dropdown
        id="filter-account"
        label="Filter by account"
        value="savings"
        options={mockOptions}
        onChange={onChange}
        variant="pill"
      />
    );

    const combobox = screen.getByRole("combobox");
    expect(combobox.textContent).toContain("Savings (3)");
  });
});
