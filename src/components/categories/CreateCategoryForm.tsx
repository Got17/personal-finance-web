"use client";

import { useState, useTransition, FormEvent } from "react";
import {
  CATEGORY_TYPES,
  Category,
  CategoryType,
  createCategorySchema,
} from "@/lib/schemas/categories";
import { createCategoryAction } from "@/app/actions/categories";
import { ERROR_MESSAGES } from "@/lib/constants/errors";
import styles from "./CreateCategoryForm.module.css";

interface CreateCategoryFormProps {
  onCategoryCreated?: (category: Category) => void;
  onCancel?: () => void;
  hideHeader?: boolean;
}

const CATEGORY_TYPE_LABELS: Record<CategoryType, string> = {
  income: "Income",
  expense: "Expense",
};

export function CreateCategoryForm({
  onCategoryCreated,
  onCancel,
  hideHeader = true,
}: CreateCategoryFormProps) {
  const [name, setName] = useState("");
  const [type, setType] = useState<CategoryType>("income");
  const [isActive, setIsActive] = useState(true);

  const [fieldErrors, setFieldErrors] = useState<{
    name?: string;
    type?: string;
  }>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setServerError(null);
    setSuccessMessage(null);
    setFieldErrors({});

    const validation = createCategorySchema.safeParse({
      name,
      type,
      is_active: isActive,
    });

    if (!validation.success) {
      const formatted = validation.error.format();
      setFieldErrors({
        name: formatted.name?._errors[0],
        type: formatted.type?._errors[0],
      });
      return;
    }

    startTransition(async () => {
      const result = await createCategoryAction(validation.data);

      if (!result.success || !result.category) {
        setServerError(result.error || ERROR_MESSAGES.CATEGORIES.CREATE_FAILED);
        return;
      }

      setSuccessMessage(`Category "${result.category.name}" created successfully.`);
      setName("");
      setIsActive(true);

      if (onCategoryCreated) {
        onCategoryCreated(result.category);
      }
    });
  };

  return (
    <form className={hideHeader ? undefined : styles.formCard} onSubmit={handleSubmit} noValidate>
      {!hideHeader && (
        <div className={styles.formHeader}>
          <h3>Add New Category</h3>
          <p>Create an income or expense category to organize your finances.</p>
        </div>
      )}

      {serverError && <div className={styles.errorBanner}>{serverError}</div>}
      {successMessage && <div className={styles.successBanner}>{successMessage}</div>}

      <div className={styles.formGrid}>
        <div className={styles.fieldGroup}>
          <label htmlFor="category-name">Category Name *</label>
          <input
            id="category-name"
            type="text"
            className={`${styles.input} ${fieldErrors.name ? styles.inputError : ""}`}
            placeholder="e.g. Salary, Groceries, Rent"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={isPending}
            required
          />
          {fieldErrors.name && <span className={styles.fieldError}>{fieldErrors.name}</span>}
        </div>

        <div className={styles.fieldGroup}>
          <label htmlFor="category-type">Category Type *</label>
          <select
            id="category-type"
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
          <label className={styles.checkboxLabel} htmlFor="category-is-active">
            <input
              id="category-is-active"
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
          {isPending ? "Creating..." : "+ Add Category"}
        </button>
      </div>
    </form>
  );
}
