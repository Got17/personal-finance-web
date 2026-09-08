"use client";

import { Category } from "@/lib/schemas/categories";
import { deactivateCategoryAction } from "@/app/actions/categories";
import { DeactivateModal } from "@/components/ui/DeactivateModal";
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
  return (
    <DeactivateModal
      isOpen={isOpen}
      item={category}
      entityName="Category"
      description={
        category ? (
          <>
            Are you sure you want to deactivate{" "}
            <span className={styles.categoryHighlight}>{category.name}</span>? The category will be marked
            inactive, but past transaction records linked to it will remain preserved.
          </>
        ) : undefined
      }
      onClose={onClose}
      onConfirm={async (id) => {
        const res = await deactivateCategoryAction(id);
        return {
          success: res.success,
          error: res.error,
          item: res.category,
        };
      }}
      onDeactivated={onCategoryDeactivated}
      testId="deactivate-category-modal"
    />
  );
}
