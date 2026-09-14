"use client";

import { Dropdown, DropdownOption, DropdownProps } from "@/components/ui/Dropdown";

export type FilterDropdownOption = DropdownOption;
export type FilterDropdownProps = DropdownProps;

export function FilterDropdown(props: DropdownProps) {
  return <Dropdown variant="pill" {...props} />;
}
