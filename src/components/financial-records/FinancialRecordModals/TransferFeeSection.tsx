"use client";

import { type ChangeEvent } from "react";
import { Account } from "@/lib/schemas/accounts";
import { Category } from "@/lib/schemas/categories";
import styles from "./CreateTransferModal.module.css";

interface TransferFeeSectionProps {
  readonly includeFee: boolean;
  readonly onToggleFee: (include: boolean) => void;
  readonly feeAccountId: string;
  readonly onFeeAccountIdChange: (id: string) => void;
  readonly feeCategoryId: string;
  readonly onFeeCategoryIdChange: (id: string) => void;
  readonly feeAmount: string;
  readonly onFeeAmountChange: (amount: string) => void;
  readonly feeNote: string;
  readonly onFeeNoteChange: (note: string) => void;
  readonly activeAccounts: Account[];
  readonly activeExpenseCategories: Category[];
  readonly feeCurrency: string;
  readonly isPending: boolean;
}

export function TransferFeeSection({
  includeFee,
  onToggleFee,
  feeAccountId,
  onFeeAccountIdChange,
  feeCategoryId,
  onFeeCategoryIdChange,
  feeAmount,
  onFeeAmountChange,
  feeNote,
  onFeeNoteChange,
  activeAccounts,
  activeExpenseCategories,
  feeCurrency,
  isPending,
}: Readonly<TransferFeeSectionProps>) {
  return (
    <div className={styles.feeSection}>
      <label className={styles.checkboxContainer}>
        <input
          type="checkbox"
          aria-label="Include transfer fee expense"
          className={styles.checkbox}
          checked={includeFee}
          onChange={(e: ChangeEvent<HTMLInputElement>) => onToggleFee(e.target.checked)}
          disabled={isPending}
        />
        <span>Include transfer fee expense</span>
      </label>

      {includeFee && (
        <>
          <div className={styles.feeNotice}>
            Transfer fee is recorded as a separate linked expense and counts toward your spending and
            cash flow totals.
          </div>

          <div className={styles.row}>
            <div className={styles.fieldGroup}>
              <label htmlFor="fee-account" className={styles.label}>
                Fee Account
              </label>
              <select
                id="fee-account"
                className={styles.select}
                value={feeAccountId}
                onChange={(e) => onFeeAccountIdChange(e.target.value)}
                disabled={isPending}
              >
                {activeAccounts.map((acc) => (
                  <option key={acc.id} value={acc.id}>
                    {acc.name} ({acc.currency})
                  </option>
                ))}
              </select>
            </div>

            <div className={styles.fieldGroup}>
              <label htmlFor="fee-category" className={styles.label}>
                Fee Category
              </label>
              <select
                id="fee-category"
                className={styles.select}
                value={feeCategoryId}
                onChange={(e) => onFeeCategoryIdChange(e.target.value)}
                disabled={isPending}
              >
                {activeExpenseCategories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className={styles.row}>
            <div className={styles.fieldGroup}>
              <label htmlFor="fee-amount" className={styles.label}>
                Fee Amount ({feeCurrency})
              </label>
              <input
                id="fee-amount"
                type="text"
                inputMode="decimal"
                placeholder="0.00"
                className={styles.input}
                value={feeAmount}
                onChange={(e) => onFeeAmountChange(e.target.value)}
                disabled={isPending}
                required
              />
            </div>

            <div className={styles.fieldGroup}>
              <label htmlFor="fee-note" className={styles.label}>
                Fee Note <span className={styles.optional}>(optional)</span>
              </label>
              <input
                id="fee-note"
                type="text"
                placeholder="e.g. Wire transfer fee"
                className={styles.input}
                value={feeNote}
                maxLength={1000}
                onChange={(e) => onFeeNoteChange(e.target.value)}
                disabled={isPending}
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
}
