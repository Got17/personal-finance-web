"use client";

import { useMemo, useState } from "react";
import { Account } from "@/lib/schemas/accounts";
import { Category } from "@/lib/schemas/categories";
import { FinancialRecord, FinancialRecordKind } from "@/lib/schemas/financial-records";
import { PlusIcon } from "./icons";
import { TransactionSubTabs } from "./TransactionSubTabs";
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
  const [activeTab, setActiveTab] = useState<FinancialRecordKind>("expense");
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("");
  const [selectedAccountId, setSelectedAccountId] = useState<string>("");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);

  const isExpense = activeTab === "expense";

  // Sub-tab record counts
  const expenseCount = useMemo(
    () => records.filter((r) => r.kind === "expense").length,
    [records]
  );
  const incomeCount = useMemo(
    () => records.filter((r) => r.kind === "income").length,
    [records]
  );

  // Filter categories matching the active sub-tab
  const relevantCategories = useMemo(
    () => categories.filter((cat) => cat.is_active && cat.type === activeTab),
    [categories, activeTab]
  );

  // Tab-specific records to calculate per-category item counts
  const tabRecords = useMemo(
    () => records.filter((r) => r.kind === activeTab),
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
      if (record.kind !== activeTab) return false;
      if (selectedCategoryId && record.category_id !== selectedCategoryId) return false;
      if (selectedAccountId && record.account_id !== selectedAccountId) return false;
      if (startDate && record.date.slice(0, 10) < startDate) return false;
      if (endDate && record.date.slice(0, 10) > endDate) return false;
      return true;
    });
  }, [records, activeTab, selectedCategoryId, selectedAccountId, startDate, endDate]);

  const handleTabChange = (newTab: FinancialRecordKind) => {
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

  const title = isExpense ? "Expenses Management" : "Income Management";
  const actionButtonText = isExpense ? "Add Expense" : "Add Income";
  const totalItemsForTab = tabRecords.length;

  return (
    <div className={styles.container}>
      <TransactionSubTabs
        activeTab={activeTab}
        onTabChange={handleTabChange}
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
            className={isExpense ? styles.addExpenseButton : styles.addIncomeButton}
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
          <span className={styles.toolbarLabel}>Filter by:</span>

          <select
            aria-label="Filter by account"
            className={styles.toolbarSelect}
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

          <input
            type="date"
            aria-label="Start date"
            className={styles.toolbarDate}
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />

          <input
            type="date"
            aria-label="End date"
            className={styles.toolbarDate}
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />

          {hasSecondaryFilters && (
            <button
              type="button"
              className={styles.clearFiltersButton}
              onClick={clearSecondaryFilters}
            >
              Clear filters
            </button>
          )}
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
        kind={activeTab}
        accounts={accounts}
        categories={categories}
        onRecordCreated={handleRecordCreated}
      />
    </div>
  );
}
