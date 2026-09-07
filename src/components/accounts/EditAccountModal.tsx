"use client";

import { useEffect, MouseEvent } from "react";
import { Account } from "@/lib/schemas/accounts";
import { EditAccountForm } from "./EditAccountForm";
import styles from "./EditAccountModal.module.css";

interface EditAccountModalProps {
  isOpen: boolean;
  account: Account | null;
  onClose: () => void;
  onAccountUpdated: (account: Account) => void;
}

export function EditAccountModal({
  isOpen,
  account,
  onClose,
  onAccountUpdated,
}: EditAccountModalProps) {
  useEffect(() => {
    if (!isOpen || !account) return;

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
  }, [isOpen, account, onClose]);

  if (!isOpen || !account) return null;

  const handleBackdropClick = (e: MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleUpdated = (updatedAccount: Account) => {
    onAccountUpdated(updatedAccount);
    onClose();
  };

  return (
    <div
      className={styles.backdrop}
      onClick={handleBackdropClick}
      data-testid="edit-account-backdrop"
    >
      <div
        className={styles.dialog}
        role="dialog"
        aria-modal="true"
        aria-labelledby="edit-modal-title"
        data-testid="edit-account-modal"
      >
        <div className={styles.dialogHeader}>
          <div className={styles.titleGroup}>
            <h2 id="edit-modal-title">Edit Account</h2>
            <p>Modify details or change status for {account.name}.</p>
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

        <EditAccountForm
          account={account}
          onAccountUpdated={handleUpdated}
          onCancel={onClose}
        />
      </div>
    </div>
  );
}
