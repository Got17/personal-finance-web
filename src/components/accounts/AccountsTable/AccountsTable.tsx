import { Account, AccountType } from "@/lib/schemas/accounts";
import { AccountAvatar } from "@/components/ui/avatars/AccountAvatar";
import { Badge, BadgeVariant } from "@/components/ui/badges/Badge";
import { StatusBadge } from "@/components/ui/badges/StatusBadge";
import { EditPencilIcon, TrashIcon, TransferArrowsIcon } from "@/components/financial-records/icons";
import styles from "./AccountsTable.module.css";

interface AccountsTableProps {
  readonly accounts: Account[];
  readonly onEdit?: (account: Account) => void;
  readonly onDeactivate?: (account: Account) => void;
  readonly onTransfer?: (account: Account) => void;
}

const TYPE_LABELS: Record<AccountType, string> = {
  checking: "Checking",
  savings: "Savings",
  investment: "Investment",
  cash: "Cash",
  other: "Other",
};


export function AccountsTable({
  accounts,
  onEdit,
  onDeactivate,
  onTransfer,
}: Readonly<AccountsTableProps>) {
  if (accounts.length === 0) {
    return <div className={styles.emptyState}>No accounts match your filters.</div>;
  }

  const activeAccountsCount = accounts.filter((a) => a.is_active).length;

  return (
    <div className={styles.tableWrapper}>
      <table className={styles.table} aria-label="Accounts table">
        <thead>
          <tr>
            <th scope="col">Account</th>
            <th scope="col">Type</th>
            <th scope="col">Currency</th>
            <th scope="col">Status</th>
            <th scope="col" className={styles.actionsHeader}>
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {accounts.map((account) => {
            const typeLabel = TYPE_LABELS[account.type] || account.type;
            const badgeVariant: BadgeVariant =
              account.type === "savings" || account.type === "cash" ? "income" : "default";

            return (
              <tr
                key={account.id}
                className={`${styles.row} ${!account.is_active ? styles.inactiveRow : ""}`}
                data-testid={`account-row-${account.id}`}
              >
                <td>
                  <div className={styles.accountCell}>
                    <AccountAvatar type={account.type} />
                    <div className={styles.accountInfo}>
                      <span className={styles.accountName}>{account.name}</span>
                      {account.description ? (
                        <span className={styles.accountDescription}>{account.description}</span>
                      ) : (
                        <span className={styles.accountDescription}>{typeLabel}</span>
                      )}
                    </div>
                  </div>
                </td>
                <td>
                  <Badge variant={badgeVariant}>
                    {typeLabel}
                  </Badge>
                </td>
                <td className={styles.currencyCell}>
                  <span className={styles.currencyCode}>{account.currency}</span>
                </td>
                <td>
                  <StatusBadge isActive={account.is_active} />
                </td>
                <td className={styles.actionsCell}>
                  <div className={styles.actionsGroup}>
                    {onTransfer && account.is_active && activeAccountsCount >= 2 && (
                      <button
                        type="button"
                        className={`${styles.actionButton} ${styles.transferButton}`}
                        onClick={() => onTransfer(account)}
                        aria-label={`Transfer from ${account.name}`}
                        title={`Transfer from ${account.name}`}
                      >
                        <TransferArrowsIcon />
                      </button>
                    )}
                    {onEdit && (
                      <button
                        type="button"
                        className={`${styles.actionButton} ${styles.editButton}`}
                        onClick={() => onEdit(account)}
                        aria-label={`Edit ${account.name}`}
                      >
                        <EditPencilIcon />
                      </button>
                    )}
                    {onDeactivate && account.is_active && (
                      <button
                        type="button"
                        className={`${styles.actionButton} ${styles.deactivateButton}`}
                        onClick={() => onDeactivate(account)}
                        aria-label={`Deactivate ${account.name}`}
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
