"use client";

import { useState, useTransition } from "react";
import { Modal } from "@/components/ui/Modal";
import { Category } from "@/lib/schemas/categories";
import { FinancialRecord } from "@/lib/schemas/financial-records";
import { archiveFinancialRecordAction } from "@/app/actions/financial-records";
import styles from "./DeleteFinancialRecordModal.module.css";

interface DeleteFinancialRecordModalProps {
  readonly isOpen: boolean;
  readonly record: FinancialRecord | null;
  readonly categories: Category[];
  readonly onClose: () => void;
  readonly onRecordDeleted: (record: FinancialRecord) => void;
}

export function DeleteFinancialRecordModal({
  isOpen,
  record,
  categories,
  onClose,
  onRecordDeleted,
}: Readonly<DeleteFinancialRecordModalProps>) {
  const [serverError, setServerError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  if (!isOpen || !record) return null;

  const categoryName =
    categories.find((c) => c.id === record.category_id)?.name || "Uncategorized";
  const displayLabel = record.note || categoryName;
  const formattedAmount = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: record.currency,
  }).format(record.amount_minor / 100);

  const handleClose = () => {
    setServerError(null);
    onClose();
  };

  const handleDelete = () => {
    setServerError(null);

    startTransition(async () => {
      try {
        const result = await archiveFinancialRecordAction(record.id);

        if (!result.success) {
          setServerError(result.error || "Failed to delete transaction. Please try again.");
          return;
        }

        onRecordDeleted(result.record);
        handleClose();
      } catch (err) {
        setServerError(
          err instanceof Error ? err.message : "Failed to delete transaction. Please try again.",
        );
      }
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Delete Transaction"
      testId="delete-financial-record-modal"
    >
      <p className={styles.description}>
        Are you sure you want to delete the transaction for{" "}
        <span className={styles.itemHighlight}>{displayLabel}</span> ({formattedAmount})? The
        transaction will be archived and removed from your active records.
      </p>

      {serverError && (
        <div className={styles.errorBanner} role="alert">
          {serverError}
        </div>
      )}

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
          className={styles.deleteButton}
          onClick={handleDelete}
          disabled={isPending}
        >
          {isPending ? "Deleting…" : "Delete"}
        </button>
      </div>
    </Modal>
  );
}
