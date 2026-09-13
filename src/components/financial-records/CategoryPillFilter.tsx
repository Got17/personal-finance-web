import { FilterFunnelIcon, getCategoryIcon } from "./icons";
import { getCategoryThemeClass } from "./CategoryBadge";
import styles from "./CategoryPillFilter.module.css";

export interface CategoryPillItem {
  id: string;
  name: string;
}

interface CategoryPillFilterProps {
  categories: CategoryPillItem[];
  categoryCounts: Record<string, number>;
  selectedCategoryId: string;
  totalCount: number;
  onSelectCategory: (categoryId: string) => void;
}

export function CategoryPillFilter({
  categories,
  categoryCounts,
  selectedCategoryId,
  totalCount,
  onSelectCategory,
}: CategoryPillFilterProps) {
  return (
    <div className={styles.container} role="region" aria-label="Category filters">
      <div className={styles.labelGroup}>
        <FilterFunnelIcon />
        <span>Categories:</span>
      </div>

      <div className={styles.pillsList}>
        <button
          type="button"
          className={`${styles.pill} ${!selectedCategoryId ? styles.allPillActive : ""}`}
          onClick={() => onSelectCategory("")}
          aria-pressed={!selectedCategoryId}
        >
          <span>All</span>
          <span className={styles.count}>({totalCount})</span>
        </button>

        {categories.map((category) => {
          const count = categoryCounts[category.id] || 0;
          const isSelected = selectedCategoryId === category.id;
          const themeClass = getCategoryThemeClass(category.name);
          const icon = getCategoryIcon(category.name);

          return (
            <button
              key={category.id}
              type="button"
              className={`${styles.pill} ${themeClass} ${isSelected ? styles.activeCategoryPill : ""}`}
              onClick={() => onSelectCategory(isSelected ? "" : category.id)}
              aria-pressed={isSelected}
            >
              <span>{icon}</span>
              <span>{category.name}</span>
              <span className={styles.count}>{count}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
