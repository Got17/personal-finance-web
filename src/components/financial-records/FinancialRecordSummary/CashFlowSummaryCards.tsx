import { useMemo } from "react";
import { Category } from "@/lib/schemas/categories";
import { FinancialRecord } from "@/lib/schemas/financial-records";
import { TransactionTab } from "../FinancialRecordsTable/TransactionSubTabs";
import {
  InflowArrowIcon,
  NetBalanceIcon,
  OutflowArrowIcon,
  TrendingStarIcon,
} from "../summary-icons";
import { GeneralTagIcon } from "../icons";
import styles from "./CashFlowSummaryCards.module.css";

interface CashFlowSummaryCardsProps {
  readonly records: FinancialRecord[];
  readonly categories: Category[];
  readonly activeTab: TransactionTab;
}

interface CurrencyAggregate {
  dominantCurrency: string;
  totalMinor: number;
  extraCurrenciesCount: number;
}

function formatMoney(amountMinor: number, currency: string): string {
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(Math.abs(amountMinor) / 100);
  } catch {
    return `${currency} ${(Math.abs(amountMinor) / 100).toFixed(2)}`;
  }
}

function aggregateByCurrency(records: FinancialRecord[], defaultCurrency = "USD"): CurrencyAggregate {
  if (records.length === 0) {
    return { dominantCurrency: defaultCurrency, totalMinor: 0, extraCurrenciesCount: 0 };
  }

  const currencyMap = new Map<string, number>();
  for (const record of records) {
    const current = currencyMap.get(record.currency) || 0;
    currencyMap.set(record.currency, current + record.amount_minor);
  }

  let dominantCurrency = records[0]?.currency || defaultCurrency;
  let maxAmount = -1;

  for (const [curr, total] of currencyMap.entries()) {
    if (total > maxAmount) {
      maxAmount = total;
      dominantCurrency = curr;
    }
  }

  return {
    dominantCurrency,
    totalMinor: currencyMap.get(dominantCurrency) || 0,
    extraCurrenciesCount: Math.max(0, currencyMap.size - 1),
  };
}

