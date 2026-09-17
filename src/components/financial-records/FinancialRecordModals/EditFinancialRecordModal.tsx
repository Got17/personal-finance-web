"use client";

import { useState, useTransition, type SubmitEvent } from "react";
import { Modal } from "@/components/ui/modals/Modal";
import { Account } from "@/lib/schemas/accounts";
import { Category } from "@/lib/schemas/categories";
import { FinancialRecord, FinancialRecordKind } from "@/lib/schemas/financial-records";
import { updateFinancialRecordAction } from "@/app/actions/financial-records";
import { Dropdown } from "@/components/ui/dropdowns/Dropdown";
import { getCategoryIcon } from "../icons";
import styles from "./EditFinancialRecordModal.module.css";

interface EditFinancialRecordModalProps {
  readonly isOpen: boolean;
  readonly record: FinancialRecord | null;
  readonly accounts: Account[];
  readonly categories: Category[];
  readonly onClose: () => void;
  readonly onRecordUpdated: (record: FinancialRecord) => void;
}

export function EditFinancialRecordModal({
  isOpen,
  record,
  accounts,
  categories,
  onClose,
  onRecordUpdated,
}: Readonly<EditFinancialRecordModalProps>) {
  if (!isOpen || !record) return null;

  return (
    <EditFinancialRecordFormModal
      isOpen={isOpen}
      record={record}
      accounts={accounts}
      categories={categories}
      onClose={onClose}
      onRecordUpdated={onRecordUpdated}
    />
  );
}

interface EditFinancialRecordFormModalProps {
  readonly isOpen: boolean;
  readonly record: FinancialRecord;
  readonly accounts: Account[];
  readonly categories: Category[];
  readonly onClose: () => void;
  readonly onRecordUpdated: (record: FinancialRecord) => void;
}

function EditFinancialRecordFormModal({
  isOpen,
  record,
  accounts,
  categories,
  onClose,
  onRecordUpdated,
}: Readonly<EditFinancialRecordFormModalProps>) {
  const [kind, setKind] = useState<FinancialRecordKind>(record.kind);
  const [accountId, setAccountId] = useState(record.account_id);
  const [categoryId, setCategoryId] = useState(record.category_id);
  const [amount, setAmount] = useState((record.amount_minor / 100).toFixed(2));
  const [date, setDate] = useState(record.date.slice(0, 10));
  const [note, setNote] = useState(record.note || "");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  // Active accounts + ensure currently chosen account is visible even if inactive
  const availableAccounts = accounts.filter(
    (acc) => acc.is_active || acc.id === record.account_id,
  );

  // Active categories for the current kind + ensure currently chosen category is visible
  const availableCategories = categories.filter(
    (cat) => (cat.is_active && cat.type === kind) || cat.id === categoryId,
  );

  const handleKindChange = (newKind: FinancialRecordKind) => {
    setKind(newKind);
    const validCategory = categories.find(
      (cat) => cat.is_active && cat.type === newKind,
    );
    setCategoryId(validCategory?.id || "");
  };

  const handleSubmit = (e: SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    const amountMinor = Math.round(Number(amount) * 100);
    const selectedAccount = accounts.find((a) => a.id === accountId);

    if (
      !accountId ||
      !categoryId ||
      !selectedAccount ||
      !Number.isFinite(amountMinor) ||
      amountMinor < 1
    ) {
      setError(
        "Choose an account and matching category, then enter an amount greater than zero.",
      );
      return;
    }

    startTransition(async () => {
      const result = await updateFinancialRecordAction(record.id, {
        kind,
        account_id: accountId,
        category_id: categoryId,
        amount_minor: amountMinor,
        currency: selectedAccount.currency,
        date: new Date(`${date}T12:00:00`).toISOString(),
        note: note.trim() || undefined,
      });

      if (!result.success) {
        setError(result.error || "Failed to update transaction.");
        return;
      }

      onRecordUpdated(result.record);
      onClose();
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Edit Transaction"
      description="Update transaction details, category, account, or amount."
      testId="edit-financial-record-modal"
    >
      <form
        key={`${record.id}-${isOpen}`}
        onSubmit={handleSubmit}
        className={styles.form}
        noValidate
      >
        {error && (
          <div role="alert" className={styles.errorBanner}>
            {error}
          </div>
        )}

        <div className={styles.fieldGroup}>
          <label htmlFor="edit-record-type" className={styles.label}>
            Type
          </label>
          <Dropdown
            id="edit-record-type"
            value={kind}
            options={[
              { value: "expense", label: "Expense" },
              { value: "income", label: "Income" },
            ]}
            onChange={(val) => handleKindChange(val as FinancialRecordKind)}
            disabled={isPending}
          />
        </div>

        <div className={styles.row}>
          <div className={styles.fieldGroup}>
            <label htmlFor="edit-record-account" className={styles.label}>
              Account
            </label>
            <Dropdown
              id="edit-record-account"
              value={accountId}
              placeholder="Select account"
              options={availableAccounts.map((acc) => ({
                value: acc.id,
                label: `${acc.name} (${acc.currency})`,
              }))}
              onChange={setAccountId}
              disabled={isPending}
              required
            />
          </div>

          <div className={styles.fieldGroup}>
            <label htmlFor="edit-record-category" className={styles.label}>
              Category
            </label>
            <Dropdown
              id="edit-record-category"
              value={categoryId}
              placeholder={`Select ${kind} category`}
              options={availableCategories.map((cat) => ({
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
            <label htmlFor="edit-record-amount" className={styles.label}>
              Amount
            </label>
            <input
              id="edit-record-amount"
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
            <label htmlFor="edit-record-date" className={styles.label}>
              Date
            </label>
            <input
              id="edit-record-date"
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
          <label htmlFor="edit-record-note" className={styles.label}>
            Description / Note <span className={styles.optional}>(optional)</span>
          </label>
          <input
            id="edit-record-note"
            type="text"
            placeholder="What was this for?"
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
            className={styles.submitButton}
            disabled={isPending}
          >
            {isPending ? "Saving…" : "Save Changes"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
