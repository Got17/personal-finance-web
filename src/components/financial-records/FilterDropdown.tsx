"use client";

import { ReactNode, useCallback, useEffect, useId, useRef, useState } from "react";
import { CheckIcon, ChevronDownIcon } from "./icons";
import styles from "./FilterDropdown.module.css";

export interface FilterDropdownOption {
  value: string;
  label: string;
  count?: number;
  icon?: ReactNode;
}

interface FilterDropdownProps {
  id?: string;
  label: string;
  value: string;
  options: FilterDropdownOption[];
  onChange: (value: string) => void;
  defaultIcon: ReactNode;
  activeIcon?: ReactNode;
}

export function FilterDropdown({
  id: customId,
  label,
  value,
  options,
  onChange,
  defaultIcon,
  activeIcon,
}: FilterDropdownProps) {
  const generatedId = useId();
  const id = customId || generatedId;
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState<number>(-1);

  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLUListElement>(null);

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
          onChange(options[highlightedIndex].value);
          setIsOpen(false);
          triggerRef.current?.focus();
        }
      }
    },
    [isOpen, highlightedIndex, options, onChange]
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
    : options[0]?.label || label;

  return (
    <div
      ref={containerRef}
      className={styles.dropdownContainer}
      onKeyDown={handleKeyDown}
    >
      <button
        ref={triggerRef}
        type="button"
        id={id}
        role="combobox"
        aria-label={label}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-controls={`${id}-listbox`}
        className={`${styles.triggerButton} ${isOpen ? styles.triggerButtonActive : ""}`}
        onClick={() => {
          setIsOpen((prev) => !prev);
          const currentIndex = options.findIndex((o) => o.value === value);
          setHighlightedIndex(currentIndex >= 0 ? currentIndex : 0);
        }}
      >
        <span className={styles.triggerIcon}>{currentIcon}</span>
        <span className={styles.triggerLabel}>{displayText}</span>
        <span className={`${styles.chevron} ${isOpen ? styles.chevronOpen : ""}`}>
          <ChevronDownIcon />
        </span>
      </button>

      {isOpen && (
        <ul
          ref={menuRef}
          role="listbox"
          id={`${id}-listbox`}
          aria-label={label}
          className={styles.dropdownMenu}
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
                className={`${isSelected ? styles.optionSelected : styles.option} ${
                  isHighlighted ? styles.optionHighlighted : ""
                }`}
                onClick={() => handleSelect(option.value)}
                onMouseEnter={() => setHighlightedIndex(index)}
              >
                <div className={styles.optionLeft}>
                  <span className={styles.optionIcon}>{optIcon}</span>
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
