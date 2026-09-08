"use client";

import { useState, useTransition, FormEvent } from "react";
import {
  ACCOUNT_TYPES,
  Account,
  AccountType,
  updateAccountSchema,
} from "@/lib/schemas/accounts";
import { updateAccountAction } from "@/app/actions/accounts";
import { ERROR_MESSAGES } from "@/lib/constants/errors";
import styles from "./EditAccountForm.module.css";

interface EditAccountFormProps {
  account: Account;
  onAccountUpdated?: (account: Account) => void;
  onCancel?: () => void;
  hideHeader?: boolean;
}

const ACCOUNT_TYPE_LABELS: Record<AccountType, string> = {
  checking: "Checking Account",
  savings: "Savings Account",
  credit_card: "Credit Card",
  investment: "Investment Account",
  cash: "Cash / Wallet",
  loan: "Loan / Mortgage",
  other: "Other Account",
};

export function EditAccountForm({
  account,
  onAccountUpdated,
  onCancel,
  hideHeader = true,
}: EditAccountFormProps) {
  const [name, setName] = useState(account.name);
  const [type, setType] = useState<AccountType>(account.type);
  const [currency, setCurrency] = useState(account.currency);
  const [description, setDescription] = useState(account.description || "");
  const [isActive, setIsActive] = useState(account.is_active);

  const [fieldErrors, setFieldErrors] = useState<{
    name?: string;
    type?: string;
    currency?: string;
  }>({});
  const [serverError, setServerError] = useState<string | null>(null);

  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setServerError(null);
    setFieldErrors({});

    const validation = updateAccountSchema.safeParse({
      name,
      type,
      currency,
      description: description || undefined,
      is_active: isActive,
    });

    if (!validation.success) {
      const formattedErrors: { name?: string; type?: string; currency?: string } = {};
      for (const issue of validation.error.issues) {
        const fieldName = issue.path[0];
        if (fieldName === "name" || fieldName === "type" || fieldName === "currency") {
          if (!formattedErrors[fieldName]) {
            formattedErrors[fieldName] = issue.message;
          }
        }
      }
      setFieldErrors(formattedErrors);
      return;
    }

    startTransition(async () => {
      const result = await updateAccountAction(account.id, validation.data);

      if (!result.success || !result.account) {
        setServerError(result.error || ERROR_MESSAGES.ACCOUNTS.UPDATE_FAILED);
        return;
      }

      if (onAccountUpdated) {
        onAccountUpdated(result.account);
      }
    });
  };

  return (
    <form className={hideHeader ? undefined : styles.formCard} onSubmit={handleSubmit} noValidate>
      {!hideHeader && (
        <div className={styles.formHeader}>
          <h3>Edit Account</h3>
          <p>Update mutable details for {account.name}.</p>
        </div>
      )}

      {serverError && <div className={styles.errorBanner}>{serverError}</div>}

      <div className={styles.formGrid}>
        <div className={styles.fieldGroup}>
          <label htmlFor="edit-account-name">
            Account Name <span className={styles.requiredStar}>*</span>
          </label>
          <input
            id="edit-account-name"
            type="text"
            className={`${styles.input} ${fieldErrors.name ? styles.inputError : ""}`}
            placeholder="e.g. Everyday Checking"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={isPending}
            required
          />
          {fieldErrors.name && <span className={styles.fieldError}>{fieldErrors.name}</span>}
        </div>

        <div className={styles.fieldGroup}>
          <label htmlFor="edit-account-type">
            Account Type <span className={styles.requiredStar}>*</span>
          </label>
          <select
            id="edit-account-type"
            className={`${styles.select} ${fieldErrors.type ? styles.inputError : ""}`}
            value={type}
            onChange={(e) => setType(e.target.value as AccountType)}
            disabled={isPending}
          >
            {ACCOUNT_TYPES.map((t) => (
              <option key={t} value={t}>
                {ACCOUNT_TYPE_LABELS[t]}
              </option>
            ))}
          </select>
          {fieldErrors.type && <span className={styles.fieldError}>{fieldErrors.type}</span>}
        </div>

        <div className={styles.fieldGroup}>
          <label htmlFor="edit-account-currency">
            Currency (ISO Code) <span className={styles.requiredStar}>*</span>
          </label>
          <input
            id="edit-account-currency"
            type="text"
            className={`${styles.input} ${fieldErrors.currency ? styles.inputError : ""}`}
            placeholder="USD, EUR, GBP..."
            maxLength={3}
            value={currency}
            onChange={(e) => setCurrency(e.target.value.toUpperCase())}
            disabled={isPending}
            required
          />
          {fieldErrors.currency && (
            <span className={styles.fieldError}>{fieldErrors.currency}</span>
          )}
        </div>

        <div className={styles.fieldGroup}>
          <label htmlFor="edit-account-description">Description (Optional)</label>
          <input
            id="edit-account-description"
            type="text"
            className={styles.input}
            placeholder="e.g. Primary salary checking account"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={isPending}
          />
        </div>

        <div className={styles.fieldGroupFull}>
          <label className={styles.checkboxLabel} htmlFor="edit-account-is-active">
            <input
              id="edit-account-is-active"
              type="checkbox"
              className={styles.checkbox}
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              disabled={isPending}
            />
            Active Account
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
