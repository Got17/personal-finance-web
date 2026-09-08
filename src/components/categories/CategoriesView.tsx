"use client";

import { useState } from "react";
import { Category } from "@/lib/schemas/categories";
import { CategoriesList } from "./CategoriesList";
import { CreateCategoryModal } from "./CreateCategoryModal";
import styles from "./CategoriesView.module.css";

interface CategoriesViewProps {
  initialCategories: Category[];
}

export function CategoriesView({ initialCategories }: CategoriesViewProps) {
  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const handleCategoryCreated = (newCategory: Category) => {
    setCategories((prev) => [newCategory, ...prev]);
  };

  return (
    <div className={styles.viewContainer}>
      <div className={styles.headerRow}>
        <div className={styles.titleGroup}>
          <h2 className={styles.sectionTitle}>Your Categories</h2>
          <span className={styles.categoryCount}>
            {categories.length} {categories.length === 1 ? "category" : "categories"}
          </span>
        </div>
        <button
          type="button"
          className={styles.addButton}
          onClick={() => setIsCreateModalOpen(true)}
          aria-label="Add new category"
        >
          + Add Category
        </button>
      </div>

      <section aria-label="Categories list">
        <CategoriesList
          categories={categories}
          onAddClick={() => setIsCreateModalOpen(true)}
        />
      </section>

      <CreateCategoryModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCategoryCreated={handleCategoryCreated}
      />
    </div>
  );
}
