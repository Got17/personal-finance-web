import { useMemo } from "react";
import { Category } from "@/lib/schemas/categories";
import { CategoryTab } from "./CategorySubTabs";
import {
  InflowArrowIcon,
  OutflowArrowIcon,
  TrendingStarIcon,
} from "@/components/financial-records/summary-icons";
import { GeneralTagIcon, CheckIcon } from "@/components/financial-records/icons";
import styles from "./CategorySummaryCards.module.css";

interface CategorySummaryCardsProps {
  categories: Category[];
  activeTab: CategoryTab;
}

export function CategorySummaryCards({
  categories,
  activeTab,
}: CategorySummaryCardsProps) {
  const expenseCategories = useMemo(
    () => categories.filter((c) => c.type === "expense"),
    [categories]
  );

  const incomeCategories = useMemo(
    () => categories.filter((c) => c.type === "income"),
    [categories]
  );

  const activeExpenses = useMemo(
    () => expenseCategories.filter((c) => c.is_active).length,
    [expenseCategories]
  );

  const inactiveExpenses = expenseCategories.length - activeExpenses;

  const activeIncomes = useMemo(
    () => incomeCategories.filter((c) => c.is_active).length,
    [incomeCategories]
  );

  const inactiveIncomes = incomeCategories.length - activeIncomes;

  const totalActive = activeExpenses + activeIncomes;

  if (activeTab === "income") {
    return (
      <div className={styles.grid} data-testid="summary-cards-income">
        <div className={`${styles.card} ${styles.cardInflow}`}>
          <div className={styles.cardHeader}>
            <span className={styles.label}>Total Income</span>
            <div className={`${styles.iconWrapper} ${styles.inflowIconWrapper}`}>
              <InflowArrowIcon />
            </div>
          </div>
          <div className={styles.valueContainer}>
            <span className={`${styles.value} ${styles.inflowValue}`}>
              {incomeCategories.length}
            </span>
            <div className={styles.subtextRow}>
              <span>Inflow classification streams</span>
            </div>
          </div>
        </div>

        <div className={`${styles.card} ${styles.cardInflow}`}>
          <div className={styles.cardHeader}>
            <span className={styles.label}>Active Streams</span>
            <div className={`${styles.iconWrapper} ${styles.inflowIconWrapper}`}>
              <CheckIcon />
            </div>
          </div>
          <div className={styles.valueContainer}>
            <span className={`${styles.value} ${styles.inflowValue}`}>
              {activeIncomes}
            </span>
            <div className={styles.subtextRow}>
              <span>Available for transaction records</span>
            </div>
          </div>
        </div>

        <div className={`${styles.card} ${styles.cardNeutral}`}>
          <div className={styles.cardHeader}>
            <span className={styles.label}>Archived Streams</span>
            <div className={`${styles.iconWrapper} ${styles.neutralIconWrapper}`}>
              <GeneralTagIcon />
            </div>
          </div>
          <div className={styles.valueContainer}>
            <span className={`${styles.value} ${styles.neutralValue}`}>
              {inactiveIncomes}
            </span>
            <div className={styles.subtextRow}>
              <span>Deactivated historical streams</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (activeTab === "expense") {
    return (
      <div className={styles.grid} data-testid="summary-cards-expense">
        <div className={`${styles.card} ${styles.cardOutflow}`}>
          <div className={styles.cardHeader}>
            <span className={styles.label}>Total Expenses</span>
            <div className={`${styles.iconWrapper} ${styles.outflowIconWrapper}`}>
              <OutflowArrowIcon />
            </div>
          </div>
          <div className={styles.valueContainer}>
            <span className={`${styles.value} ${styles.outflowValue}`}>
              {expenseCategories.length}
            </span>
            <div className={styles.subtextRow}>
              <span>Outflow classifications</span>
            </div>
          </div>
        </div>

        <div className={`${styles.card} ${styles.cardInflow}`}>
          <div className={styles.cardHeader}>
            <span className={styles.label}>Active Categories</span>
            <div className={`${styles.iconWrapper} ${styles.inflowIconWrapper}`}>
              <CheckIcon />
            </div>
          </div>
          <div className={styles.valueContainer}>
            <span className={`${styles.value} ${styles.inflowValue}`}>
              {activeExpenses}
            </span>
            <div className={styles.subtextRow}>
              <span>Available for spending records</span>
            </div>
          </div>
        </div>

        <div className={`${styles.card} ${styles.cardNeutral}`}>
          <div className={styles.cardHeader}>
            <span className={styles.label}>Archived Categories</span>
            <div className={`${styles.iconWrapper} ${styles.neutralIconWrapper}`}>
              <GeneralTagIcon />
            </div>
          </div>
          <div className={styles.valueContainer}>
            <span className={`${styles.value} ${styles.neutralValue}`}>
              {inactiveExpenses}
            </span>
            <div className={styles.subtextRow}>
              <span>Deactivated historical categories</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Active tab === 'all'
  return (
    <div className={styles.grid} data-testid="summary-cards-all">
      <div className={`${styles.card} ${styles.cardOutflow}`}>
        <div className={styles.cardHeader}>
          <span className={styles.label}>Expense Categories</span>
          <div className={`${styles.iconWrapper} ${styles.outflowIconWrapper}`}>
            <OutflowArrowIcon />
          </div>
        </div>
        <div className={styles.valueContainer}>
          <span className={`${styles.value} ${styles.outflowValue}`}>
            {expenseCategories.length}
          </span>
          <div className={styles.subtextRow}>
            <span>
              {activeExpenses} active, {inactiveExpenses} inactive
            </span>
          </div>
        </div>
      </div>

      <div className={`${styles.card} ${styles.cardInflow}`}>
        <div className={styles.cardHeader}>
          <span className={styles.label}>Income Categories</span>
          <div className={`${styles.iconWrapper} ${styles.inflowIconWrapper}`}>
            <InflowArrowIcon />
          </div>
        </div>
        <div className={styles.valueContainer}>
          <span className={`${styles.value} ${styles.inflowValue}`}>
            {incomeCategories.length}
          </span>
          <div className={styles.subtextRow}>
            <span>
              {activeIncomes} active, {inactiveIncomes} inactive
            </span>
          </div>
        </div>
      </div>

      <div className={`${styles.card} ${styles.cardNeutral}`}>
        <div className={styles.cardHeader}>
          <span className={styles.label}>Total Classification</span>
          <div className={`${styles.iconWrapper} ${styles.neutralIconWrapper}`}>
            <TrendingStarIcon />
          </div>
        </div>
        <div className={styles.valueContainer}>
          <span className={`${styles.value} ${styles.neutralValue}`}>
            {categories.length}
          </span>
          <div className={styles.subtextRow}>
            <span>{totalActive} active in workspace</span>
          </div>
        </div>
      </div>
    </div>
  );
}
