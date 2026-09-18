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

function formatPlainMoney(amountMinor: number, currency: string): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amountMinor / 100);
}

export function FinancialRecordsTable({
  records,
  accounts,
  categories,
  onEdit,
  onDelete,
}: Readonly<FinancialRecordsTableProps>) {
  const getCategoryName = (id?: string) => {
    if (!id) return "Uncategorized";
    return categories.find((cat) => cat.id === id)?.name || "Uncategorized";
  };

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
            const isTransfer = record.kind === "transfer";
            const isIncome = record.kind === "income";
            const categoryName = isTransfer
              ? "Transfer"
              : getCategoryName(record.category_id);
            const accountName = getAccountName(record.account_id);
            const destinationAccountName = record.destination_account_id
              ? getAccountName(record.destination_account_id)
              : undefined;
            const dateDisplay = record.date.slice(0, 10);

            return (
              <tr key={record.id} className={styles.row}>
                <td>
                  <span className={styles.dateCell}>{dateDisplay}</span>
                </td>
                <td>
                  <div className={styles.descCell}>
                    <CategoryAvatar categoryName={isTransfer ? "Transfer" : categoryName} />
                    <div className={styles.descContainer}>
                      {record.note ? (
                        <span className={styles.description}>{record.note}</span>
                      ) : (
                        <span className={styles.categoryFallbackTitle}>
                          {isTransfer
                            ? destinationAccountName
                              ? `Transfer to ${destinationAccountName}`
                              : "Transfer"
                            : categoryName}
                        </span>
                      )}
                      <span className={styles.accountMeta}>
                        {isTransfer && destinationAccountName
                          ? `${accountName} → ${destinationAccountName}`
                          : accountName}
                        {record.linked_transfer_id && (
                          <span className={styles.transferFeeTag}>Fee</span>
                        )}
                      </span>
                    </div>
                  </div>
                </td>
                <td>
                  <CategoryBadge name={categoryName} />
                </td>
                <td className={styles.amountCell}>
                  {isTransfer ? (
                    <span className={`${styles.amount} ${styles.transferAmount}`}>
                      {record.destination_amount_minor &&
                      record.destination_currency &&
                      record.currency !== record.destination_currency
                        ? `${formatPlainMoney(
                            record.amount_minor,
                            record.currency,
                          )} → ${formatPlainMoney(
                            record.destination_amount_minor,
                            record.destination_currency,
                          )}`
                        : formatPlainMoney(record.amount_minor, record.currency)}
                    </span>
                  ) : (
                    <span
                      className={`${styles.amount} ${
                        isIncome ? styles.incomeAmount : styles.expenseAmount
                      }`}
                    >
                      {formatMoney(record.amount_minor, record.currency, isIncome)}
                    </span>
                  )}
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
