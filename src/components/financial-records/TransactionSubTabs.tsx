import styles from "./TransactionSubTabs.module.css";

export type TransactionTab = "all" | "expense" | "income";

interface TransactionSubTabsProps {
  activeTab: TransactionTab;
  onTabChange: (tab: TransactionTab) => void;
  allCount: number;
  expenseCount: number;
  incomeCount: number;
}

export function TransactionSubTabs({
  activeTab,
  onTabChange,
  allCount,
  expenseCount,
  incomeCount,
}: TransactionSubTabsProps) {
  return (
    <div className={styles.tabContainer} role="tablist" aria-label="Transaction type sub-tabs">
      <button
        type="button"
        role="tab"
        id="tab-all"
        aria-selected={activeTab === "all"}
        aria-controls="tabpanel-all"
        tabIndex={activeTab === "all" ? 0 : -1}
        className={`${styles.tabButton} ${activeTab === "all" ? `${styles.activeTab} ${styles.allActive}` : ""}`}
        onClick={() => onTabChange("all")}
      >
        <span>All</span>
        <span className={styles.tabBadge}>{allCount}</span>
      </button>

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
