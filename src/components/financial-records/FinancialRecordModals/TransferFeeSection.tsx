"use client";

import { type ChangeEvent } from "react";
import { Account } from "@/lib/schemas/accounts";
import { Category } from "@/lib/schemas/categories";
import { Dropdown } from "@/components/ui/dropdowns/Dropdown";
import modalStyles from "@/components/ui/modals/ModalForm.module.css";
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
      <label className={modalStyles.checkboxLabel}>
        <input
          type="checkbox"
          aria-label="Include transfer fee expense"
          className={modalStyles.checkbox}
          checked={includeFee}
          onChange={(e: ChangeEvent<HTMLInputElement>) =>
            onToggleFee(e.target.checked)
          }
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

          <div className={modalStyles.row}>
            <div className={modalStyles.fieldGroup}>
              <label htmlFor="fee-account" className={modalStyles.label}>
                Fee Account
              </label>
              <Dropdown
                id="fee-account"
                value={feeAccountId}
                placeholder="Select fee account"
                options={activeAccounts.map((acc) => ({
                  value: acc.id,
                  label: `${acc.name} (${acc.currency})`,
                }))}
                onChange={onFeeAccountIdChange}
                disabled={isPending}
              />
            </div>

            <div className={modalStyles.fieldGroup}>
              <label htmlFor="fee-category" className={modalStyles.label}>
                Fee Category
              </label>
              <Dropdown
                id="fee-category"
                value={feeCategoryId}
                placeholder="Select fee category"
                options={activeExpenseCategories.map((cat) => ({
                  value: cat.id,
                  label: cat.name,
                }))}
                onChange={onFeeCategoryIdChange}
                disabled={isPending}
              />
            </div>
          </div>

          <div className={modalStyles.row}>
            <div className={modalStyles.fieldGroup}>
              <label htmlFor="fee-amount" className={modalStyles.label}>
                Fee Amount ({feeCurrency})
              </label>
              <input
                id="fee-amount"
                type="text"
                inputMode="decimal"
                placeholder="0.00"
                className={modalStyles.input}
                value={feeAmount}
                onChange={(e) => onFeeAmountChange(e.target.value)}
                disabled={isPending}
                required
              />
            </div>

            <div className={modalStyles.fieldGroup}>
              <label htmlFor="fee-note" className={modalStyles.label}>
                Fee Note <span className={modalStyles.optional}>(optional)</span>
              </label>
              <input
                id="fee-note"
                type="text"
                placeholder="e.g. Wire transfer fee"
                className={modalStyles.input}
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
