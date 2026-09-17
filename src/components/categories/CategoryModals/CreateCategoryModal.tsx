"use client";

import { Category, CategoryType } from "@/lib/schemas/categories";
import { CreateCategoryForm } from "../CategoryForm/CreateCategoryForm";
import { Modal } from "@/components/ui/modals/Modal";

interface CreateCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCategoryCreated: (category: Category) => void;
  defaultType?: CategoryType;
}

export function CreateCategoryModal({
  isOpen,
  onClose,
  onCategoryCreated,
  defaultType,
}: Readonly<CreateCategoryModalProps>) {
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
      <CreateCategoryForm
        key={defaultType || "income"}
        defaultType={defaultType}
        onCategoryCreated={handleCreated}
        onCancel={onClose}
      />
    </Modal>
  );
}
