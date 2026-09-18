"use client";

import { useEffect, useRef, useState } from "react";
import { ActionButton, ActionButtonVariant } from "@/components/ui/buttons/ActionButton";
import { PlusIcon, TransferArrowsIcon } from "../icons";
import styles from "./RecordActionMenu.module.css";

export interface RecordActionMenuProps {
  readonly onSelectTransaction: () => void;
  readonly onSelectTransfer: () => void;
  readonly className?: string;
  readonly variant?: ActionButtonVariant;
}

export function RecordActionMenu({
  onSelectTransaction,
  onSelectTransfer,
  className,
  variant = "forest",
}: Readonly<RecordActionMenuProps>) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  const handleTransactionClick = () => {
    setIsOpen(false);
    onSelectTransaction();
  };

  const handleTransferClick = () => {
    setIsOpen(false);
    onSelectTransfer();
  };

  return (
    <div
      ref={containerRef}
      className={`${styles.container} ${className || ""}`.trim()}
    >
      <ActionButton
        variant={variant}
        onClick={() => setIsOpen((prev) => !prev)}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        aria-label="Add new transaction or transfer"
      >
        New
      </ActionButton>

      {isOpen && (
        <div
          className={styles.menu}
          role="menu"
          aria-orientation="vertical"
          aria-label="Create options"
        >
          <button
            type="button"
            className={styles.menuItem}
            role="menuitem"
            onClick={handleTransactionClick}
          >
            <span className={styles.itemIcon} aria-hidden="true">
              <PlusIcon />
            </span>
            <div className={styles.itemText}>
              <span className={styles.itemTitle}>Transaction</span>
              <span className={styles.itemDescription}>
                Record income or expense
              </span>
            </div>
          </button>

          <button
            type="button"
            className={styles.menuItem}
            role="menuitem"
            onClick={handleTransferClick}
          >
            <span className={styles.itemIcon} aria-hidden="true">
              <TransferArrowsIcon />
            </span>
            <div className={styles.itemText}>
              <span className={styles.itemTitle}>Transfer</span>
              <span className={styles.itemDescription}>
                Move money between accounts
              </span>
            </div>
          </button>
        </div>
      )}
    </div>
  );
}
