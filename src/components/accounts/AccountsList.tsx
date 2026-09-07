import { Account } from "@/lib/schemas/accounts";
import styles from "./AccountsList.module.css";

interface AccountsListProps {
  accounts: Account[];
  onAddClick?: () => void;
}

const TYPE_ICONS: Record<string, string> = {
  checking: "C",
  savings: "S",
  credit_card: "CC",
  investment: "I",
  cash: "W",
  loan: "L",
  other: "A",
};

const TYPE_FORMATTED: Record<string, string> = {
  checking: "Checking",
  savings: "Savings",
  credit_card: "Credit Card",
  investment: "Investment",
  cash: "Cash",
  loan: "Loan",
  other: "Other",
};

export function AccountsList({ accounts, onAddClick }: AccountsListProps) {
  if (accounts.length === 0) {
    return (
      <div className={styles.emptyCard} data-testid="empty-accounts">
        <h3 className={styles.emptyTitle}>No accounts created yet</h3>
        <p className={styles.emptyDescription}>
          Add your first bank account, savings account, or investment portfolio to start tracking
          your finances.
        </p>
        {onAddClick && (
          <button type="button" className={styles.emptyButton} onClick={onAddClick}>
            + Add Account
          </button>
        )}
      </div>
    );
  }

  return (
    <div className={styles.accountsGrid} data-testid="accounts-grid">
      {accounts.map((account) => {
        const mark = TYPE_ICONS[account.type] || "A";
        const formattedType = TYPE_FORMATTED[account.type] || account.type;

        return (
          <div
            key={account.id}
            className={`${styles.accountCard} ${!account.is_active ? styles.inactiveCard : ""}`}
            data-testid={`account-card-${account.id}`}
          >
            <div className={styles.cardHeader}>
              <div className={styles.markIcon} aria-hidden="true">
                {mark}
              </div>
              <div className={styles.accountTitleGroup}>
                <h3 className={styles.accountName}>{account.name}</h3>
                <span className={styles.accountTypeLabel}>{formattedType}</span>
              </div>
            </div>

            {account.description && (
              <p className={styles.accountDescription}>{account.description}</p>
            )}

            <div className={styles.cardFooter}>
              <span className={styles.currencyBadge}>{account.currency}</span>
              <span
                className={`${styles.statusBadge} ${
                  account.is_active ? styles.activeStatus : styles.inactiveStatus
                }`}
              >
                {account.is_active ? "Active" : "Inactive"}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
