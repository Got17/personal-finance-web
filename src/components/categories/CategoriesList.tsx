"use client";

import { useState } from "react";
import { Category, CategoryType } from "@/lib/schemas/categories";
import { EmptyState } from "@/components/ui/EmptyState";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
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
      <EmptyState
        title="No categories yet"
        description="Organize your income streams and spending by creating your first category."
        actionLabel={onAddClick ? "+ Add Category" : undefined}
        onAction={onAddClick}
      />
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
        <EmptyState
          title={`No ${filter} categories found`}
          description={`There are currently no ${filter} categories created.`}
        />
      ) : (
        <div className={styles.grid}>
          {filteredCategories.map((category) => (
            <Card key={category.id}>
              <div className={styles.categoryMain}>
                <h4 className={styles.categoryName}>{category.name}</h4>
                <Badge variant={category.type === "income" ? "income" : "expense"}>
                  {category.type === "income" ? "Income" : "Expense"}
                </Badge>
              </div>
              <span className={styles.statusBadge}>
                {category.is_active ? "Active" : "Inactive"}
              </span>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
