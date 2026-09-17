"use client";

import { useEffect, useState } from "react";
import { getCurrenciesAction } from "@/app/actions/currencies";
import { DropdownOption } from "@/components/ui/dropdowns/Dropdown";

export interface UseCurrencyOptionsResult {
  options: DropdownOption[];
  isLoading: boolean;
  error: string | null;
}

function formatCurrencyLabel(code: string, name: string, symbol: string): string {
  return `${code} — ${name} (${symbol})`;
}

/**
 * Loads the API's supported currency list for a form dropdown. `currentCode` (the
 * form's default/existing currency) is only read at mount time: it seeds a fallback
 * single-option list on fetch failure, and is preserved via a synthetic option if the
 * fetched list doesn't contain it, so an existing account's currency is never silently
 * swapped out from under it.
 */
export function useCurrencyOptions(currentCode: string): UseCurrencyOptionsResult {
  const [options, setOptions] = useState<DropdownOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    getCurrenciesAction().then((result) => {
      if (cancelled) return;

      if (!result.success || !result.currencies) {
        setError(result.error || "Unable to load currencies.");
        setOptions(currentCode ? [{ value: currentCode, label: currentCode }] : []);
        setIsLoading(false);
        return;
      }

      const fetchedOptions = result.currencies.map((currency) => ({
        value: currency.code,
        label: formatCurrencyLabel(currency.code, currency.name, currency.symbol),
      }));

      if (currentCode && !fetchedOptions.some((option) => option.value === currentCode)) {
        fetchedOptions.unshift({ value: currentCode, label: currentCode });
      }

      setOptions(fetchedOptions);
      setIsLoading(false);
    });

    return () => {
      cancelled = true;
    };
    // currentCode is only used to seed the initial/fallback option and is intentionally
    // not tracked for re-fetching as the user changes their selection.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { options, isLoading, error };
}
