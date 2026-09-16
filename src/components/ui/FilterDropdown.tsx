"use client";

import { Dropdown, DropdownOption, DropdownProps } from "@/components/ui/Dropdown";

export type FilterDropdownOption = DropdownOption;
export type FilterDropdownProps = DropdownProps;

export enum StatusFilter {
  All = "all",
  Active = "active",
  Inactive = "inactive",
}

export function FilterDropdown(props: DropdownProps) {
  return <Dropdown variant="pill" {...props} />;
}
