"use client";

import { useState, useTransition, type SubmitEvent } from "react";
import {
  Category,
  CategoryType,
  CATEGORY_TYPES,
  updateCategorySchema,
} from "@/lib/schemas/categories";
import { updateCategoryAction } from "@/app/actions/categories";
import { ERROR_MESSAGES } from "@/lib/constants/errors";
import { Dropdown } from "@/components/ui/Dropdown";
import styles from "@/components/ui/ModalForm.module.css";

interface EditCategoryFormProps {
  category: Category;
  onCategoryUpdated?: (category: Category) => void;
  onCancel?: () => void;
}

const CATEGORY_TYPE_LABELS: Record<CategoryType, string> = {
  income: "Income",
  expense: "Expense",
};

export function EditCategoryForm({
  category,
  onCategoryUpdated,
  onCancel,
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

  const isExpense = type === "expense";

  const handleSubmit = (e: SubmitEvent<HTMLFormElement>) => {
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
        const fieldName = issue.path[0] as "name" | "type";
        if (fieldName && !formattedErrors[fieldName]) {
          formattedErrors[fieldName] = issue.message;
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
    <form className={styles.form} onSubmit={handleSubmit} noValidate>
      {serverError && <div role="alert" className={styles.errorBanner}>{serverError}</div>}

      <div className={styles.row}>
        <div className={styles.fieldGroup}>
          <label htmlFor="edit-category-name" className={styles.label}>
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
          <label htmlFor="edit-category-type" className={styles.label}>
            Category Type <span className={styles.requiredStar}>*</span>
          </label>
          <Dropdown
            id="edit-category-type"
            value={type}
            options={CATEGORY_TYPES.map((t) => ({
              value: t,
              label: CATEGORY_TYPE_LABELS[t],
            }))}
            onChange={(val) => setType(val as CategoryType)}
            disabled={isPending}
            hasError={Boolean(fieldErrors.type)}
          />
          {fieldErrors.type && <span className={styles.fieldError}>{fieldErrors.type}</span>}
        </div>
      </div>

      <div className={styles.fieldGroup}>
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
        <button
          type="submit"
          className={isExpense ? styles.submitButtonExpense : styles.submitButtonIncome}
          disabled={isPending}
        >
          {isPending ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </form>
  );
}