export function CashFlowSummaryCards({
  records,
  categories,
  activeTab,
}: Readonly<CashFlowSummaryCardsProps>) {
  const categoryMap = useMemo(() => {
    const map = new Map<string, string>();
    for (const cat of categories) {
      map.set(cat.id, cat.name);
    }
    return map;
  }, [categories]);

  const incomeRecords = useMemo(
    () => records.filter((r) => r.kind === "income"),
    [records]
  );

  const expenseRecords = useMemo(
    () => records.filter((r) => r.kind === "expense"),
    [records]
  );

  const fallbackCurrency = records[0]?.currency || "USD";
  const inflowAgg = useMemo(
    () => aggregateByCurrency(incomeRecords, fallbackCurrency),
    [incomeRecords, fallbackCurrency]
  );
  const outflowAgg = useMemo(
    () => aggregateByCurrency(expenseRecords, fallbackCurrency),
    [expenseRecords, fallbackCurrency]
  );

  // Top category computation for income/expense tabs
  const topCategoryInfo = useMemo(() => {
    const targetRecords = activeTab === "income" ? incomeRecords : expenseRecords;
    if (targetRecords.length === 0) {
      return { name: "None yet", amountFormatted: "$0.00" };
    }

    const catTotals = new Map<string, { minor: number; currency: string }>();
    for (const r of targetRecords) {
      if (!r.category_id) continue;
      const existing = catTotals.get(r.category_id);
      const newMinor = (existing?.minor || 0) + r.amount_minor;
      catTotals.set(r.category_id, { minor: newMinor, currency: r.currency });
    }

    let topCatId = "";
    let highestMinor = -1;
    let topCurrency = fallbackCurrency;

    for (const [catId, data] of catTotals.entries()) {
      if (data.minor > highestMinor) {
        highestMinor = data.minor;
        topCatId = catId;
        topCurrency = data.currency;
      }
    }

    const catName = categoryMap.get(topCatId) || "Uncategorized";
    return {
      name: catName,
      amountFormatted: formatMoney(highestMinor, topCurrency),
    };
  }, [activeTab, incomeRecords, expenseRecords, categoryMap, fallbackCurrency]);

  if (activeTab === TransactionTab.Income) {
    const incomeFormatted = `+${formatMoney(inflowAgg.totalMinor, inflowAgg.dominantCurrency)}`;
    return (
      <div className={styles.grid} data-testid="summary-cards-income">
        <div className={`${styles.card} ${styles.cardInflow}`}>
          <div className={styles.cardHeader}>
            <span className={styles.label}>Total Received</span>
            <div className={`${styles.iconWrapper} ${styles.inflowIconWrapper}`}>
              <InflowArrowIcon />
            </div>
          </div>
          <div className={styles.valueContainer}>
            <span className={`${styles.value} ${styles.inflowValue}`}>{incomeFormatted}</span>
            <div className={styles.subtextRow}>
              <span>{incomeRecords.length} {incomeRecords.length === 1 ? "stream" : "streams"} in view</span>
              {inflowAgg.extraCurrenciesCount > 0 && (
                <span className={styles.multiCurrencyBadge}>
                  +{inflowAgg.extraCurrenciesCount} other currency
                </span>
              )}
            </div>
          </div>
        </div>

        <div className={`${styles.card} ${styles.cardNeutral}`}>
          <div className={styles.cardHeader}>
            <span className={styles.label}>Income Streams</span>
            <div className={`${styles.iconWrapper} ${styles.neutralIconWrapper}`}>
              <TrendingStarIcon />
            </div>
          </div>
          <div className={styles.valueContainer}>
            <span className={`${styles.value} ${styles.serifValue}`}>{incomeRecords.length}</span>
            <div className={styles.subtextRow}>
              <span>Active inflow records</span>
            </div>
          </div>
        </div>

        <div className={`${styles.card} ${styles.cardHighlight}`}>
          <div className={styles.cardHeader}>
            <span className={styles.label}>Top Source</span>
            <div className={`${styles.iconWrapper} ${styles.highlightIconWrapper}`}>
              <GeneralTagIcon />
            </div>
          </div>
          <div className={styles.valueContainer}>
            <span className={`${styles.value} ${styles.neutralValue}`}>{topCategoryInfo.name}</span>
            <div className={styles.subtextRow}>
              <span>{topCategoryInfo.amountFormatted} total received</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (activeTab === TransactionTab.Expense) {
    const expenseFormatted = `-${formatMoney(outflowAgg.totalMinor, outflowAgg.dominantCurrency)}`;
    return (
      <div className={styles.grid} data-testid="summary-cards-expense">
        <div className={`${styles.card} ${styles.cardOutflow}`}>
          <div className={styles.cardHeader}>
            <span className={styles.label}>Total Spending</span>
            <div className={`${styles.iconWrapper} ${styles.outflowIconWrapper}`}>
              <OutflowArrowIcon />
            </div>
          </div>
          <div className={styles.valueContainer}>
            <span className={`${styles.value} ${styles.outflowValue}`}>{expenseFormatted}</span>
            <div className={styles.subtextRow}>
              <span>{expenseRecords.length} {expenseRecords.length === 1 ? "expense" : "expenses"} in view</span>
              {outflowAgg.extraCurrenciesCount > 0 && (
                <span className={styles.multiCurrencyBadge}>
                  +{outflowAgg.extraCurrenciesCount} other currency
                </span>
              )}
            </div>
          </div>
        </div>

        <div className={`${styles.card} ${styles.cardNeutral}`}>
          <div className={styles.cardHeader}>
            <span className={styles.label}>Expense Count</span>
            <div className={`${styles.iconWrapper} ${styles.neutralIconWrapper}`}>
              <TrendingStarIcon />
            </div>
          </div>
          <div className={styles.valueContainer}>
            <span className={`${styles.value} ${styles.serifValue}`}>{expenseRecords.length}</span>
            <div className={styles.subtextRow}>
              <span>Active spending records</span>
            </div>
          </div>
        </div>

        <div className={`${styles.card} ${styles.cardHighlight}`}>
          <div className={styles.cardHeader}>
            <span className={styles.label}>Top Category</span>
            <div className={`${styles.iconWrapper} ${styles.highlightIconWrapper}`}>
              <GeneralTagIcon />
            </div>
          </div>
          <div className={styles.valueContainer}>
            <span className={`${styles.value} ${styles.neutralValue}`}>{topCategoryInfo.name}</span>
            <div className={styles.subtextRow}>
              <span>{topCategoryInfo.amountFormatted} total spent</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Active tab === 'all'
  const netMinor = inflowAgg.totalMinor - outflowAgg.totalMinor;
  const netCurrency = inflowAgg.dominantCurrency || outflowAgg.dominantCurrency || fallbackCurrency;
  let netFormatted = formatMoney(0, netCurrency);
  if (netMinor > 0) {
    netFormatted = `+${formatMoney(netMinor, netCurrency)}`;
  } else if (netMinor < 0) {
    netFormatted = `-${formatMoney(Math.abs(netMinor), netCurrency)}`;
  }

  let netValueClass = styles.neutralValue;
  if (netMinor > 0) {
    netValueClass = styles.netPositiveValue;
  } else if (netMinor < 0) {
    netValueClass = styles.netNegativeValue;
  }

  const hasExtraCurrencies =
    inflowAgg.extraCurrenciesCount > 0 || outflowAgg.extraCurrenciesCount > 0;

  return (
    <div className={styles.grid} data-testid="summary-cards-all">
      <div className={`${styles.card} ${styles.cardInflow}`}>
        <div className={styles.cardHeader}>
          <span className={styles.label}>Total Inflow</span>
          <div className={`${styles.iconWrapper} ${styles.inflowIconWrapper}`}>
            <InflowArrowIcon />
          </div>
        </div>
        <div className={styles.valueContainer}>
          <span className={`${styles.value} ${styles.inflowValue}`}>
            +{formatMoney(inflowAgg.totalMinor, inflowAgg.dominantCurrency)}
          </span>
          <div className={styles.subtextRow}>
            <span>{incomeRecords.length} income {incomeRecords.length === 1 ? "record" : "records"}</span>
            {inflowAgg.extraCurrenciesCount > 0 && (
              <span className={styles.multiCurrencyBadge}>
                +{inflowAgg.extraCurrenciesCount} other currency
              </span>
            )}
          </div>
        </div>
      </div>

      <div className={`${styles.card} ${styles.cardOutflow}`}>
        <div className={styles.cardHeader}>
          <span className={styles.label}>Total Outflow</span>
          <div className={`${styles.iconWrapper} ${styles.outflowIconWrapper}`}>
            <OutflowArrowIcon />
          </div>
        </div>
        <div className={styles.valueContainer}>
          <span className={`${styles.value} ${styles.outflowValue}`}>
            -{formatMoney(outflowAgg.totalMinor, outflowAgg.dominantCurrency)}
          </span>
          <div className={styles.subtextRow}>
            <span>{expenseRecords.length} expense {expenseRecords.length === 1 ? "record" : "records"}</span>
            {outflowAgg.extraCurrenciesCount > 0 && (
              <span className={styles.multiCurrencyBadge}>
                +{outflowAgg.extraCurrenciesCount} other currency
              </span>
            )}
          </div>
        </div>
      </div>

      <div className={`${styles.card} ${styles.cardNeutral}`}>
        <div className={styles.cardHeader}>
          <span className={styles.label}>Net Cash Flow</span>
          <div className={`${styles.iconWrapper} ${styles.neutralIconWrapper}`}>
            <NetBalanceIcon />
          </div>
        </div>
        <div className={styles.valueContainer}>
          <span className={`${styles.value} ${netValueClass}`}>{netFormatted}</span>
          <div className={styles.subtextRow}>
            <span>{records.length} total records</span>
            {hasExtraCurrencies && (
              <span className={styles.multiCurrencyBadge}>Multi-currency</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
