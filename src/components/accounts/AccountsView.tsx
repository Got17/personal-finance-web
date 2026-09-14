"use client";

import { useEffect, useMemo, useState } from "react";
import { Account, AccountType } from "@/lib/schemas/accounts";
import { ActionButton } from "@/components/ui/ActionButton";
import { PageHeader } from "@/components/ui/PageHeader";
import { FilterDropdown, FilterDropdownOption } from "@/components/ui/FilterDropdown";
import { CheckIcon, CloseIcon } from "@/components/financial-records/icons";
import {
  AccountSubTabs,
  AccountTab,
  accountMatchesTab,
} from "./AccountSubTabs";
import { AccountSummaryCards } from "./AccountSummaryCards";
import { AccountsTable } from "./AccountsTable";
import { CreateAccountModal } from "./CreateAccountModal";
import { EditAccountModal } from "./EditAccountModal";
import { DeactivateAccountModal } from "./DeactivateAccountModal";
import styles from "./AccountsView.module.css";

const TAB_STORAGE_KEY = "pf_accounts_active_tab";

function getInitialTab(initialTab?: AccountTab): AccountTab {
  if (
    initialTab &&
    (initialTab === "banking" ||
      initialTab === "credit" ||
      initialTab === "investment")
  ) {
    return initialTab;
  }
  if (typeof window !== "undefined") {
    try {
      const urlTab = new URLSearchParams(window.location.search).get("tab") as AccountTab | null;
      if (
        urlTab === "banking" ||
        urlTab === "credit" ||
        urlTab === "investment"
      ) {
        return urlTab;
      }
      const saved = localStorage.getItem(TAB_STORAGE_KEY) as AccountTab | null;
      if (
        saved === "banking" ||
        saved === "credit" ||
        saved === "investment"
      ) {
        return saved;
      }
    } catch {
      // Ignore storage errors
    }
  }
  return "all";
}

function SearchIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}

interface AccountsViewProps {
  initialAccounts: Account[];
  initialTab?: AccountTab;
  defaultCurrency?: string;
}

