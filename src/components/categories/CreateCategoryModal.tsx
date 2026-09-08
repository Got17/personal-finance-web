"use client";

import { Category } from "@/lib/schemas/categories";
import { CreateCategoryForm } from "./CreateCategoryForm";
import { Modal } from "@/components/ui/Modal";

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
  const handleCreated = (category: Category) => {
    onCategoryCreated(category);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Add New Category"
      description="Create an income or expense category to organize your finances."
      testId="create-category-modal"
    >
      <CreateCategoryForm onCategoryCreated={handleCreated} onCancel={onClose} />
    </Modal>
  );
}
