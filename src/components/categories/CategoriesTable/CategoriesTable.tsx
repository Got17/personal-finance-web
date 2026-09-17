import { Category } from "@/lib/schemas/categories";
import { CategoryAvatar } from "@/components/ui/avatars/CategoryAvatar";
import { Badge } from "@/components/ui/badges/Badge";
import { StatusBadge } from "@/components/ui/badges/StatusBadge";
import { EditPencilIcon, TrashIcon } from "@/components/financial-records/icons";
import styles from "./CategoriesTable.module.css";

interface CategoriesTableProps {
  readonly categories: Category[];
  readonly onEdit?: (category: Category) => void;
  readonly onDeactivate?: (category: Category) => void;
}

export function CategoriesTable({
  categories,
  onEdit,
  onDeactivate,
}: Readonly<CategoriesTableProps>) {
  if (categories.length === 0) {
    return <div className={styles.emptyState}>No categories match your filters.</div>;
  }

  return (
    <div className={styles.tableWrapper}>
      <table className={styles.table} aria-label="Categories table">
        <thead>
          <tr>
            <th scope="col">Category</th>
            <th scope="col">Type</th>
            <th scope="col">Status</th>
            <th scope="col" className={styles.actionsHeader}>
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {categories.map((category) => {
            const isIncome = category.type === "income";

            return (
              <tr
                key={category.id}
                className={`${styles.row} ${!category.is_active ? styles.inactiveRow : ""}`}
                data-testid={`category-row-${category.id}`}
              >
                <td>
                  <div className={styles.categoryCell}>
                    <CategoryAvatar categoryName={category.name} />
                    <div className={styles.categoryInfo}>
                      <span className={styles.categoryName}>{category.name}</span>
                      <span className={styles.categoryMeta}>
                        {isIncome ? "Inflow Stream" : "Outflow Classification"}
                      </span>
                    </div>
                  </div>
                </td>
                <td>
                  <Badge variant={isIncome ? "income" : "expense"}>
                    {isIncome ? "Income" : "Expense"}
                  </Badge>
                </td>
                <td>
                  <StatusBadge isActive={category.is_active} />
                </td>
                <td className={styles.actionsCell}>
                  <div className={styles.actionsGroup}>
                    {onEdit && (
                      <button
                        type="button"
                        className={`${styles.actionButton} ${styles.editButton}`}
                        onClick={() => onEdit(category)}
                        aria-label={`Edit ${category.name}`}
                      >
                        <EditPencilIcon />
                      </button>
                    )}
                    {onDeactivate && category.is_active && (
                      <button
                        type="button"
                        className={`${styles.actionButton} ${styles.deactivateButton}`}
                        onClick={() => onDeactivate(category)}
                        aria-label={`Deactivate ${category.name}`}
                      >
                        <TrashIcon />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
