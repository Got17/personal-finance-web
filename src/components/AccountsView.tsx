"use client";

import { useState } from "react";
import { Account } from "@/lib/schemas/accounts";
import { AccountsList } from "@/components/AccountsList";
import { CreateAccountModal } from "@/components/CreateAccountModal";
import styles from "./AccountsView.module.css";

interface AccountsViewProps {
  initialAccounts: Account[];
  defaultCurrency?: string;
}

export function AccountsView({ initialAccounts, defaultCurrency }: AccountsViewProps) {
  const [accounts, setAccounts] = useState<Account[]>(initialAccounts);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleAccountCreated = (newAccount: Account) => {
    setAccounts((prev) => [newAccount, ...prev]);
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
          onClick={() => setIsModalOpen(true)}
          aria-label="Add new account"
        >
          + Add Account
        </button>
      </div>

      <section aria-label="Accounts list">
        <AccountsList accounts={accounts} onAddClick={() => setIsModalOpen(true)} />
      </section>

      <CreateAccountModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        defaultCurrency={defaultCurrency}
        onAccountCreated={handleAccountCreated}
      />
    </div>
  );
}
