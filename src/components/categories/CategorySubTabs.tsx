import { KeyboardEvent, useRef } from "react";
import styles from "./CategorySubTabs.module.css";

export type CategoryTab = "all" | "expense" | "income";

interface CategorySubTabsProps {
  activeTab: CategoryTab;
  onTabChange: (tab: CategoryTab) => void;
  allCount: number;
  expenseCount: number;
  incomeCount: number;
}

const TABS: { type: CategoryTab; label: string; testId: string }[] = [
  { type: "all", label: "All", testId: "tab-all" },
  { type: "expense", label: "Expenses", testId: "tab-expense" },
  { type: "income", label: "Income", testId: "tab-income" },
];

export function CategorySubTabs({
  activeTab,
  onTabChange,
  allCount,
  expenseCount,
  incomeCount,
}: CategorySubTabsProps) {
  const tabRefs = useRef<{ [key in CategoryTab]?: HTMLButtonElement | null }>({});

  const getCount = (type: CategoryTab): number => {
    if (type === "expense") return expenseCount;
    if (type === "income") return incomeCount;
    return allCount;
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const currentIndex = TABS.findIndex((tab) => tab.type === activeTab);
    let nextIndex = -1;

    if (e.key === "ArrowRight") {
      e.preventDefault();
      nextIndex = (currentIndex + 1) % TABS.length;
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      nextIndex = (currentIndex - 1 + TABS.length) % TABS.length;
    } else if (e.key === "Home") {
      e.preventDefault();
      nextIndex = 0;
    } else if (e.key === "End") {
      e.preventDefault();
      nextIndex = TABS.length - 1;
    }

    if (nextIndex !== -1) {
      const nextTab = TABS[nextIndex].type;
      onTabChange(nextTab);
      tabRefs.current[nextTab]?.focus();
    }
  };

  return (
    <div
      className={styles.tabContainer}
      role="tablist"
      aria-label="Category type sub-tabs"
      onKeyDown={handleKeyDown}
    >
      {TABS.map((tab) => {
        const isSelected = activeTab === tab.type;
        const count = getCount(tab.type);
        const activeClass = isSelected
          ? `${styles.activeTab} ${
              tab.type === "all"
                ? styles.allActive
                : tab.type === "expense"
                ? styles.expenseActive
                : ""
            }`
          : "";

        return (
          <button
            key={tab.type}
            ref={(el) => {
              tabRefs.current[tab.type] = el;
            }}
            type="button"
            role="tab"
            id={`tab-${tab.type}`}
            aria-selected={isSelected}
            aria-controls={`tabpanel-${tab.type}`}
            tabIndex={isSelected ? 0 : -1}
            className={`${styles.tabButton} ${activeClass}`.trim()}
            onClick={() => onTabChange(tab.type)}
          >
            <span>{tab.label}</span>
            <span className={styles.tabBadge}>{count}</span>
          </button>
        );
      })}
    </div>
  );
}
