"use client";

import { useState, KeyboardEvent } from "react";
import { Category, CategoryType } from "@/lib/schemas/categories";
import { EmptyState } from "@/components/ui/EmptyState";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { CardActions } from "@/components/ui/CardActions";
import styles from "./CategoriesList.module.css";

interface CategoriesListProps {
  categories: Category[];
  onAddClick?: () => void;
  onEditClick?: (category: Category) => void;
  onDeactivateClick?: (category: Category) => void;
}

type FilterType = "all" | CategoryType;

const TABS: { type: FilterType; label: string }[] = [
  { type: "all", label: "All" },
  { type: "income", label: "Income" },
  { type: "expense", label: "Expense" },
];

function getTabCount(type: FilterType, total: number, income: number, expense: number): number {
  if (type === "income") return income;
  if (type === "expense") return expense;
  return total;
}

export function CategoriesList({
  categories,
  onAddClick,
  onEditClick,
  onDeactivateClick,
}: CategoriesListProps) {
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

  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const currentIndex = TABS.findIndex((tab) => tab.type === filter);
    if (e.key === "ArrowRight") {
      e.preventDefault();
      const nextIndex = (currentIndex + 1) % TABS.length;
      setFilter(TABS[nextIndex].type);
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      const prevIndex = (currentIndex - 1 + TABS.length) % TABS.length;
      setFilter(TABS[prevIndex].type);
    }
  };

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
      <div
        className={styles.filterBar}
        role="tablist"
        aria-label="Category type filter"
        onKeyDown={handleKeyDown}
      >
        {TABS.map((tab) => {
          const isSelected = filter === tab.type;
          const count = getTabCount(tab.type, categories.length, incomeCount, expenseCount);
          const tabLabel = `${tab.label} (${count})`;
          return (
            <button
              key={tab.type}
              type="button"
              role="tab"
              id={`tab-${tab.type}`}
              aria-selected={isSelected}
              aria-controls="category-tab-panel"
              tabIndex={isSelected ? 0 : -1}
              className={isSelected ? styles.activeFilterTab : styles.filterTab}
              onClick={() => setFilter(tab.type)}
            >
              {tabLabel}
            </button>
          );
        })}
      </div>

      <div id="category-tab-panel" role="tabpanel" aria-labelledby={`tab-${filter}`}>
        {filteredCategories.length === 0 ? (
          <EmptyState
            title={`No ${filter} categories found`}
            description={`There are currently no ${filter} categories created.`}
          />
        ) : (
          <div className={styles.grid}>
            {filteredCategories.map((category) => (
              <Card key={category.id}>
                <div
                  className={`${styles.categoryCard} ${!category.is_active ? styles.inactiveCard : ""}`}
                  data-testid={`category-card-${category.id}`}
                >
                  <div className={styles.categoryMain}>
                    <h4 className={styles.categoryName}>{category.name}</h4>
                    <Badge variant={category.type === "income" ? "income" : "expense"}>
                      {category.type === "income" ? "Income" : "Expense"}
                    </Badge>
                  </div>

                  <div className={styles.cardFooter}>
                    <StatusBadge isActive={category.is_active} />
                  </div>

                  <CardActions
                    onEdit={onEditClick ? () => onEditClick(category) : undefined}
                    onDeactivate={onDeactivateClick ? () => onDeactivateClick(category) : undefined}
                    canDeactivate={category.is_active}
                    editAriaLabel={`Edit ${category.name}`}
                    deactivateAriaLabel={`Deactivate ${category.name}`}
                  />
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