export function AccountsView({
  initialAccounts,
  initialTab,
  defaultCurrency = "USD",
}: AccountsViewProps) {
  const [accounts, setAccounts] = useState<Account[]>(initialAccounts);
  const [activeTab, setActiveTab] = useState<AccountTab>(() => getInitialTab(initialTab));
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);
  const [deactivatingAccount, setDeactivatingAccount] = useState<Account | null>(null);

  // Sub-tab counts
  const allCount = accounts.length;
  const bankingCount = useMemo(
    () => accounts.filter((acc) => accountMatchesTab(acc.type, "banking")).length,
    [accounts]
  );
  const creditCount = useMemo(
    () => accounts.filter((acc) => accountMatchesTab(acc.type, "credit")).length,
    [accounts]
  );
  const investmentCount = useMemo(
    () => accounts.filter((acc) => accountMatchesTab(acc.type, "investment")).length,
    [accounts]
  );

  // Sync active tab to URL
  useEffect(() => {
    if (typeof window === "undefined") return;
    const url = new URL(window.location.href);
    const currentTabParam = url.searchParams.get("tab");
    if (activeTab === "all" && currentTabParam) {
      url.searchParams.delete("tab");
      window.history.replaceState(null, "", url.pathname + (url.search ? url.search : ""));
    } else if (activeTab !== "all" && currentTabParam !== activeTab) {
      url.searchParams.set("tab", activeTab);
      window.history.replaceState(null, "", url.pathname + url.search);
    }
  }, [activeTab]);

  // Sync popstate for browser Back/Forward
  useEffect(() => {
    const handlePopState = () => {
      const params = new URLSearchParams(window.location.search);
      const tabParam = params.get("tab") as AccountTab | null;
      if (
        tabParam === "banking" ||
        tabParam === "credit" ||
        tabParam === "investment" ||
        tabParam === "all"
      ) {
        setActiveTab(tabParam);
      }
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  const handleTabChange = (newTab: AccountTab) => {
    setActiveTab(newTab);
    try {
      localStorage.setItem(TAB_STORAGE_KEY, newTab);
    } catch {
      // Ignore
    }
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      if (newTab === "all") {
        url.searchParams.delete("tab");
      } else {
        url.searchParams.set("tab", newTab);
      }
      window.history.replaceState(null, "", url.pathname + (url.search ? url.search : ""));
    }
  };

  const handleAccountCreated = (newAccount: Account) => {
    setAccounts((prev) => [newAccount, ...prev]);
  };

  const handleAccountUpdated = (updatedAccount: Account) => {
    setAccounts((prev) =>
      prev.map((acc) => (acc.id === updatedAccount.id ? updatedAccount : acc))
    );
  };

  const handleAccountDeactivated = (deactivatedAccount: Account) => {
    setAccounts((prev) =>
      prev.map((acc) => (acc.id === deactivatedAccount.id ? deactivatedAccount : acc))
    );
  };

  const clearFilters = () => {
    setStatusFilter("all");
    setSearchQuery("");
  };

  // Filtered accounts
  const visibleAccounts = useMemo(() => {
    return accounts.filter((acc) => {
      if (!accountMatchesTab(acc.type, activeTab)) return false;
      if (statusFilter === "active" && !acc.is_active) return false;
      if (statusFilter === "inactive" && acc.is_active) return false;
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const nameMatch = acc.name.toLowerCase().includes(query);
        const descMatch = acc.description ? acc.description.toLowerCase().includes(query) : false;
        const typeMatch = acc.type.toLowerCase().includes(query);
        const currencyMatch = acc.currency.toLowerCase().includes(query);
        return nameMatch || descMatch || typeMatch || currencyMatch;
      }
      return true;
    });
  }, [accounts, activeTab, statusFilter, searchQuery]);

  const hasSecondaryFilters = statusFilter !== "all" || searchQuery.trim() !== "";

  const actionButtonText =
    activeTab === "all"
      ? "Add Account"
      : activeTab === "banking"
      ? "Add Bank Account"
      : activeTab === "credit"
      ? "Add Credit Account"
      : "Add Investment Account";

  const actionVariant =
    activeTab === "credit" ? "expense" : activeTab === "all" ? "transaction" : "forest";

  const defaultCreateType: AccountType =
    activeTab === "banking"
      ? "checking"
      : activeTab === "credit"
      ? "credit_card"
      : activeTab === "investment"
      ? "investment"
      : "checking";

  const statusOptions: FilterDropdownOption[] = [
    { value: "all", label: "All statuses", icon: <CheckIcon /> },
    { value: "active", label: "Active only", icon: <CheckIcon /> },
    { value: "inactive", label: "Inactive only", icon: <CloseIcon /> },
  ];

  return (
    <div className={styles.container}>
      <PageHeader
        eyebrow="Workspace"
        title="Accounts"
        subtitle="Create and view bank accounts, credit cards, and investments in one place."
        action={
          <ActionButton
            variant={actionVariant}
            onClick={() => setIsCreateModalOpen(true)}
            aria-label="Add new account"
          >
            {actionButtonText}
          </ActionButton>
        }
      />

      <div
        className={styles.mainCard}
        role="tabpanel"
        id={`tabpanel-${activeTab}`}
        aria-labelledby={`tab-${activeTab}`}
      >
        <AccountSummaryCards accounts={accounts} activeTab={activeTab} />

        <div className={styles.toolbar} aria-label="Account filters">
          <div className={styles.primaryFilters}>
            <AccountSubTabs
              activeTab={activeTab}
              onTabChange={handleTabChange}
              allCount={allCount}
              bankingCount={bankingCount}
              creditCount={creditCount}
              investmentCount={investmentCount}
            />
          </div>

          <div className={styles.secondaryFilters}>
            <div className={styles.searchContainer}>
              <span className={styles.searchIcon} aria-hidden="true">
                <SearchIcon />
              </span>
              <input
                type="text"
                placeholder="Search accounts..."
                aria-label="Search accounts by name"
                className={styles.searchInput}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <FilterDropdown
              id="filter-account-status"
              label="Filter by status"
              value={statusFilter}
              options={statusOptions}
              onChange={setStatusFilter}
              defaultIcon={<CheckIcon />}
            />

            {hasSecondaryFilters && (
              <button
                type="button"
                className={styles.clearFiltersButton}
                onClick={clearFilters}
              >
                <CloseIcon />
                <span>Clear filters</span>
              </button>
            )}

            <span className={styles.countBadge}>
              {visibleAccounts.length}{" "}
              {visibleAccounts.length === 1 ? "account" : "accounts"}
            </span>
          </div>
        </div>

        <AccountsTable
          accounts={visibleAccounts}
          onEdit={(acc) => setEditingAccount(acc)}
          onDeactivate={(acc) => setDeactivatingAccount(acc)}
        />
      </div>

      <CreateAccountModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        defaultCurrency={defaultCurrency}
        defaultType={defaultCreateType}
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

