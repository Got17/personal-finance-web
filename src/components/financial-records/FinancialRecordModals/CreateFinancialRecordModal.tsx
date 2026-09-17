"use client";

import { useState, useTransition, type SubmitEvent } from "react";
import { Modal } from "@/components/ui/modals/Modal";
import { Account } from "@/lib/schemas/accounts";
import { Category } from "@/lib/schemas/categories";
import { FinancialRecord, FinancialRecordKind } from "@/lib/schemas/financial-records";
import { createFinancialRecordAction } from "@/app/actions/financial-records";
import { Dropdown } from "@/components/ui/dropdowns/Dropdown";
import { getCategoryIcon } from "../icons";
import styles from "@/components/ui/modals/ModalForm.module.css";

interface CreateFinancialRecordModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultKind?: FinancialRecordKind;
  allowKindSelection?: boolean;
  accounts: Account[];
  categories: Category[];
  onRecordCreated: (record: FinancialRecord) => void;
}

export function CreateFinancialRecordModal({
  isOpen,
  onClose,
  defaultKind = "expense",
  allowKindSelection = false,
  accounts,
  categories,
  onRecordCreated,
}: Readonly<CreateFinancialRecordModalProps>) {
  const [kind, setKind] = useState<FinancialRecordKind>(defaultKind);
  const isExpense = kind === "expense";
  const activeAccounts = accounts.filter((account) => account.is_active);
  const matchingCategories = categories.filter(
    (category) => category.is_active && category.type === kind
  );

  const [accountId, setAccountId] = useState(activeAccounts[0]?.id || "");
  const [categoryId, setCategoryId] = useState(matchingCategories[0]?.id || "");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    const amountMinor = Math.round(Number(amount) * 100);
    const selectedAccount = accounts.find((a) => a.id === accountId);

    if (!accountId || !categoryId || !selectedAccount || !Number.isFinite(amountMinor) || amountMinor < 1) {
      setError("Choose an account and matching category, then enter an amount greater than zero.");
      return;
    }

    startTransition(async () => {
      const result = await createFinancialRecordAction({
        kind,
        account_id: accountId,
        category_id: categoryId,
        amount_minor: amountMinor,
        currency: selectedAccount.currency,
        date: new Date(`${date}T12:00:00`).toISOString(),
        note: note.trim() || undefined,
      });

      if (!result.success) {
        setError(result.error || "Failed to create transaction.");
        return;
      }

      onRecordCreated(result.record);
      onClose();
    });
  };

  const defaultTitle = isExpense ? "Add New Expense" : "Add New Income";
  const title = allowKindSelection ? "Add New Transaction" : defaultTitle;

  const defaultDescription = isExpense
    ? "Record an expense with an account, category, and date."
    : "Record an income stream into your selected account.";
  const description = allowKindSelection
    ? "Record an income or expense transaction with an account and category."
    : defaultDescription;

  const submitLabel = isExpense ? "Add Expense" : "Add Income";
  const submitButtonText = isPending ? "Saving…" : submitLabel;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      description={description}
      testId="create-financial-record-modal"
    >
      <form
        key={`${isOpen}-${defaultKind}`}
        onSubmit={handleSubmit}
        className={styles.form}
        noValidate
      >
        {error && (
          <div role="alert" className={styles.errorBanner}>
            {error}
          </div>
        )}

        {allowKindSelection && (
          <div className={styles.fieldGroup}>
            <label htmlFor="record-type" className={styles.label}>
              Type
            </label>
            <Dropdown
              id="record-type"
              value={kind}
              options={[
                { value: "expense", label: "Expense" },
                { value: "income", label: "Income" },
              ]}
              onChange={(val) => {
                setKind(val as FinancialRecordKind);
                setCategoryId("");
              }}
              disabled={isPending}
            />
          </div>
        )}

        <div className={styles.row}>
          <div className={styles.fieldGroup}>
            <label htmlFor="record-account" className={styles.label}>
              Account
            </label>
            <Dropdown
              id="record-account"
              value={accountId}
              placeholder="Select account"
              options={activeAccounts.map((acc) => ({
                value: acc.id,
                label: `${acc.name} (${acc.currency})`,
              }))}
              onChange={setAccountId}
              disabled={isPending}
              required
            />
          </div>

          <div className={styles.fieldGroup}>
            <label htmlFor="record-category" className={styles.label}>
              Category
            </label>
            <Dropdown
              id="record-category"
              value={categoryId}
              placeholder={`Select ${kind} category`}
              options={matchingCategories.map((cat) => ({
                value: cat.id,
                label: cat.name,
                icon: getCategoryIcon(cat.name),
              }))}
              onChange={setCategoryId}
              disabled={isPending}
              required
            />
          </div>
        </div>

        <div className={styles.row}>
          <div className={styles.fieldGroup}>
            <label htmlFor="record-amount" className={styles.label}>
              Amount
            </label>
            <input
              id="record-amount"
              type="text"
              inputMode="decimal"
              placeholder="0.00"
              className={styles.input}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              disabled={isPending}
              required
            />
          </div>

          <div className={styles.fieldGroup}>
            <label htmlFor="record-date" className={styles.label}>
              Date
            </label>
            <input
              id="record-date"
              type="date"
              className={styles.input}
              value={date}
              onChange={(e) => setDate(e.target.value)}
              disabled={isPending}
              required
            />
          </div>
        </div>

        <div className={styles.fieldGroup}>
          <label htmlFor="record-note" className={styles.label}>
            Description / Note <span className={styles.optional}>(optional)</span>
          </label>
          <input
            id="record-note"
            type="text"
            placeholder="What was this for? (e.g. beer, fuel, lunch)"
            className={styles.input}
            value={note}
            maxLength={1000}
            onChange={(e) => setNote(e.target.value)}
            disabled={isPending}
          />
        </div>

        <div className={styles.actions}>
          <button
            type="button"
            className={styles.cancelButton}
            onClick={onClose}
            disabled={isPending}
          >
            Cancel
          </button>
          <button
            type="submit"
            className={isExpense ? styles.submitButtonExpense : styles.submitButtonIncome}
            disabled={isPending}
          >
            {submitButtonText}
          </button>
        </div>
      </form>
    </Modal>
  );
}
