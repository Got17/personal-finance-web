export interface CurrencyOption {
  code: string;
  name: string;
}

export const SUPPORTED_CURRENCIES: CurrencyOption[] = [
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
