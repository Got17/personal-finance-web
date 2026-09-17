import { Account } from "@/lib/schemas/accounts";
import { Category } from "@/lib/schemas/categories";
import { FinancialRecord } from "@/lib/schemas/financial-records";
import { EditPencilIcon, TrashIcon } from "../icons";
import { CategoryBadge } from "./CategoryBadge";
import { CategoryAvatar } from "@/components/ui/avatars/CategoryAvatar";
import styles from "./FinancialRecordsTable.module.css";

interface FinancialRecordsTableProps {
  records: FinancialRecord[];
  accounts: Account[];
  categories: Category[];
  onEdit?: (record: FinancialRecord) => void;
  onDelete?: (record: FinancialRecord) => void;
}

function formatMoney(amountMinor: number, currency: string, isIncome: boolean): string {
  const formatted = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amountMinor / 100);

  return isIncome ? `+${formatted}` : `-${formatted}`;
}

export function FinancialRecordsTable({
  records,
  accounts,
  categories,
  onEdit,
  onDelete,
}: Readonly<FinancialRecordsTableProps>) {
  const getCategoryName = (id: string) =>
    categories.find((cat) => cat.id === id)?.name || "Uncategorized";

  const getAccountName = (id: string) =>
    accounts.find((acc) => acc.id === id)?.name || "Account";

  if (records.length === 0) {
    return <div className={styles.emptyState}>No transactions match these filters.</div>;
  }

  return (
    <div className={styles.tableWrapper}>
      <table className={styles.table} aria-label="Transactions table">
        <thead>
          <tr>
            <th scope="col">Date</th>
            <th scope="col">Description</th>
            <th scope="col">Category</th>
            <th scope="col" className={styles.amountHeader}>
              Amount
            </th>
            <th scope="col" className={styles.actionsHeader}>
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {records.map((record) => {
            const isIncome = record.kind === "income";
            const categoryName = getCategoryName(record.category_id);
            const accountName = getAccountName(record.account_id);
            const dateDisplay = record.date.slice(0, 10);

            return (
              <tr key={record.id} className={styles.row}>
                <td>
                  <span className={styles.dateCell}>{dateDisplay}</span>
                </td>
                <td>
                  <div className={styles.descCell}>
                    <CategoryAvatar categoryName={categoryName} />
                    <div className={styles.descContainer}>
                      {record.note ? (
                        <span className={styles.description}>{record.note}</span>
                      ) : (
                        <span className={styles.categoryFallbackTitle}>{categoryName}</span>
                      )}
                      <span className={styles.accountMeta}>{accountName}</span>
                    </div>
                  </div>
                </td>
                <td>
                  <CategoryBadge name={categoryName} />
                </td>
                <td className={styles.amountCell}>
                  <span
                    className={`${styles.amount} ${
                      isIncome ? styles.incomeAmount : styles.expenseAmount
                    }`}
                  >
                    {formatMoney(record.amount_minor, record.currency, isIncome)}
                  </span>
                </td>
                <td className={styles.actionsCell}>
                  <div className={styles.actionsGroup}>
                    <button
                      type="button"
                      className={`${styles.actionButton} ${styles.editButton}`}
                      onClick={() => onEdit?.(record)}
                      aria-label={`Edit ${record.note || categoryName}`}
                    >
                      <EditPencilIcon />
                    </button>
                    <button
                      type="button"
                      className={`${styles.actionButton} ${styles.deleteButton}`}
                      onClick={() => onDelete?.(record)}
                      aria-label={`Delete ${record.note || categoryName}`}
                    >
                      <TrashIcon />
                    </button>
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
