"use client";

import { useState } from "react";
import { Category, CategoryType } from "@/lib/schemas/categories";
import styles from "./CategoriesList.module.css";

interface CategoriesListProps {
  categories: Category[];
  onAddClick?: () => void;
}

type FilterType = "all" | CategoryType;

export function CategoriesList({ categories, onAddClick }: CategoriesListProps) {
  const [filter, setFilter] = useState<FilterType>("all");

  const filteredCategories = categories.filter((cat) => {
    if (filter === "all") return true;
    return cat.type === filter;
  });

  const { incomeCount, expenseCount } = categories.reduce(
    (acc, cat) => {
      if (cat.type === "income") acc.incomeCount++;
      else if (cat.type === "expense") acc.expenseCount++;
      return acc;
    },
    { incomeCount: 0, expenseCount: 0 },
  );

  if (categories.length === 0) {
    return (
      <div className={styles.emptyState}>
        <h3 className={styles.emptyTitle}>No categories yet</h3>
        <p className={styles.emptyDescription}>
          Organize your income streams and spending by creating your first category.
        </p>
        {onAddClick && (
          <button
            type="button"
            className={styles.emptyAddButton}
            onClick={onAddClick}
          >
            + Add Category
          </button>
        )}
      </div>
    );
  }

  return (
    <div className={styles.listContainer}>
      <div className={styles.filterBar} role="tablist" aria-label="Category type filter">
        <button
          type="button"
          role="tab"
          aria-selected={filter === "all"}
          className={filter === "all" ? styles.activeFilterTab : styles.filterTab}
          onClick={() => setFilter("all")}
        >
          All ({categories.length})
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={filter === "income"}
          className={filter === "income" ? styles.activeFilterTab : styles.filterTab}
          onClick={() => setFilter("income")}
        >
          Income ({incomeCount})
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={filter === "expense"}
          className={filter === "expense" ? styles.activeFilterTab : styles.filterTab}
          onClick={() => setFilter("expense")}
        >
          Expense ({expenseCount})
        </button>
      </div>

      {filteredCategories.length === 0 ? (
        <div className={styles.emptyState}>
          <h3 className={styles.emptyTitle}>
            No {filter} categories found
          </h3>
          <p className={styles.emptyDescription}>
            There are currently no {filter} categories created.
          </p>
        </div>
      ) : (
        <div className={styles.grid}>
          {filteredCategories.map((category) => (
            <div key={category.id} className={styles.card}>
              <div className={styles.categoryMain}>
                <h4 className={styles.categoryName}>{category.name}</h4>
                <span
                  className={`${styles.typeBadge} ${
                    category.type === "income" ? styles.incomeBadge : styles.expenseBadge
                  }`}
                >
                  {category.type === "income" ? "Income" : "Expense"}
                </span>
              </div>
              <span className={styles.statusBadge}>
                {category.is_active ? "Active" : "Inactive"}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
