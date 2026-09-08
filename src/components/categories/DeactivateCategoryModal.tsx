"use client";

import { useState, useTransition } from "react";
import { Category } from "@/lib/schemas/categories";
import { deactivateCategoryAction } from "@/app/actions/categories";
import { ERROR_MESSAGES } from "@/lib/constants/errors";
import { Modal } from "@/components/ui/Modal";
import styles from "./DeactivateCategoryModal.module.css";

interface DeactivateCategoryModalProps {
  isOpen: boolean;
  category: Category | null;
  onClose: () => void;
  onCategoryDeactivated: (category: Category) => void;
}

export function DeactivateCategoryModal({
  isOpen,
  category,
  onClose,
  onCategoryDeactivated,
}: DeactivateCategoryModalProps) {
  const [serverError, setServerError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  if (!category) return null;

  const handleClose = () => {
    setServerError(null);
    onClose();
  };

  const handleDeactivate = () => {
    setServerError(null);

    startTransition(async () => {
      const result = await deactivateCategoryAction(category.id);

      if (!result.success || !result.category) {
        setServerError(result.error || ERROR_MESSAGES.CATEGORIES.DEACTIVATE_FAILED);
        return;
      }

      onCategoryDeactivated(result.category);
      handleClose();
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Deactivate Category"
      testId="deactivate-category-modal"
    >
      <p className={styles.description}>
        Are you sure you want to deactivate{" "}
        <span className={styles.categoryHighlight}>{category.name}</span>? The category will be marked
        inactive, but past transaction records linked to it will remain preserved.
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
          {isPending ? "Deactivating..." : "Deactivate Category"}
        </button>
      </div>
    </Modal>
  );
}
