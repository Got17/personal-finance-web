import { describe, it, expect } from "vitest";
import {
  getCurrencyDecimals,
  convertCurrencyAmount,
  validateTransferPrecision,
  toMinorUnits,
  fromMinorUnits,
} from "./currency-utils";

describe("currency-utils", () => {
  describe("getCurrencyDecimals", () => {
    it("returns 0 for LAK", () => {
      expect(getCurrencyDecimals("LAK")).toBe(0);
      expect(getCurrencyDecimals("lak")).toBe(0);
    });

    it("returns 2 for USD, EUR, THB, CNY", () => {
      expect(getCurrencyDecimals("USD")).toBe(2);
      expect(getCurrencyDecimals("EUR")).toBe(2);
      expect(getCurrencyDecimals("THB")).toBe(2);
      expect(getCurrencyDecimals("CNY")).toBe(2);
    });

    it("defaults to 2 for other currencies", () => {
      expect(getCurrencyDecimals("GBP")).toBe(2);
      expect(getCurrencyDecimals("")).toBe(2);
    });
  });

  describe("toMinorUnits & fromMinorUnits", () => {
    it("converts major to minor units respecting decimal digits", () => {
      expect(toMinorUnits(10.5, "USD")).toBe(1050);
      expect(toMinorUnits(10.55, "EUR")).toBe(1055);
      expect(toMinorUnits(50000, "LAK")).toBe(50000);
      expect(toMinorUnits(100.25, "THB")).toBe(10025);
    });

    it("converts minor to major units respecting decimal digits", () => {
      expect(fromMinorUnits(1050, "USD")).toBe(10.5);
      expect(fromMinorUnits(50000, "LAK")).toBe(50000);
      expect(fromMinorUnits(10025, "THB")).toBe(100.25);
    });
  });

  describe("convertCurrencyAmount", () => {
    it("converts same currency with rate 1", () => {
      // 10.00 USD -> 10.00 USD (1000 minor -> 1000 minor)
      const converted = convertCurrencyAmount("USD", "USD", 1000, 1.0);
      expect(converted).toBe(1000);
    });

    it("converts USD (2 decimals) to EUR (2 decimals) at 0.92", () => {
      // 100.00 USD (10000 minor) * 0.92 = 92.00 EUR (9200 minor)
      const converted = convertCurrencyAmount("USD", "EUR", 10000, 0.92);
      expect(converted).toBe(9200);
    });

    it("converts USD (2 decimals) to LAK (0 decimals) at 22000", () => {
      // 10.00 USD (1000 minor units = $10.00). Rate 22000.
      // Expected major: 10.00 * 22000 = 220,000 LAK.
      // LAK has 0 decimals, so minor units = 220,000.
      // powerDiff = toDigits (0) - fromDigits (2) = -2.
      // 1000 * 22000 * 10^-2 = 220,000.
      const converted = convertCurrencyAmount("USD", "LAK", 1000, 22000);
      expect(converted).toBe(220000);
    });

    it("converts LAK (0 decimals) to USD (2 decimals) at 0.00004545", () => {
      // 220,000 LAK (minor units = 220,000). Rate 0.0000454545...
      // powerDiff = 2 - 0 = 2.
      // 220000 * (1/22000) * 10^2 = 1000 minor units ($10.00)
      const rate = 1 / 22000;
      const converted = convertCurrencyAmount("LAK", "USD", 220000, rate);
      expect(converted).toBe(1000);
    });
  });

  describe("validateTransferPrecision", () => {
    it("returns true when destination minor matches expected converted amount", () => {
      expect(validateTransferPrecision("USD", "EUR", 10000, 9200, 0.92)).toBe(true);
      expect(validateTransferPrecision("USD", "USD", 5000, 5000, 1)).toBe(true);
    });

    it("returns false when destination minor does not match rate precision", () => {
      expect(validateTransferPrecision("USD", "EUR", 10000, 9190, 0.92)).toBe(false);
    });
  });
});
