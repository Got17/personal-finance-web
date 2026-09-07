import { Account } from "@/lib/schemas/accounts";
import styles from "./AccountsList.module.css";

interface AccountsListProps {
  accounts: Account[];
  onAddClick?: () => void;
  onEditClick?: (account: Account) => void;
  onDeactivateClick?: (account: Account) => void;
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

export function AccountsList({
  accounts,
  onAddClick,
  onEditClick,
  onDeactivateClick,
}: AccountsListProps) {
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
        const isClickable = Boolean(onEditClick);

        return (
          <div
            key={account.id}
            className={`${styles.accountCard} ${!account.is_active ? styles.inactiveCard : ""} ${
              isClickable ? styles.clickableCard : ""
            }`}
            data-testid={`account-card-${account.id}`}
            onClick={isClickable ? () => onEditClick!(account) : undefined}
            onKeyDown={
              isClickable
                ? (e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      onEditClick!(account);
                    }
                  }
                : undefined
            }
            tabIndex={isClickable ? 0 : undefined}
            role={isClickable ? "button" : undefined}
            aria-label={isClickable ? `Account ${account.name}` : undefined}
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

            {(onEditClick || (onDeactivateClick && account.is_active)) && (
              <div className={styles.cardActions}>
                {onEditClick && (
                  <button
                    type="button"
                    className={styles.editButton}
                    onClick={(e) => {
                      e.stopPropagation();
                      onEditClick(account);
                    }}
                    aria-label={`Edit ${account.name}`}
                  >
                    Edit
                  </button>
                )}
                {onDeactivateClick && account.is_active && (
                  <button
                    type="button"
                    className={styles.deactivateButton}
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeactivateClick(account);
                    }}
                    aria-label={`Deactivate ${account.name}`}
                  >
                    Deactivate
                  </button>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

