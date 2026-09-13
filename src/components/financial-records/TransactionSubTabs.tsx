import { FinancialRecordKind } from "@/lib/schemas/financial-records";
import styles from "./TransactionSubTabs.module.css";

interface TransactionSubTabsProps {
  activeTab: FinancialRecordKind;
  onTabChange: (tab: FinancialRecordKind) => void;
  expenseCount: number;
  incomeCount: number;
}

export function TransactionSubTabs({
  activeTab,
  onTabChange,
  expenseCount,
  incomeCount,
}: TransactionSubTabsProps) {
  return (
    <div className={styles.tabContainer} role="tablist" aria-label="Transaction type sub-tabs">
      <button
        type="button"
        role="tab"
        id="tab-expense"
        aria-selected={activeTab === "expense"}
        aria-controls="tabpanel-expense"
        tabIndex={activeTab === "expense" ? 0 : -1}
        className={`${styles.tabButton} ${activeTab === "expense" ? `${styles.activeTab} ${styles.expenseActive}` : ""}`}
        onClick={() => onTabChange("expense")}
      >
        <span>Expenses</span>
        <span className={styles.tabBadge}>{expenseCount}</span>
      </button>

      <button
        type="button"
        role="tab"
        id="tab-income"
        aria-selected={activeTab === "income"}
        aria-controls="tabpanel-income"
        tabIndex={activeTab === "income" ? 0 : -1}
        className={`${styles.tabButton} ${activeTab === "income" ? styles.activeTab : ""}`}
        onClick={() => onTabChange("income")}
      >
        <span>Income</span>
        <span className={styles.tabBadge}>{incomeCount}</span>
      </button>
    </div>
  );
}
