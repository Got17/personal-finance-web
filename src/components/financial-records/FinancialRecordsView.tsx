"use client";

import { useMemo, useState } from "react";
import { Account } from "@/lib/schemas/accounts";
import { Category } from "@/lib/schemas/categories";
import { FinancialRecord } from "@/lib/schemas/financial-records";
import {
  CalendarIcon,
  ChevronDownIcon,
  CloseIcon,
  PlusIcon,
  WalletIcon,
} from "./icons";
import { TransactionSubTabs, TransactionTab } from "./TransactionSubTabs";
import { CategoryPillFilter } from "./CategoryPillFilter";
import { FinancialRecordsTable } from "./FinancialRecordsTable";
import { CreateFinancialRecordModal } from "./CreateFinancialRecordModal";
import styles from "./FinancialRecordsView.module.css";

interface Props {
  initialRecords: FinancialRecord[];
  accounts: Account[];
  categories: Category[];
}

export function FinancialRecordsView({ initialRecords, accounts, categories }: Props) {
  const [records, setRecords] = useState<FinancialRecord[]>(initialRecords);
  const [activeTab, setActiveTab] = useState<TransactionTab>("all");
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("");
  const [selectedAccountId, setSelectedAccountId] = useState<string>("");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);

  // Sub-tab record counts
  const allCount = records.length;
  const expenseCount = useMemo(
    () => records.filter((r) => r.kind === "expense").length,
    [records]
  );
  const incomeCount = useMemo(
    () => records.filter((r) => r.kind === "income").length,
    [records]
  );

  // Filter categories matching the active sub-tab (or all active categories if on 'all')
  const relevantCategories = useMemo(
    () =>
      categories.filter(
        (cat) => cat.is_active && (activeTab === "all" || cat.type === activeTab)
      ),
    [categories, activeTab]
  );

  // Tab-specific records to calculate per-category item counts
  const tabRecords = useMemo(
    () => (activeTab === "all" ? records : records.filter((r) => r.kind === activeTab)),
    [records, activeTab]
  );

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const record of tabRecords) {
      counts[record.category_id] = (counts[record.category_id] || 0) + 1;
    }
    return counts;
  }, [tabRecords]);

  // Filter visible records based on category, account, and date range
  const visibleRecords = useMemo(() => {
    return records.filter((record) => {
      if (activeTab !== "all" && record.kind !== activeTab) return false;
      if (selectedCategoryId && record.category_id !== selectedCategoryId) return false;
      if (selectedAccountId && record.account_id !== selectedAccountId) return false;
      if (startDate && record.date.slice(0, 10) < startDate) return false;
      if (endDate && record.date.slice(0, 10) > endDate) return false;
      return true;
    });
  }, [records, activeTab, selectedCategoryId, selectedAccountId, startDate, endDate]);

  const handleTabChange = (newTab: TransactionTab) => {
    setActiveTab(newTab);
    setSelectedCategoryId("");
  };

  const handleRecordCreated = (newRecord: FinancialRecord) => {
    setRecords((current) => [newRecord, ...current]);
  };

  const hasSecondaryFilters = selectedAccountId || startDate || endDate;
  const clearSecondaryFilters = () => {
    setSelectedAccountId("");
    setStartDate("");
    setEndDate("");
  };

  const title =
    activeTab === "all"
      ? "Transactions Management"
      : activeTab === "expense"
      ? "Expenses Management"
      : "Income Management";

  const actionButtonText =
    activeTab === "all"
      ? "Add Transaction"
      : activeTab === "expense"
      ? "Add Expense"
      : "Add Income";

  const buttonStyle =
    activeTab === "all"
      ? styles.addTransactionButton
      : activeTab === "expense"
      ? styles.addExpenseButton
      : styles.addIncomeButton;

  const totalItemsForTab = tabRecords.length;

  return (
    <div className={styles.container}>
      <TransactionSubTabs
        activeTab={activeTab}
        onTabChange={handleTabChange}
        allCount={allCount}
        expenseCount={expenseCount}
        incomeCount={incomeCount}
      />

      <div
        className={styles.mainCard}
        role="tabpanel"
        id={`tabpanel-${activeTab}`}
        aria-labelledby={`tab-${activeTab}`}
      >
        <header className={styles.headerRow}>
          <div className={styles.titleArea}>
            <div className={styles.titleWithBadge}>
              <h2 className={styles.title}>{title}</h2>
              <span className={styles.countBadge}>{totalItemsForTab} items</span>
            </div>
            <p className={styles.subtitle}>Filter by all categories or edit transactions</p>
          </div>

          <button
            type="button"
            className={buttonStyle}
            onClick={() => setIsCreateModalOpen(true)}
          >
            <PlusIcon />
            <span>{actionButtonText}</span>
          </button>
        </header>

        <CategoryPillFilter
          categories={relevantCategories}
          categoryCounts={categoryCounts}
          selectedCategoryId={selectedCategoryId}
          totalCount={totalItemsForTab}
          onSelectCategory={setSelectedCategoryId}
        />

        <div className={styles.secondaryToolbar} aria-label="Secondary filters">
          <div className={styles.filterControls}>
            <div className={styles.accountSelectWrapper}>
              <span className={styles.selectIcon}>
                <WalletIcon />
              </span>
              <select
                aria-label="Filter by account"
                className={styles.accountSelect}
                value={selectedAccountId}
                onChange={(e) => setSelectedAccountId(e.target.value)}
              >
                <option value="">All accounts</option>
                {accounts.map((acc) => (
                  <option key={acc.id} value={acc.id}>
                    {acc.name}
                  </option>
                ))}
              </select>
              <span className={styles.selectChevron}>
                <ChevronDownIcon />
              </span>
            </div>

            <div className={styles.dateRangeCapsule}>
              <span className={styles.dateIcon}>
                <CalendarIcon />
              </span>
              <span className={styles.dateLabel}>From</span>
              <input
                type="date"
                aria-label="Start date"
                className={styles.dateInput}
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
              <span className={styles.dateDivider}>–</span>
              <span className={styles.dateLabel}>To</span>
              <input
                type="date"
                aria-label="End date"
                className={styles.dateInput}
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>

            {hasSecondaryFilters && (
              <button
                type="button"
                className={styles.clearFiltersButton}
                onClick={clearSecondaryFilters}
              >
                <CloseIcon />
                <span>Clear filters</span>
              </button>
            )}
          </div>
        </div>

        <FinancialRecordsTable
          records={visibleRecords}
          accounts={accounts}
          categories={categories}
        />
      </div>

      <CreateFinancialRecordModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        defaultKind={activeTab === "income" ? "income" : "expense"}
        allowKindSelection={activeTab === "all"}
        accounts={accounts}
        categories={categories}
        onRecordCreated={handleRecordCreated}
      />
    </div>
  );
}
