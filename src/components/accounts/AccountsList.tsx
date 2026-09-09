import { Account } from "@/lib/schemas/accounts";
import { EmptyState } from "@/components/ui/EmptyState";
import { ItemCard } from "@/components/ui/ItemCard";
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
        const subtitle = `${formattedType} • ${account.currency}`;

        return (
          <ItemCard
            key={account.id}
            id={account.id}
            testId={`account-card-${account.id}`}
            title={account.name}
            icon={mark}
            subtitle={subtitle}
            description={account.description}
            isActive={account.is_active}
            onEdit={onEditClick ? () => onEditClick(account) : undefined}
            onDeactivate={onDeactivateClick ? () => onDeactivateClick(account) : undefined}
            editAriaLabel={`Edit ${account.name}`}
            deactivateAriaLabel={`Deactivate ${account.name}`}
          />
        );
      })}
    </div>
  );
}
