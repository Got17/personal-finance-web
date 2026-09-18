"use client";

import { useState, useTransition, type SubmitEvent } from "react";
import {
  ACCOUNT_TYPES,
  Account,
  AccountType,
  createAccountSchema,
} from "@/lib/schemas/accounts";
import { createAccountAction } from "@/app/actions/accounts";
import { ERROR_MESSAGES } from "@/lib/constants/errors";
import { Dropdown } from "@/components/ui/dropdowns/Dropdown";
import { useCurrencyOptions } from "../hooks/useCurrencyOptions";
import styles from "@/components/ui/modals/ModalForm.module.css";

interface CreateAccountFormProps {
  readonly defaultCurrency?: string;
  readonly defaultType?: AccountType;
  readonly onAccountCreated?: (account: Account) => void;
  readonly onCancel?: () => void;
  readonly hideHeader?: boolean;
}

const ACCOUNT_TYPE_LABELS: Record<AccountType, string> = {
  checking: "Checking Account",
  savings: "Savings Account",
  investment: "Investment Account",
  cash: "Cash / Wallet",
  other: "Other Account",
};

export function CreateAccountForm({
  defaultCurrency = "LAK",
  defaultType = "checking",
  onAccountCreated,
  onCancel,
  hideHeader = true,
}: Readonly<CreateAccountFormProps>) {
  const [name, setName] = useState("");
  const [type, setType] = useState<AccountType>(defaultType);
  const [currency, setCurrency] = useState(defaultCurrency);
  const [description, setDescription] = useState("");
  const [isActive, setIsActive] = useState(true);

  const {
    options: currencyOptions,
    isLoading: isLoadingCurrencies,
    error: currencyLoadError,
  } = useCurrencyOptions(defaultCurrency);

  const [fieldErrors, setFieldErrors] = useState<{
    name?: string;
    type?: string;
    currency?: string;
  }>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: SubmitEvent<HTMLFormElement>) => {
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
      const result = await createAccountAction(validation.data);

      if (!result.success || !result.account) {
        setServerError(result.error || ERROR_MESSAGES.ACCOUNTS.CREATE_FAILED);
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
    <form className={hideHeader ? styles.form : styles.formCard} onSubmit={handleSubmit} noValidate>
      {!hideHeader && (
        <div className={styles.formHeader}>
          <h3>Add New Account</h3>
          <p>Enter details to track a bank account, card, or asset.</p>
        </div>
      )}

      {serverError && <div className={styles.errorBanner}>{serverError}</div>}
      {successMessage && <div className={styles.successBanner}>{successMessage}</div>}

      <div className={styles.row}>
        <div className={styles.fieldGroup}>
          <label className={styles.label} htmlFor="account-name">
            Account Name <span className={styles.requiredStar}>*</span>
          </label>
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
          <label className={styles.label} htmlFor="account-type">
            Account Type <span className={styles.requiredStar}>*</span>
          </label>
          <Dropdown
            id="account-type"
            value={type}
            options={ACCOUNT_TYPES.map((t) => ({
              value: t,
              label: ACCOUNT_TYPE_LABELS[t],
            }))}
            onChange={(val) => setType(val as AccountType)}
            disabled={isPending}
            hasError={Boolean(fieldErrors.type)}
          />
          {fieldErrors.type && <span className={styles.fieldError}>{fieldErrors.type}</span>}
        </div>
      </div>

      <div className={styles.row}>
        <div className={styles.fieldGroup}>
          <label className={styles.label} htmlFor="account-currency">
            Currency <span className={styles.requiredStar}>*</span>
          </label>
          <Dropdown
            id="account-currency"
            value={currency}
            options={currencyOptions}
            onChange={setCurrency}
            placeholder={isLoadingCurrencies ? "Loading currencies..." : undefined}
            disabled={isPending || isLoadingCurrencies}
            hasError={Boolean(fieldErrors.currency)}
          />
          {fieldErrors.currency && (
            <span className={styles.fieldError}>{fieldErrors.currency}</span>
          )}
          {!fieldErrors.currency && currencyLoadError && (
            <span className={styles.fieldError}>{currencyLoadError}</span>
          )}
        </div>

        <div className={styles.fieldGroup}>
          <label className={styles.label} htmlFor="account-description">Description (Optional)</label>
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
      </div>

      <div className={styles.fieldGroup}>
        <label className={styles.checkboxLabel} htmlFor="account-is-active">
          <input
            id="account-is-active"
            type="checkbox"
            className={styles.checkbox}
            checked={isActive}
            onChange={(e) => setIsActive(e.target.checked)}
            disabled={isPending}
          />
          <span>Active Account</span>
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
          className={styles.submitButtonIncome}
          disabled={isPending}
        >
          {isPending ? "Creating..." : "+ Add Account"}
        </button>
      </div>
    </form>
  );
}
