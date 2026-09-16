"use client";

import { ReactNode, useCallback, useEffect, useId, useRef, useState } from "react";
import { CheckIcon, ChevronDownIcon } from "@/components/financial-records/icons";
import styles from "./Dropdown.module.css";

export interface DropdownOption {
  readonly value: string;
  readonly label: string;
  readonly count?: number;
  readonly icon?: ReactNode;
  readonly disabled?: boolean;
}

export interface DropdownProps {
  readonly id?: string;
  readonly name?: string;
  readonly label?: string;
  readonly value: string;
  readonly options: DropdownOption[];
  readonly onChange: (value: string) => void;
  readonly variant?: "pill" | "form";
  readonly placeholder?: string;
  readonly defaultIcon?: ReactNode;
  readonly activeIcon?: ReactNode;
  readonly disabled?: boolean;
  readonly required?: boolean;
  readonly hasError?: boolean;
  readonly className?: string;
}

function getDisplayText(
  selectedOption?: DropdownOption,
  placeholder?: string,
  options?: DropdownOption[],
  label?: string
): string {
  if (selectedOption) {
    if (selectedOption.count !== undefined) {
      return `${selectedOption.label} (${selectedOption.count})`;
    }
    return selectedOption.label;
  }
  return placeholder || options?.[0]?.label || label || "Select option";
}

function getDropdownClasses(
  variant: "pill" | "form",
  isOpen: boolean,
  openUpward: boolean,
  hasError: boolean,
  className: string
) {
  const isPill = variant === "pill";
  const openClass = isOpen ? styles.dropdownContainerOpen : "";
  const containerClass = `${
    isPill ? styles.dropdownContainer : styles.dropdownContainerFullWidth
  } ${openClass} ${className}`.trim();

  let triggerClass = isPill
    ? `${styles.triggerPill} ${isOpen ? styles.triggerPillActive : ""}`
    : `${styles.triggerForm} ${isOpen ? styles.triggerFormActive : ""}`;
  if (!isPill && hasError) {
    triggerClass += ` ${styles.triggerFormError}`;
  }

  const upwardClass = openUpward ? styles.dropdownMenuUpward : "";
  const menuClass = `${
    isPill ? styles.dropdownMenu : styles.dropdownMenuFullWidth
  } ${upwardClass}`.trim();

  return { containerClass, triggerClass, menuClass };
}

function useOutsideClick(
  isOpen: boolean,
  containerRef: React.RefObject<HTMLDivElement | null>,
  onClose: () => void
) {
  useEffect(() => {
    if (!isOpen) return;

    const handlePointerDown = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
    };
  }, [isOpen, containerRef, onClose]);
}

interface UseDropdownKeyboardProps {
  readonly disabled: boolean;
  readonly isOpen: boolean;
  readonly highlightedIndex: number;
  readonly options: DropdownOption[];
  readonly onChange: (value: string) => void;
  readonly setIsOpen: (open: boolean) => void;
  readonly setHighlightedIndex: React.Dispatch<React.SetStateAction<number>>;
  readonly checkPlacement: () => void;
  readonly triggerRef: React.RefObject<HTMLButtonElement | null>;
}

function useDropdownKeyboard({
  disabled,
  isOpen,
  highlightedIndex,
  options,
  onChange,
  setIsOpen,
  setHighlightedIndex,
  checkPlacement,
  triggerRef,
}: UseDropdownKeyboardProps) {
  return useCallback(
    (e: React.KeyboardEvent) => {
      if (disabled) return;

      if (e.key === "Escape") {
        setIsOpen(false);
        triggerRef.current?.focus();
        return;
      }

      if (e.key === "ArrowDown") {
        e.preventDefault();
        if (!isOpen) {
          checkPlacement();
          setIsOpen(true);
          setHighlightedIndex(0);
        } else {
          setHighlightedIndex((prev) => (prev + 1) % options.length);
        }
        return;
      }

      if (e.key === "ArrowUp") {
        e.preventDefault();
        if (!isOpen) {
          checkPlacement();
          setIsOpen(true);
          setHighlightedIndex(options.length - 1);
        } else {
          setHighlightedIndex((prev) => (prev - 1 + options.length) % options.length);
        }
        return;
      }

      if (e.key === "Enter" || e.key === " ") {
        if (!isOpen || highlightedIndex < 0 || highlightedIndex >= options.length) {
          return;
        }
        e.preventDefault();
        const chosen = options[highlightedIndex];
        if (!chosen.disabled) {
          onChange(chosen.value);
          setIsOpen(false);
          triggerRef.current?.focus();
        }
      }
    },
    [disabled, isOpen, highlightedIndex, options, onChange, setIsOpen, setHighlightedIndex, checkPlacement, triggerRef]
  );
}

interface DropdownMenuProps {
  readonly id: string;
  readonly label?: string;
  readonly menuClass: string;
  readonly options: DropdownOption[];
  readonly value: string;
  readonly highlightedIndex: number;
  readonly defaultIcon?: ReactNode;
  readonly onSelect: (value: string) => void;
  readonly onHighlight: (index: number) => void;
}

