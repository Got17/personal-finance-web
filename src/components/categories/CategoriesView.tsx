"use client";

import { useState } from "react";
import { Category } from "@/lib/schemas/categories";
import { CategoriesList } from "./CategoriesList";
import { CreateCategoryModal } from "./CreateCategoryModal";
import { EditCategoryModal } from "./EditCategoryModal";
import { DeactivateCategoryModal } from "./DeactivateCategoryModal";
import { ViewHeader } from "@/components/ui/ViewHeader";
import styles from "./CategoriesView.module.css";

interface CategoriesViewProps {
  initialCategories: Category[];
}

export function CategoriesView({ initialCategories }: CategoriesViewProps) {
  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [deactivatingCategory, setDeactivatingCategory] = useState<Category | null>(null);

  const handleCategoryCreated = (newCategory: Category) => {
    setCategories((prev) => [newCategory, ...prev]);
  };

  const handleCategoryUpdated = (updatedCategory: Category) => {
    setCategories((prev) =>
      prev.map((cat) => (cat.id === updatedCategory.id ? updatedCategory : cat)),
    );
  };

  const handleCategoryDeactivated = (deactivatedCategory: Category) => {
    setCategories((prev) =>
      prev.map((cat) => (cat.id === deactivatedCategory.id ? deactivatedCategory : cat)),
    );
  };

  return (
    <div className={styles.viewContainer}>
      <ViewHeader
        title="Your Categories"
        count={categories.length}
        unitSingular="category"
        unitPlural="categories"
        actionLabel="+ Add Category"
        onAction={() => setIsCreateModalOpen(true)}
        actionAriaLabel="Add new category"
      />

      <section aria-label="Categories list">
        <CategoriesList
          categories={categories}
          onAddClick={() => setIsCreateModalOpen(true)}
          onEditClick={(cat) => setEditingCategory(cat)}
          onDeactivateClick={(cat) => setDeactivatingCategory(cat)}
        />
      </section>

      <CreateCategoryModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCategoryCreated={handleCategoryCreated}
      />

      <EditCategoryModal
        isOpen={editingCategory !== null}
        category={editingCategory}
        onClose={() => setEditingCategory(null)}
        onCategoryUpdated={handleCategoryUpdated}
      />

      <DeactivateCategoryModal
        isOpen={deactivatingCategory !== null}
        category={deactivatingCategory}
        onClose={() => setDeactivatingCategory(null)}
        onCategoryDeactivated={handleCategoryDeactivated}
      />
    </div>
  );
}
