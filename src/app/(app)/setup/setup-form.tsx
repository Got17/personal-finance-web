"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { updateBaseCurrencyAction } from "@/app/actions/preferences";
import { SUPPORTED_CURRENCIES } from "@/lib/constants/currencies";
import styles from "./page.module.css";

export interface SetupFormProps {
  initialCurrency?: string;
}

export function SetupForm({ initialCurrency = "USD" }: SetupFormProps) {
  const router = useRouter();
  const normalizedInitial = (initialCurrency || "USD").trim().toUpperCase();
  const [selectedCurrency, setSelectedCurrency] = useState(normalizedInitial);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const availableCurrencies = [...SUPPORTED_CURRENCIES];
  if (normalizedInitial && !availableCurrencies.some((c) => c.code === normalizedInitial)) {
    availableCurrencies.unshift({
      code: normalizedInitial,
      name: `${normalizedInitial} — ${normalizedInitial}`,
    });
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      const result = await updateBaseCurrencyAction(selectedCurrency);

      if (!result.success) {
        setErrorMessage(result.error || "Failed to save base currency setting.");
        setIsSubmitting(false);
        return;
      }

      router.push("/");
      router.refresh();
    } catch {
      setErrorMessage("An unexpected error occurred while saving base currency.");
      setIsSubmitting(false);
    }
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      {errorMessage && (
        <div className={styles.errorMessage} role="alert">
          {errorMessage}
        </div>
      )}

      <div className={styles.fieldGroup}>
        <label htmlFor="baseCurrency" className={styles.label}>
          Select base currency
        </label>
        <select
          id="baseCurrency"
          name="baseCurrency"
          value={selectedCurrency}
          onChange={(e) => setSelectedCurrency(e.target.value)}
          className={styles.select}
          disabled={isSubmitting}
        >
          {availableCurrencies.map((currency) => (
            <option key={currency.code} value={currency.code}>
              {currency.name}
            </option>
          ))}
        </select>
      </div>

      <button
        type="submit"
        className={styles.submitButton}
        disabled={isSubmitting}
      >
        {isSubmitting ? "Saving base currency..." : "Complete setup"}
      </button>
    </form>
  );
}
