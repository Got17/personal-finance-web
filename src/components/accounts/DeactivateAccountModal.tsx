"use client";

import { useState, useTransition, useEffect, MouseEvent } from "react";
import { Account } from "@/lib/schemas/accounts";
import { deactivateAccountAction } from "@/app/actions/accounts";
import styles from "./DeactivateAccountModal.module.css";

interface DeactivateAccountModalProps {
  isOpen: boolean;
  account: Account | null;
  onClose: () => void;
  onAccountDeactivated: (account: Account) => void;
}

export function DeactivateAccountModal({
  isOpen,
  account,
  onClose,
  onAccountDeactivated,
}: DeactivateAccountModalProps) {
  const [serverError, setServerError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (!isOpen || !account) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setServerError(null);
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

  const handleClose = () => {
    setServerError(null);
    onClose();
  };

  const handleBackdropClick = (e: MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  const handleDeactivate = () => {
    setServerError(null);

    startTransition(async () => {
      const result = await deactivateAccountAction(account.id);

      if (!result.success || !result.account) {
        setServerError(result.error || "Failed to deactivate account. Please try again.");
        return;
      }

      onAccountDeactivated(result.account);
      handleClose();
    });
  };

  return (
    <div
      className={styles.backdrop}
      onClick={handleBackdropClick}
      data-testid="deactivate-account-backdrop"
    >
      <div
        className={styles.dialog}
        role="dialog"
        aria-modal="true"
        aria-labelledby="deactivate-modal-title"
        data-testid="deactivate-account-modal"
      >
        <div className={styles.dialogHeader}>
          <div className={styles.warningIcon} aria-hidden="true">
            ⚠
          </div>
          <button
            type="button"
            className={styles.closeButton}
            onClick={handleClose}
            aria-label="Close modal"
            disabled={isPending}
          >
            ✕
          </button>
        </div>

        <div className={styles.titleGroup}>
          <h2 id="deactivate-modal-title">Deactivate Account</h2>
        </div>

        <p className={styles.description}>
          Are you sure you want to deactivate{" "}
          <span className={styles.accountHighlight}>{account.name}</span>? The account will be marked
          inactive, but its past transactions and history will remain available for reporting.
        </p>

        {serverError && <div className={styles.errorBanner}>{serverError}</div>}

        <div className={styles.actions}>
          <button
            type="button"
            className={styles.cancelButton}
            onClick={handleClose}
            disabled={isPending}
          >
            Cancel
          </button>
          <button
            type="button"
            className={styles.deactivateButton}
            onClick={handleDeactivate}
            disabled={isPending}
          >
            {isPending ? "Deactivating..." : "Deactivate Account"}
          </button>
        </div>
      </div>
    </div>
  );
}
