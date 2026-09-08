"use client";

import { useState, useTransition, FormEvent } from "react";
import {
  Category,
  CategoryType,
  CATEGORY_TYPES,
  updateCategorySchema,
} from "@/lib/schemas/categories";
import { updateCategoryAction } from "@/app/actions/categories";
import { ERROR_MESSAGES } from "@/lib/constants/errors";
import styles from "./EditCategoryForm.module.css";

interface EditCategoryFormProps {
  category: Category;
  onCategoryUpdated?: (category: Category) => void;
  onCancel?: () => void;
  hideHeader?: boolean;
}

const CATEGORY_TYPE_LABELS: Record<CategoryType, string> = {
  income: "Income",
  expense: "Expense",
};

export function EditCategoryForm({
  category,
  onCategoryUpdated,
  onCancel,
  hideHeader = true,
}: EditCategoryFormProps) {
  const [name, setName] = useState(category.name);
  const [type, setType] = useState<CategoryType>(category.type);
  const [isActive, setIsActive] = useState(category.is_active);

  const [fieldErrors, setFieldErrors] = useState<{
    name?: string;
    type?: string;
  }>({});
  const [serverError, setServerError] = useState<string | null>(null);

  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setServerError(null);
    setFieldErrors({});

    const validation = updateCategorySchema.safeParse({
      name,
      type,
      is_active: isActive,
    });

    if (!validation.success) {
      const formattedErrors: { name?: string; type?: string } = {};
      for (const issue of validation.error.issues) {
        const fieldName = issue.path[0];
        if (fieldName === "name" || fieldName === "type") {
          if (!formattedErrors[fieldName]) {
            formattedErrors[fieldName] = issue.message;
          }
        }
      }
      setFieldErrors(formattedErrors);
      return;
    }

    startTransition(async () => {
      const result = await updateCategoryAction(category.id, validation.data);

      if (!result.success || !result.category) {
        setServerError(result.error || ERROR_MESSAGES.CATEGORIES.UPDATE_FAILED);
        return;
      }

      if (onCategoryUpdated) {
        onCategoryUpdated(result.category);
      }
    });
  };

  return (
    <form className={hideHeader ? undefined : styles.formCard} onSubmit={handleSubmit} noValidate>
      {!hideHeader && (
        <div className={styles.formHeader}>
          <h3>Edit Category</h3>
          <p>Update category name, type, or active state.</p>
        </div>
      )}

      {serverError && <div className={styles.errorBanner}>{serverError}</div>}

      <div className={styles.formGrid}>
        <div className={styles.fieldGroup}>
          <label htmlFor="edit-category-name">
            Category Name <span className={styles.requiredStar}>*</span>
          </label>
          <input
            id="edit-category-name"
            type="text"
            className={`${styles.input} ${fieldErrors.name ? styles.inputError : ""}`}
            placeholder="e.g. Groceries"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={isPending}
            required
          />
          {fieldErrors.name && <span className={styles.fieldError}>{fieldErrors.name}</span>}
        </div>

        <div className={styles.fieldGroup}>
          <label htmlFor="edit-category-type">
            Category Type <span className={styles.requiredStar}>*</span>
          </label>
          <select
            id="edit-category-type"
            className={`${styles.select} ${fieldErrors.type ? styles.inputError : ""}`}
            value={type}
            onChange={(e) => setType(e.target.value as CategoryType)}
            disabled={isPending}
          >
            {CATEGORY_TYPES.map((t) => (
              <option key={t} value={t}>
                {CATEGORY_TYPE_LABELS[t]}
              </option>
            ))}
          </select>
          {fieldErrors.type && <span className={styles.fieldError}>{fieldErrors.type}</span>}
        </div>

        <div className={styles.fieldGroupFull}>
          <label className={styles.checkboxLabel} htmlFor="edit-category-is-active">
            <input
              id="edit-category-is-active"
              type="checkbox"
              className={styles.checkbox}
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              disabled={isPending}
            />
            Active Category
          </label>
        </div>
      </div>

      <div className={styles.actions}>
        {onCancel && (
          <button
            type="button"
            className={styles.cancelButton}
            onClick={onCancel}
            disabled={isPending}
          >
            Cancel
          </button>
        )}
        <button type="submit" className={styles.submitButton} disabled={isPending}>
          {isPending ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </form>
  );
}
