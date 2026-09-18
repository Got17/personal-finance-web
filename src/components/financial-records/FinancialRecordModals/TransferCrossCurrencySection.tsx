"use client";

import { type ChangeEvent } from "react";
import modalStyles from "@/components/ui/modals/ModalForm.module.css";
import transferStyles from "./CreateTransferModal.module.css";

interface TransferCrossCurrencySectionProps {
  readonly sourceCurrency: string;
  readonly destCurrency: string;
  readonly amount: string;
  readonly destAmount: string;
  readonly rate: number;
  readonly rateSource: "provider" | "manual_override";
  readonly isManualOverride: boolean;
  readonly isPending: boolean;
  readonly onSourceAmountChange: (val: string) => void;
  readonly onDestAmountChange: (val: string) => void;
  readonly onRateChange: (val: string) => void;
  readonly onToggleManualOverride: (override: boolean) => void;
}

export function TransferCrossCurrencySection({
  sourceCurrency,
  destCurrency,
  amount,
  destAmount,
  rate,
  rateSource,
  isManualOverride,
  isPending,
  onSourceAmountChange,
  onDestAmountChange,
  onRateChange,
  onToggleManualOverride,
}: Readonly<TransferCrossCurrencySectionProps>) {
  return (
    <>
      <div className={modalStyles.row}>
        <div className={modalStyles.fieldGroup}>
          <label htmlFor="transfer-source-amount" className={modalStyles.label}>
            Source Amount ({sourceCurrency})
          </label>
          <input
            id="transfer-source-amount"
            type="text"
            inputMode="decimal"
            placeholder="0.00"
            className={modalStyles.input}
            value={amount}
            onChange={(e) => onSourceAmountChange(e.target.value)}
            disabled={isPending}
            required
          />
        </div>

        <div className={modalStyles.fieldGroup}>
          <label htmlFor="transfer-dest-amount" className={modalStyles.label}>
            Destination Amount ({destCurrency})
          </label>
          <input
            id="transfer-dest-amount"
            type="text"
            inputMode="decimal"
            placeholder="0.00"
            className={modalStyles.input}
            value={destAmount}
            onChange={(e) => onDestAmountChange(e.target.value)}
            disabled={isPending}
            required
          />
        </div>
      </div>

      <div className={transferStyles.rateCard}>
        <div className={transferStyles.rateHeader}>
          <span>
            Rate: 1 {sourceCurrency} ={" "}
            <span className={transferStyles.rateValue}>{rate}</span> {destCurrency}
          </span>
          <span className={transferStyles.rateProvenance}>
            {rateSource === "manual_override" ? "Manual Override" : "Market Quote"}
          </span>
        </div>

        <label className={modalStyles.checkboxLabel}>
          <input
            type="checkbox"
            aria-label="Override exchange rate manually"
            className={modalStyles.checkbox}
            checked={isManualOverride}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              onToggleManualOverride(e.target.checked)
            }
            disabled={isPending}
          />
          <span>Override exchange rate manually</span>
        </label>

        {isManualOverride && (
          <div className={modalStyles.fieldGroup}>
            <label htmlFor="transfer-rate-override" className={modalStyles.label}>
              Rate Override
            </label>
            <input
              id="transfer-rate-override"
              type="number"
              step="any"
              aria-label="Rate Override"
              className={modalStyles.input}
              value={rate}
              onChange={(e) => onRateChange(e.target.value)}
              disabled={isPending}
            />
          </div>
        )}
      </div>
    </>
  );
}
