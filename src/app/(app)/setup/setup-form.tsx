"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { updateBaseCurrencyAction } from "@/app/actions/preferences";
import styles from "./page.module.css";

const currencies = [
  { code: "USD", name: "USD — US Dollar ($)" },
  { code: "EUR", name: "EUR — Euro (€)" },
  { code: "GBP", name: "GBP — British Pound (£)" },
  { code: "CAD", name: "CAD — Canadian Dollar ($)" },
  { code: "AUD", name: "AUD — Australian Dollar ($)" },
  { code: "SGD", name: "SGD — Singapore Dollar ($)" },
  { code: "JPY", name: "JPY — Japanese Yen (¥)" },
  { code: "CHF", name: "CHF — Swiss Franc (CHF)" },
  { code: "NZD", name: "NZD — New Zealand Dollar ($)" },
];

export interface SetupFormProps {
  initialCurrency?: string;
}

export function SetupForm({ initialCurrency = "USD" }: SetupFormProps) {
  const router = useRouter();
  const [selectedCurrency, setSelectedCurrency] = useState(initialCurrency);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

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
          {currencies.map((currency) => (
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
