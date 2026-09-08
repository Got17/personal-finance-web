"use client";

import { useState, useTransition } from "react";
import { Account } from "@/lib/schemas/accounts";
import { deactivateAccountAction } from "@/app/actions/accounts";
import { ERROR_MESSAGES } from "@/lib/constants/errors";
import { Modal } from "@/components/ui/Modal";
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

  if (!account) return null;

  const handleClose = () => {
    setServerError(null);
    onClose();
  };

  const handleDeactivate = () => {
    setServerError(null);

    startTransition(async () => {
      const result = await deactivateAccountAction(account.id);

      if (!result.success || !result.account) {
        setServerError(result.error || ERROR_MESSAGES.ACCOUNTS.DEACTIVATE_FAILED);
        return;
      }

      onAccountDeactivated(result.account);
      handleClose();
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Deactivate Account"
      testId="deactivate-account-modal"
    >
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
    </Modal>
  );
}
