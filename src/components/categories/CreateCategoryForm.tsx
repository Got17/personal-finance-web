"use client";

import { useState, useTransition, type SubmitEvent } from "react";
import {
  CATEGORY_TYPES,
  Category,
  CategoryType,
  createCategorySchema,
} from "@/lib/schemas/categories";
import { createCategoryAction } from "@/app/actions/categories";
import { ERROR_MESSAGES } from "@/lib/constants/errors";
import { Dropdown } from "@/components/ui/Dropdown";
import styles from "@/components/ui/ModalForm.module.css";

interface CreateCategoryFormProps {
  readonly onCategoryCreated?: (category: Category) => void;
  readonly onCancel?: () => void;
  readonly defaultType?: CategoryType;
}

const CATEGORY_TYPE_LABELS: Record<CategoryType, string> = {
  income: "Income",
  expense: "Expense",
};

export function CreateCategoryForm({
  onCategoryCreated,
  onCancel,
  defaultType = "income",
}: Readonly<CreateCategoryFormProps>) {
  const [name, setName] = useState("");
  const [type, setType] = useState<CategoryType>(defaultType);
  const [isActive, setIsActive] = useState(true);

  const [fieldErrors, setFieldErrors] = useState<{
    name?: string;
    type?: string;
  }>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [isPending, startTransition] = useTransition();

  const isExpense = type === "expense";

  const handleSubmit = (e: SubmitEvent<HTMLFormElement>) => {
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
    <form className={styles.form} onSubmit={handleSubmit} noValidate>
      {serverError && <div role="alert" className={styles.errorBanner}>{serverError}</div>}
      {successMessage && <div className={styles.successBanner}>{successMessage}</div>}

      <div className={styles.row}>
        <div className={styles.fieldGroup}>
          <label htmlFor="category-name" className={styles.label}>
            Category Name <span className={styles.requiredStar}>*</span>
          </label>
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
          <label htmlFor="category-type" className={styles.label}>
            Category Type <span className={styles.requiredStar}>*</span>
          </label>
          <Dropdown
            id="category-type"
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
        <label className={styles.checkboxLabel} htmlFor="category-is-active">
          <input
            id="category-is-active"
            type="checkbox"
            className={styles.checkbox}
            checked={isActive}
            onChange={(e) => setIsActive(e.target.checked)}
            disabled={isPending}
          />
          <span>Active Category</span>
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
          {isPending ? "Creating..." : "+ Add Category"}
        </button>
      </div>
    </form>
  );
}
