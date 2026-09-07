"use client";

import { useEffect, MouseEvent } from "react";
import { Account } from "@/lib/schemas/accounts";
import { CreateAccountForm } from "./CreateAccountForm";
import styles from "./CreateAccountModal.module.css";

interface CreateAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultCurrency?: string;
  onAccountCreated: (account: Account) => void;
}

export function CreateAccountModal({
  isOpen,
  onClose,
  defaultCurrency = "USD",
  onAccountCreated,
}: CreateAccountModalProps) {
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleBackdropClick = (e: MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleCreated = (account: Account) => {
    onAccountCreated(account);
    onClose();
  };

  return (
    <div
      className={styles.backdrop}
      onClick={handleBackdropClick}
      data-testid="modal-backdrop"
    >
      <div
        className={styles.dialog}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        data-testid="create-account-modal"
      >
        <div className={styles.dialogHeader}>
          <div className={styles.titleGroup}>
            <h2 id="modal-title">Add New Account</h2>
            <p>Enter details to track a bank account, card, or asset.</p>
          </div>
          <button
            type="button"
            className={styles.closeButton}
            onClick={onClose}
            aria-label="Close modal"
          >
            ✕
          </button>
        </div>

        <CreateAccountForm
          defaultCurrency={defaultCurrency}
          onAccountCreated={handleCreated}
          onCancel={onClose}
        />
      </div>
    </div>
  );
}