function DropdownMenu({
  id,
  label,
  menuClass,
  options,
  value,
  highlightedIndex,
  defaultIcon,
  onSelect,
  onHighlight,
}: Readonly<DropdownMenuProps>) {
  return (
    <ul
      role="listbox"
      id={`${id}-listbox`}
      aria-label={label}
      className={menuClass}
      tabIndex={-1}
    >
      {options.map((option, index) => {
        const isSelected = option.value === value;
        const isHighlighted = index === highlightedIndex;
        const optIcon = option.icon || defaultIcon;

        return (
          <li
            key={option.value}
            id={`${id}-option-${index}`}
            role="option"
            aria-selected={isSelected}
            aria-disabled={option.disabled}
            className={`${isSelected ? styles.optionSelected : styles.option} ${
              isHighlighted ? styles.optionHighlighted : ""
            } ${option.disabled ? styles.optionDisabled : ""}`}
            onClick={() => {
              if (!option.disabled) {
                onSelect(option.value);
              }
            }}
            onMouseEnter={() => {
              if (!option.disabled) {
                onHighlight(index);
              }
            }}
          >
            <div className={styles.optionLeft}>
              {optIcon && <span className={styles.optionIcon}>{optIcon}</span>}
              <span className={styles.optionLabel}>{option.label}</span>
            </div>

            <div className={styles.optionRight}>
              {option.count !== undefined && (
                <span className={styles.optionCount}>{option.count}</span>
              )}
              {isSelected && <CheckIcon className={styles.checkIcon} />}
            </div>
          </li>
        );
      })}
    </ul>
  );
}

export function Dropdown({
  id: customId,
  name,
  label,
  value,
  options,
  onChange,
  variant = "form",
  placeholder,
  defaultIcon,
  activeIcon,
  disabled = false,
  required = false,
  hasError = false,
  className = "",
}: Readonly<DropdownProps>) {
  const generatedId = useId();
  const id = customId || generatedId;
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState<number>(-1);
  const [openUpward, setOpenUpward] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const nativeSelectRef = useRef<HTMLSelectElement>(null);

  const selectedOption = options.find((opt) => opt.value === value);

  const checkPlacement = useCallback(() => {
    if (triggerRef.current && typeof window !== "undefined") {
      const rect = triggerRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      const spaceAbove = rect.top;
      setOpenUpward(spaceBelow < 250 && spaceAbove > spaceBelow);
    }
  }, []);

  const handleClose = useCallback(() => {
    setIsOpen(false);
  }, []);

  useOutsideClick(isOpen, containerRef, handleClose);

  const handleKeyDown = useDropdownKeyboard({
    disabled,
    isOpen,
    highlightedIndex,
    options,
    onChange,
    setIsOpen,
    setHighlightedIndex,
    checkPlacement,
    triggerRef,
  });

  const handleSelect = (optionValue: string) => {
    onChange(optionValue);
    setIsOpen(false);
    triggerRef.current?.focus();
  };

  const handleTriggerClick = () => {
    if (disabled) return;
    if (!isOpen) {
      checkPlacement();
    }
    setIsOpen((prev) => !prev);
    const currentIndex = options.findIndex((o) => o.value === value);
    setHighlightedIndex(currentIndex >= 0 ? currentIndex : 0);
  };

  const currentIcon = activeIcon || selectedOption?.icon || defaultIcon;
  const displayText = getDisplayText(selectedOption, placeholder, options, label);
  const isPlaceholderSelected = !selectedOption && Boolean(placeholder);

  const { containerClass, triggerClass, menuClass } = getDropdownClasses(
    variant,
    isOpen,
    openUpward,
    hasError,
    className
  );

  return (
    <div
      ref={containerRef}
      className={containerClass}
      onKeyDown={handleKeyDown}
    >
      {/* Hidden native select for form data, label associations, and automated tests */}
      <select
        ref={nativeSelectRef}
        id={id}
        name={name}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        required={required}
        tabIndex={-1}
        aria-hidden="true"
        className={styles.hiddenSelect}
        onFocus={() => triggerRef.current?.focus()}
      >
        {placeholder && (
          <option value="" disabled={required}>
            {placeholder}
          </option>
        )}
        {options.map((option) => (
          <option
            key={option.value}
            value={option.value}
            disabled={option.disabled}
          >
            {option.label}
          </option>
        ))}
      </select>

      {/* Styled accessible custom dropdown button */}
      <button
        ref={triggerRef}
        type="button"
        role="combobox"
        aria-label={label}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-controls={`${id}-listbox`}
        disabled={disabled}
        className={triggerClass}
        onClick={handleTriggerClick}
      >
        <span className={styles.triggerContent}>
          {currentIcon && <span className={styles.triggerIcon}>{currentIcon}</span>}
          <span
            className={`${styles.triggerLabel} ${
              isPlaceholderSelected ? styles.triggerLabelPlaceholder : ""
            }`}
          >
            {displayText}
          </span>
        </span>
        <span className={`${styles.chevron} ${isOpen ? styles.chevronOpen : ""}`}>
          <ChevronDownIcon />
        </span>
      </button>

      {/* Floating custom styled dropdown menu */}
      {isOpen && (
        <DropdownMenu
          id={id}
          label={label}
          menuClass={menuClass}
          options={options}
          value={value}
          highlightedIndex={highlightedIndex}
          defaultIcon={defaultIcon}
          onSelect={handleSelect}
          onHighlight={setHighlightedIndex}
        />
      )}
    </div>
  );
}
