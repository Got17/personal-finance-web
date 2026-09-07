"use client";

import { useState, useTransition, FormEvent } from "react";
import {
  ACCOUNT_TYPES,
  Account,
  AccountType,
  createAccountSchema,
} from "@/lib/schemas/accounts";
import { createAccountAction } from "@/app/actions/accounts";
import styles from "./CreateAccountForm.module.css";

interface CreateAccountFormProps {
  defaultCurrency?: string;
  onAccountCreated?: (account: Account) => void;
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

export function CreateAccountForm({
  defaultCurrency = "USD",
  onAccountCreated,
  onCancel,
  hideHeader = true,
}: CreateAccountFormProps) {
  const [name, setName] = useState("");
  const [type, setType] = useState<AccountType>("checking");
  const [currency, setCurrency] = useState(defaultCurrency);
  const [description, setDescription] = useState("");
  const [isActive, setIsActive] = useState(true);

  const [fieldErrors, setFieldErrors] = useState<{
    name?: string;
    type?: string;
    currency?: string;
  }>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setServerError(null);
    setSuccessMessage(null);
    setFieldErrors({});

    const validation = createAccountSchema.safeParse({
      name,
      type,
      currency,
      description: description || undefined,
      is_active: isActive,
    });

    if (!validation.success) {
      const formattedErrors: { name?: string; type?: string; currency?: string } = {};
      for (const issue of validation.error.issues) {
        const fieldName = issue.path[0] as "name" | "type" | "currency";
        if (fieldName && !formattedErrors[fieldName]) {
          formattedErrors[fieldName] = issue.message;
        }
      }
      setFieldErrors(formattedErrors);
      return;
    }

    startTransition(async () => {
      const result = await createAccountAction(validation.data);

      if (!result.success || !result.account) {
        setServerError(result.error || "Failed to create account. Please try again.");
        return;
      }

      setSuccessMessage(`Account "${result.account.name}" created successfully.`);
      setName("");
      setDescription("");
      setIsActive(true);

      if (onAccountCreated) {
        onAccountCreated(result.account);
      }
    });
  };

  return (
    <form className={hideHeader ? undefined : styles.formCard} onSubmit={handleSubmit} noValidate>
      {!hideHeader && (
        <div className={styles.formHeader}>
          <h3>Add New Account</h3>
          <p>Enter details to track a bank account, card, or asset.</p>
        </div>
      )}

      {serverError && <div className={styles.errorBanner}>{serverError}</div>}
      {successMessage && <div className={styles.successBanner}>{successMessage}</div>}

      <div className={styles.formGrid}>
        <div className={styles.fieldGroup}>
          <label htmlFor="account-name">Account Name *</label>
          <input
            id="account-name"
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
          <label htmlFor="account-type">Account Type *</label>
          <select
            id="account-type"
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
          <label htmlFor="account-currency">Currency (ISO Code) *</label>
          <input
            id="account-currency"
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
          <label htmlFor="account-description">Description (Optional)</label>
          <input
            id="account-description"
            type="text"
            className={styles.input}
            placeholder="e.g. Primary salary checking account"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={isPending}
          />
        </div>

        <div className={styles.fieldGroupFull}>
          <label className={styles.checkboxLabel} htmlFor="account-is-active">
            <input
              id="account-is-active"
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
          {isPending ? "Creating..." : "+ Add Account"}
        </button>
      </div>
    </form>
  );
}
