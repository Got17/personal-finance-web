"use client";

import { useState } from "react";
import { Account } from "@/lib/schemas/accounts";
import { AccountsList } from "./AccountsList";
import { CreateAccountModal } from "./CreateAccountModal";
import { EditAccountModal } from "./EditAccountModal";
import { DeactivateAccountModal } from "./DeactivateAccountModal";
import styles from "./AccountsView.module.css";

interface AccountsViewProps {
  initialAccounts: Account[];
  defaultCurrency?: string;
}

export function AccountsView({ initialAccounts, defaultCurrency }: AccountsViewProps) {
  const [accounts, setAccounts] = useState<Account[]>(initialAccounts);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);
  const [deactivatingAccount, setDeactivatingAccount] = useState<Account | null>(null);

  const handleAccountCreated = (newAccount: Account) => {
    setAccounts((prev) => [newAccount, ...prev]);
  };

  const handleAccountUpdated = (updatedAccount: Account) => {
    setAccounts((prev) =>
      prev.map((acc) => (acc.id === updatedAccount.id ? updatedAccount : acc)),
    );
  };

  const handleAccountDeactivated = (deactivatedAccount: Account) => {
    setAccounts((prev) =>
      prev.map((acc) => (acc.id === deactivatedAccount.id ? deactivatedAccount : acc)),
    );
  };

  return (
    <div className={styles.viewContainer}>
      <div className={styles.headerRow}>
        <div className={styles.titleGroup}>
          <h2 className={styles.sectionTitle}>Your Accounts</h2>
          <span className={styles.accountCount}>
            {accounts.length} {accounts.length === 1 ? "account" : "accounts"}
          </span>
        </div>
        <button
          type="button"
          className={styles.addButton}
          onClick={() => setIsCreateModalOpen(true)}
          aria-label="Add new account"
        >
          + Add Account
        </button>
      </div>

      <section aria-label="Accounts list">
        <AccountsList
          accounts={accounts}
          onAddClick={() => setIsCreateModalOpen(true)}
          onEditClick={(acc) => setEditingAccount(acc)}
          onDeactivateClick={(acc) => setDeactivatingAccount(acc)}
        />
      </section>

      <CreateAccountModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        defaultCurrency={defaultCurrency}
        onAccountCreated={handleAccountCreated}
      />

      <EditAccountModal
        isOpen={editingAccount !== null}
        account={editingAccount}
        onClose={() => setEditingAccount(null)}
        onAccountUpdated={handleAccountUpdated}
      />

      <DeactivateAccountModal
        isOpen={deactivatingAccount !== null}
        account={deactivatingAccount}
        onClose={() => setDeactivatingAccount(null)}
        onAccountDeactivated={handleAccountDeactivated}
      />
    </div>
  );
}

