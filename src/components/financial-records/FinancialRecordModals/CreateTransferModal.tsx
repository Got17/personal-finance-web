"use client";

import { useEffect, useRef, useState, useTransition, type SubmitEvent } from "react";
import { Modal } from "@/components/ui/modals/Modal";
import { Account } from "@/lib/schemas/accounts";
import { Category } from "@/lib/schemas/categories";
import { FinancialRecord } from "@/lib/schemas/financial-records";
import { createTransferAction, getFXQuoteAction } from "@/app/actions/financial-records";
import {
  convertCurrencyAmount,
  convertCurrencyAmountInverse,
  fromMinorUnits,
  toMinorUnits,
  validateTransferPrecision,
} from "@/lib/currency-utils";
import { TransferFeeSection } from "./TransferFeeSection";
import { TransferCrossCurrencySection } from "./TransferCrossCurrencySection";
import { Dropdown } from "@/components/ui/dropdowns/Dropdown";
import styles from "@/components/ui/modals/ModalForm.module.css";

interface CreateTransferModalProps {
  readonly isOpen: boolean;
  readonly accounts: Account[];
  readonly categories?: Category[];
  readonly initialSourceAccountId?: string;
  readonly onClose: () => void;
  readonly onTransferCreated: (record: FinancialRecord, feeRecord?: FinancialRecord) => void;
}

export function CreateTransferModal(props: Readonly<CreateTransferModalProps>) {
  if (!props.isOpen) return null;

  return (
    <CreateTransferFormModal
      key={`${props.initialSourceAccountId || ""}-${props.isOpen}`}
      {...props}
    />
  );
}

