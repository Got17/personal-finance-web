"use client";

import { useState, useTransition, ReactNode } from "react";
import { Modal } from "./Modal";
import styles from "./DeactivateModal.module.css";

export interface DeactivateModalProps<T extends { id: string; name: string }> {
  isOpen: boolean;
  item: T | null;
  title?: string;
  entityName: string;
  description?: ReactNode;
  onClose: () => void;
  onConfirm: (id: string) => Promise<{ success: boolean; error?: string; item?: T }>;
  onDeactivated: (item: T) => void;
  testId?: string;
}

export function DeactivateModal<T extends { id: string; name: string }>({
  isOpen,
  item,
  title,
  entityName,
  description,
  onClose,
  onConfirm,
  onDeactivated,
  testId,
}: DeactivateModalProps<T>) {
  const [serverError, setServerError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  if (!item) return null;

  const handleClose = () => {
    setServerError(null);
    onClose();
  };

  const handleDeactivate = () => {
    setServerError(null);

    startTransition(async () => {
      try {
        const result = await onConfirm(item.id);

        if (!result.success || !result.item) {
          setServerError(
            result.error || `Failed to deactivate ${entityName.toLowerCase()}. Please try again.`,
          );
          return;
        }

        onDeactivated(result.item);
        handleClose();
      } catch (err) {
        setServerError(
          err instanceof Error
            ? err.message
            : `Failed to deactivate ${entityName.toLowerCase()}. Please try again.`,
        );
      }
    });
  };

  const defaultDescription = (
    <>
      Are you sure you want to deactivate{" "}
      <span className={styles.itemHighlight}>{item.name}</span>? The {entityName.toLowerCase()} will
      be marked inactive, but past records will remain preserved.
    </>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={title || `Deactivate ${entityName}`}
      testId={testId}
    >
      <p className={styles.description}>{description || defaultDescription}</p>

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
          {isPending ? "Deactivating..." : `Deactivate ${entityName}`}
        </button>
      </div>
    </Modal>
  );
}
