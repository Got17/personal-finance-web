"use client";

import { Category } from "@/lib/schemas/categories";
import { EditCategoryForm } from "./EditCategoryForm";
import { Modal } from "@/components/ui/Modal";

interface EditCategoryModalProps {
  isOpen: boolean;
  category: Category | null;
  onClose: () => void;
  onCategoryUpdated: (category: Category) => void;
}

export function EditCategoryModal({
  isOpen,
  category,
  onClose,
  onCategoryUpdated,
}: EditCategoryModalProps) {
  if (!category) return null;

  const handleUpdated = (updatedCategory: Category) => {
    onCategoryUpdated(updatedCategory);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Edit Category"
      description={`Modify details or active status for ${category.name}.`}
      testId="edit-category-modal"
    >
      <EditCategoryForm
        category={category}
        onCategoryUpdated={handleUpdated}
        onCancel={onClose}
      />
    </Modal>
  );
}
