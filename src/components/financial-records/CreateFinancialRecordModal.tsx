"use client";

import { useState, useTransition, FormEvent } from "react";
import { Modal } from "@/components/ui/Modal";
import { Account } from "@/lib/schemas/accounts";
import { Category } from "@/lib/schemas/categories";
import { FinancialRecord, FinancialRecordKind } from "@/lib/schemas/financial-records";
import { createFinancialRecordAction } from "@/app/actions/financial-records";
import styles from "./CreateFinancialRecordModal.module.css";

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
}: CreateFinancialRecordModalProps) {
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

  const handleSubmit = (e: FormEvent) => {
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

  const title = allowKindSelection
    ? "Add New Transaction"
    : isExpense
    ? "Add New Expense"
    : "Add New Income";

  const description = allowKindSelection
    ? "Record an income or expense transaction with an account and category."
    : isExpense
    ? "Record an expense with an account, category, and date."
    : "Record an income stream into your selected account.";

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
            <select
              id="record-type"
              className={styles.select}
              value={kind}
              onChange={(e) => {
                setKind(e.target.value as FinancialRecordKind);
                setCategoryId("");
              }}
              disabled={isPending}
            >
              <option value="expense">Expense</option>
              <option value="income">Income</option>
            </select>
          </div>
        )}

        <div className={styles.row}>
          <div className={styles.fieldGroup}>
            <label htmlFor="record-account" className={styles.label}>
              Account
            </label>
            <select
              id="record-account"
              className={styles.select}
              value={accountId}
              onChange={(e) => setAccountId(e.target.value)}
              disabled={isPending}
              required
            >
              <option value="">Select account</option>
              {activeAccounts.map((acc) => (
                <option key={acc.id} value={acc.id}>
                  {acc.name} ({acc.currency})
                </option>
              ))}
            </select>
          </div>

          <div className={styles.fieldGroup}>
            <label htmlFor="record-category" className={styles.label}>
              Category
            </label>
            <select
              id="record-category"
              className={styles.select}
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              disabled={isPending}
              required
            >
              <option value="">Select {kind} category</option>
              {matchingCategories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
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
            {isPending ? "Saving…" : isExpense ? "Add Expense" : "Add Income"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
