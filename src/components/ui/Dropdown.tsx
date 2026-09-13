"use client";

import { ReactNode, useCallback, useEffect, useId, useRef, useState } from "react";
import { CheckIcon, ChevronDownIcon } from "@/components/financial-records/icons";
import styles from "./Dropdown.module.css";

export interface DropdownOption {
  value: string;
  label: string;
  count?: number;
  icon?: ReactNode;
  disabled?: boolean;
}

export interface DropdownProps {
  id?: string;
  name?: string;
  label?: string;
  value: string;
  options: DropdownOption[];
  onChange: (value: string) => void;
  variant?: "pill" | "form";
  placeholder?: string;
  defaultIcon?: ReactNode;
  activeIcon?: ReactNode;
  disabled?: boolean;
  required?: boolean;
  hasError?: boolean;
  className?: string;
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
}: DropdownProps) {
  const generatedId = useId();
  const id = customId || generatedId;
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState<number>(-1);

  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const nativeSelectRef = useRef<HTMLSelectElement>(null);

  const selectedOption = options.find((opt) => opt.value === value);

  // Close when clicking outside
  useEffect(() => {
    if (!isOpen) return;

    const handlePointerDown = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
    };
  }, [isOpen]);

  // Keyboard navigation
  const handleKeyDown = useCallback(
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
          setIsOpen(true);
          setHighlightedIndex(options.length - 1);
        } else {
          setHighlightedIndex((prev) => (prev - 1 + options.length) % options.length);
        }
        return;
      }

      if (e.key === "Enter" || e.key === " ") {
        if (isOpen && highlightedIndex >= 0 && highlightedIndex < options.length) {
          e.preventDefault();
          const chosen = options[highlightedIndex];
          if (!chosen.disabled) {
            onChange(chosen.value);
            setIsOpen(false);
            triggerRef.current?.focus();
          }
        }
      }
    },
    [disabled, isOpen, highlightedIndex, options, onChange]
  );

  const handleSelect = (optionValue: string) => {
    onChange(optionValue);
    setIsOpen(false);
    triggerRef.current?.focus();
  };

  const currentIcon =
    activeIcon || (selectedOption?.icon ? selectedOption.icon : defaultIcon);

  const displayText = selectedOption
    ? selectedOption.count !== undefined
      ? `${selectedOption.label} (${selectedOption.count})`
      : selectedOption.label
    : placeholder || options[0]?.label || label || "Select option";

  const isPlaceholderSelected = !selectedOption && Boolean(placeholder);

  const isPill = variant === "pill";
  const containerClass = isPill
    ? `${styles.dropdownContainer} ${className}`.trim()
    : `${styles.dropdownContainerFullWidth} ${className}`.trim();

  const triggerClass = isPill
    ? `${styles.triggerPill} ${isOpen ? styles.triggerPillActive : ""}`
    : `${styles.triggerForm} ${isOpen ? styles.triggerFormActive : ""} ${
        hasError ? styles.triggerFormError : ""
      }`;

  const menuClass = isPill ? styles.dropdownMenu : styles.dropdownMenuFullWidth;

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
        onClick={() => {
          if (disabled) return;
          setIsOpen((prev) => !prev);
          const currentIndex = options.findIndex((o) => o.value === value);
          setHighlightedIndex(currentIndex >= 0 ? currentIndex : 0);
        }}
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
                    handleSelect(option.value);
                  }
                }}
                onMouseEnter={() => {
                  if (!option.disabled) {
                    setHighlightedIndex(index);
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
      )}
    </div>
  );
}
