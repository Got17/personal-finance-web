"use client";

import { useEffect, MouseEvent } from "react";
import { Category } from "@/lib/schemas/categories";
import { CreateCategoryForm } from "./CreateCategoryForm";
import styles from "./CreateCategoryModal.module.css";

interface CreateCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCategoryCreated: (category: Category) => void;
}

export function CreateCategoryModal({
  isOpen,
  onClose,
  onCategoryCreated,
}: CreateCategoryModalProps) {
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

  const handleCreated = (category: Category) => {
    onCategoryCreated(category);
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
        data-testid="create-category-modal"
      >
        <div className={styles.dialogHeader}>
          <div className={styles.titleGroup}>
            <h2 id="modal-title">Add New Category</h2>
            <p>Create an income or expense category to organize your finances.</p>
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

        <CreateCategoryForm
          onCategoryCreated={handleCreated}
          onCancel={onClose}
        />
      </div>
    </div>
  );
}
