const CURRENCY_DECIMALS: Record<string, number> = {
  LAK: 0,
  THB: 2,
  USD: 2,
  CNY: 2,
  EUR: 2,
};

/**
 * Returns the minor-unit decimal digits for a currency code.
 * Defaults to 2 for unspecified currencies.
 */
export function getCurrencyDecimals(code: string): number {
  if (!code) return 2;
  const normalized = code.trim().toUpperCase();
  return CURRENCY_DECIMALS[normalized] ?? 2;
}

/**
 * Converts a major currency value (e.g. 10.50 USD) to integer minor units (e.g. 1050).
 */
export function toMinorUnits(amount: number, currency: string): number {
  const decimals = getCurrencyDecimals(currency);
  const factor = Math.pow(10, decimals);
  return Math.round(amount * factor);
}

/**
 * Converts an integer minor unit value (e.g. 1050 USD) to a major currency value (e.g. 10.50).
 */
export function fromMinorUnits(minorUnits: number, currency: string): number {
  const decimals = getCurrencyDecimals(currency);
  const factor = Math.pow(10, decimals);
  return minorUnits / factor;
}

/**
 * Converts a source minor-unit amount to destination minor units given an exchange rate.
 * Uses exact decimal-power scaling aligned with the backend math/Pow10 calculation.
 */
export function convertCurrencyAmount(
  fromCurrency: string,
  toCurrency: string,
  sourceMinor: number,
  rate: number,
): number {
  if (rate <= 0) return 0;
  const fromDigits = getCurrencyDecimals(fromCurrency);
  const toDigits = getCurrencyDecimals(toCurrency);
  const powerDiff = toDigits - fromDigits;
  const converted = sourceMinor * rate * Math.pow(10, powerDiff);
  return Math.round(converted);
}

/**
 * Validates that destinationMinor equals expected converted minor units from rate.
 */
export function validateTransferPrecision(
  fromCurrency: string,
  toCurrency: string,
  sourceMinor: number,
  destMinor: number,
  rate: number,
): boolean {
  if (rate <= 0) return false;
  const expected = convertCurrencyAmount(fromCurrency, toCurrency, sourceMinor, rate);
  return destMinor === expected;
}
