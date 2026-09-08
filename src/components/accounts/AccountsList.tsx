import { Account } from "@/lib/schemas/accounts";
import { EmptyState } from "@/components/ui/EmptyState";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { CardActions } from "@/components/ui/CardActions";
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
      <EmptyState
        title="No accounts created yet"
        description="Add your first bank account, savings account, or investment portfolio to start tracking your finances."
        actionLabel={onAddClick ? "+ Add Account" : undefined}
        onAction={onAddClick}
      />
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
              <StatusBadge isActive={account.is_active} />
            </div>

            <CardActions
              onEdit={onEditClick ? () => onEditClick(account) : undefined}
              onDeactivate={onDeactivateClick ? () => onDeactivateClick(account) : undefined}
              canDeactivate={account.is_active}
              editAriaLabel={`Edit ${account.name}`}
              deactivateAriaLabel={`Deactivate ${account.name}`}
            />
          </div>
        );
      })}
    </div>
  );
}
