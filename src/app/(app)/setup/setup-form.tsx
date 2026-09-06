"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import styles from "./page.module.css";

const currencies = [
  { code: "USD", name: "USD — US Dollar ($)" },
  { code: "EUR", name: "EUR — Euro (€)" },
  { code: "GBP", name: "GBP — British Pound (£)" },
  { code: "CAD", name: "CAD — Canadian Dollar ($)" },
  { code: "AUD", name: "AUD — Australian Dollar ($)" },
  { code: "SGD", name: "SGD — Singapore Dollar ($)" },
  { code: "JPY", name: "JPY — Japanese Yen (¥)" },
];

export function SetupForm() {
  const router = useRouter();
  const [selectedCurrency, setSelectedCurrency] = useState("USD");

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    router.push("/");
    router.refresh();
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
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
        >
          {currencies.map((currency) => (
            <option key={currency.code} value={currency.code}>
              {currency.name}
            </option>
          ))}
        </select>
      </div>

      <button type="submit" className={styles.submitButton}>
        Complete setup
      </button>
    </form>
  );
}