function CreateTransferFormModal({
  isOpen,
  accounts,
  categories = [],
  initialSourceAccountId,
  onClose,
  onTransferCreated,
}: Readonly<CreateTransferModalProps>) {
  const activeAccounts = accounts.filter((a) => a.is_active);
  const activeExpenseCategories = categories.filter((c) => c.is_active && c.type === "expense");

  const initialSrcId =
    initialSourceAccountId && activeAccounts.some((a) => a.id === initialSourceAccountId)
      ? initialSourceAccountId
      : activeAccounts[0]?.id || "";

  const initialDestId =
    activeAccounts.find((a) => a.id !== initialSrcId)?.id || initialSrcId;

  const [sourceAccountId, setSourceAccountId] = useState(initialSrcId);
  const [destAccountId, setDestAccountId] = useState(initialDestId);

  const [amount, setAmount] = useState("");
  const [destAmount, setDestAmount] = useState("");
  const [lastEditedField, setLastEditedField] = useState<"source" | "dest">("source");
  const [rate, setRate] = useState<number>(1);
  const [rateSource, setRateSource] = useState<"provider" | "manual_override">("provider");
  const [isManualOverride, setIsManualOverride] = useState(false);

  const amountsRef = useRef({ amount, destAmount, lastEditedField });
  useEffect(() => {
    amountsRef.current = { amount, destAmount, lastEditedField };
  });

  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [note, setNote] = useState("");

  // Fee state
  const [includeFee, setIncludeFee] = useState(false);
  const [feeAccountId, setFeeAccountId] = useState(activeAccounts[0]?.id || "");
  const [feeCategoryId, setFeeCategoryId] = useState(activeExpenseCategories[0]?.id || "");
  const [feeAmount, setFeeAmount] = useState("");
  const [feeNote, setFeeNote] = useState("");

  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const sourceAccount = activeAccounts.find((a) => a.id === sourceAccountId);
  const destAccount = activeAccounts.find((a) => a.id === destAccountId);
  const feeAccount = activeAccounts.find((a) => a.id === feeAccountId) || sourceAccount;

  const sourceCurrency = sourceAccount?.currency || "USD";
  const destCurrency = destAccount?.currency || "USD";
  const isCrossCurrency = sourceCurrency !== destCurrency;

  useEffect(() => {
    if (!isOpen || !isCrossCurrency || isManualOverride) return;

    let isMounted = true;
    getFXQuoteAction(sourceCurrency, destCurrency, new Date(`${date}T12:00:00Z`).toISOString())
      .then((res) => {
        if (!isMounted) return;
        if (res.success && res.rate > 0) {
          setRate(res.rate);
          setRateSource("provider");
          const { amount: currentSrc, destAmount: currentDest, lastEditedField: currentLast } = amountsRef.current;
          if (currentLast === "dest" && currentDest) {
            const numDest = Number(currentDest);
            if (Number.isFinite(numDest) && numDest > 0) {
              const destMinor = toMinorUnits(numDest, destCurrency);
              const srcMinor = convertCurrencyAmountInverse(sourceCurrency, destCurrency, destMinor, res.rate);
              setAmount(fromMinorUnits(srcMinor, sourceCurrency).toString());
            }
          } else if (currentSrc) {
            const numSrc = Number(currentSrc);
            if (Number.isFinite(numSrc) && numSrc > 0) {
              const srcMinor = toMinorUnits(numSrc, sourceCurrency);
              const convertedMinor = convertCurrencyAmount(sourceCurrency, destCurrency, srcMinor, res.rate);
              setDestAmount(fromMinorUnits(convertedMinor, destCurrency).toString());
            }
          }
        }
      })
      .catch(() => {});

    return () => {
      isMounted = false;
    };
  }, [isOpen, isCrossCurrency, sourceCurrency, destCurrency, date, isManualOverride]);

  const handleSourceAmountChange = (val: string) => {
    setAmount(val);
    setLastEditedField("source");
    if (!isCrossCurrency) {
      setDestAmount(val);
      return;
    }
    if (!val.trim()) {
      setDestAmount("");
      return;
    }
    const num = Number(val);
    if (Number.isFinite(num) && num > 0 && rate > 0) {
      const srcMinor = toMinorUnits(num, sourceCurrency);
      const convertedMinor = convertCurrencyAmount(sourceCurrency, destCurrency, srcMinor, rate);
      setDestAmount(fromMinorUnits(convertedMinor, destCurrency).toString());
    }
  };

  const handleDestAmountChange = (val: string) => {
    setDestAmount(val);
    setLastEditedField("dest");
    if (!isCrossCurrency) {
      setAmount(val);
      return;
    }
    if (!val.trim()) {
      setAmount("");
      return;
    }
    const num = Number(val);
    if (Number.isFinite(num) && num > 0 && rate > 0) {
      const destMinor = toMinorUnits(num, destCurrency);
      const srcMinor = convertCurrencyAmountInverse(sourceCurrency, destCurrency, destMinor, rate);
      setAmount(fromMinorUnits(srcMinor, sourceCurrency).toString());
    }
  };

  const handleDestBlur = () => {
    if (!isCrossCurrency || !amount || rate <= 0) return;
    const numSrc = Number(amount);
    if (Number.isFinite(numSrc) && numSrc > 0) {
      const srcMinor = toMinorUnits(numSrc, sourceCurrency);
      const forwardDestMinor = convertCurrencyAmount(sourceCurrency, destCurrency, srcMinor, rate);
      setDestAmount(fromMinorUnits(forwardDestMinor, destCurrency).toString());
    }
  };

  const handleRateChange = (val: string) => {
    const numRate = Number(val);
    setRate(numRate);
    if (!Number.isFinite(numRate) || numRate <= 0) return;

    if (lastEditedField === "dest" && destAmount) {
      const numDest = Number(destAmount);
      if (Number.isFinite(numDest) && numDest > 0) {
        const destMinor = toMinorUnits(numDest, destCurrency);
        const srcMinor = convertCurrencyAmountInverse(sourceCurrency, destCurrency, destMinor, numRate);
        setAmount(fromMinorUnits(srcMinor, sourceCurrency).toString());
      }
    } else if (amount) {
      const numSrc = Number(amount);
      if (Number.isFinite(numSrc) && numSrc > 0) {
        const srcMinor = toMinorUnits(numSrc, sourceCurrency);
        const convertedMinor = convertCurrencyAmount(sourceCurrency, destCurrency, srcMinor, numRate);
        setDestAmount(fromMinorUnits(convertedMinor, destCurrency).toString());
      }
    }
  };

  const validateInputs = (sourceMinor: number, destinationMinor: number): string | null => {
    if (sourceAccountId === destAccountId) {
      return "Source and destination accounts must be distinct.";
    }
    if (!Number.isFinite(sourceMinor) || sourceMinor <= 0) {
      return "Source amount must be greater than zero.";
    }
    if (!Number.isFinite(destinationMinor) || destinationMinor <= 0) {
      return "Destination amount must be greater than zero.";
    }
    if (isCrossCurrency) {
      if (rate <= 0) return "Exchange rate must be greater than zero.";
      if (!validateTransferPrecision(sourceCurrency, destCurrency, sourceMinor, destinationMinor, rate)) {
        return "Destination amount does not match rate conversion precision.";
      }
    }
    return null;
  };

  const handleSubmit = (e: SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    const sourceMinor = toMinorUnits(Number(amount), sourceCurrency);
    let destinationMinor = isCrossCurrency
      ? toMinorUnits(Number(destAmount), destCurrency)
      : sourceMinor;

    if (isCrossCurrency && rate > 0 && Number.isFinite(sourceMinor) && sourceMinor > 0) {
      const expectedMinor = convertCurrencyAmount(sourceCurrency, destCurrency, sourceMinor, rate);
      if (destinationMinor !== expectedMinor) {
        destinationMinor = expectedMinor;
        setDestAmount(fromMinorUnits(expectedMinor, destCurrency).toString());
      }
    }

    const validationMsg = validateInputs(sourceMinor, destinationMinor);
    if (validationMsg) {
      setError(validationMsg);
      return;
    }

    let feePayload: import("@/lib/schemas/transfers").TransferFeeInput | undefined;
    if (includeFee) {
      const feeMinor = toMinorUnits(Number(feeAmount), feeAccount?.currency || sourceCurrency);
      if (!Number.isFinite(feeMinor) || feeMinor <= 0) {
        setError("Fee amount must be greater than zero.");
        return;
      }
      feePayload = {
        account_id: feeAccountId,
        category_id: feeCategoryId,
        amount_minor: feeMinor,
        currency: feeAccount?.currency || sourceCurrency,
        note: feeNote.trim() || undefined,
      };
    }

    startTransition(async () => {
      const result = await createTransferAction({
        account_id: sourceAccountId,
        destination_account_id: destAccountId,
        amount_minor: sourceMinor,
        destination_amount_minor: destinationMinor,
        currency: sourceCurrency,
        destination_currency: destCurrency,
        date: new Date(`${date}T12:00:00Z`).toISOString(),
        note: note.trim() || undefined,
        fx_quote: isCrossCurrency ? { rate, provenance: rateSource } : undefined,
        fee: feePayload,
      });

      if (!result.success) {
        setError(result.error || "Failed to create transfer.");
        return;
      }

      onTransferCreated(result.record, result.feeRecord);
      onClose();
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Transfer Funds"
      description="Move money between your accounts with balance updates."
      testId="create-transfer-modal"
    >
      <form onSubmit={handleSubmit} className={styles.form} noValidate>
        {error && (
          <div role="alert" className={styles.errorBanner}>
            {error}
          </div>
        )}

        <div className={styles.row}>
          <div className={styles.fieldGroup}>
            <label htmlFor="transfer-source-account" className={styles.label}>
              Source Account
            </label>
            <Dropdown
              id="transfer-source-account"
              value={sourceAccountId}
              placeholder="Select source account"
              options={activeAccounts.map((acc) => ({
                value: acc.id,
                label: `${acc.name} (${acc.currency})`,
              }))}
              onChange={(val) => {
                setSourceAccountId(val);
                if (val === destAccountId) {
                  const nextDest = activeAccounts.find((a) => a.id !== val)?.id || val;
                  setDestAccountId(nextDest);
                }
              }}
              disabled={isPending}
              required
            />
          </div>

          <div className={styles.fieldGroup}>
            <label htmlFor="transfer-dest-account" className={styles.label}>
              Destination Account
            </label>
            <Dropdown
              id="transfer-dest-account"
              value={destAccountId}
              placeholder="Select destination account"
              options={activeAccounts.map((acc) => ({
                value: acc.id,
                label: `${acc.name} (${acc.currency})`,
              }))}
              onChange={setDestAccountId}
              disabled={isPending}
              required
            />
          </div>
        </div>

        {isCrossCurrency ? (
          <TransferCrossCurrencySection
            sourceCurrency={sourceCurrency}
            destCurrency={destCurrency}
            amount={amount}
            destAmount={destAmount}
            rate={rate}
            rateSource={rateSource}
            isManualOverride={isManualOverride}
            isPending={isPending}
            onSourceAmountChange={handleSourceAmountChange}
            onDestAmountChange={handleDestAmountChange}
            onDestBlur={handleDestBlur}
            onRateChange={handleRateChange}
            onToggleManualOverride={(override) => {
              setIsManualOverride(override);
              setRateSource(override ? "manual_override" : "provider");
            }}
          />
        ) : (
          <div className={styles.fieldGroup}>
            <label htmlFor="transfer-amount" className={styles.label}>
              Amount ({sourceCurrency})
            </label>
            <input
              id="transfer-amount"
              type="text"
              inputMode="decimal"
              placeholder="0.00"
              className={styles.input}
              value={amount}
              onChange={(e) => handleSourceAmountChange(e.target.value)}
              disabled={isPending}
              required
            />
          </div>
        )}

        <div className={styles.row}>
          <div className={styles.fieldGroup}>
            <label htmlFor="transfer-date" className={styles.label}>
              Date
            </label>
            <input
              id="transfer-date"
              type="date"
              className={styles.input}
              value={date}
              onChange={(e) => setDate(e.target.value)}
              disabled={isPending}
              required
            />
          </div>

          <div className={styles.fieldGroup}>
            <label htmlFor="transfer-note" className={styles.label}>
              Note <span className={styles.optional}>(optional)</span>
            </label>
            <input
              id="transfer-note"
              type="text"
              placeholder="Reason for transfer..."
              className={styles.input}
              value={note}
              maxLength={1000}
              onChange={(e) => setNote(e.target.value)}
              disabled={isPending}
            />
          </div>
        </div>

        <TransferFeeSection
          includeFee={includeFee}
          onToggleFee={setIncludeFee}
          feeAccountId={feeAccountId}
          onFeeAccountIdChange={setFeeAccountId}
          feeCategoryId={feeCategoryId}
          onFeeCategoryIdChange={setFeeCategoryId}
          feeAmount={feeAmount}
          onFeeAmountChange={setFeeAmount}
          feeNote={feeNote}
          onFeeNoteChange={setFeeNote}
          activeAccounts={activeAccounts}
          activeExpenseCategories={activeExpenseCategories}
          feeCurrency={feeAccount?.currency || sourceCurrency}
          isPending={isPending}
        />

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
            className={styles.submitButtonIncome}
            disabled={isPending}
          >
            {isPending ? "Transferring…" : "Transfer Funds"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
