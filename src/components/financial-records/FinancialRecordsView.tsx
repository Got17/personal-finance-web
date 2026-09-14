"use client";

import { useEffect, useMemo, useState } from "react";
import { Account } from "@/lib/schemas/accounts";
import { Category } from "@/lib/schemas/categories";
import { FinancialRecord } from "@/lib/schemas/financial-records";
import {
  CalendarIcon,
  CloseIcon,
  GeneralTagIcon,
  WalletIcon,
  getCategoryIcon,
} from "./icons";
import { ActionButton } from "@/components/ui/ActionButton";
import { TransactionSubTabs, TransactionTab } from "./TransactionSubTabs";
import { FinancialRecordsTable } from "./FinancialRecordsTable";
import { CreateFinancialRecordModal } from "./CreateFinancialRecordModal";
import { EditFinancialRecordModal } from "./EditFinancialRecordModal";
import { DeleteFinancialRecordModal } from "./DeleteFinancialRecordModal";
import { FilterDropdown, FilterDropdownOption } from "./FilterDropdown";
import { CashFlowSummaryCards } from "./CashFlowSummaryCards";
import { DatePreset, getDateRangeForPreset } from "./date-filter-utils";
import styles from "./FinancialRecordsView.module.css";

export type { DatePreset } from "./date-filter-utils";

const TAB_STORAGE_KEY = "pf_transactions_active_tab";

function getInitialTab(initialTab?: TransactionTab): TransactionTab {
  if (initialTab && (initialTab === "expense" || initialTab === "income")) return initialTab;
  if (typeof window !== "undefined") {
    try {
      const urlTab = new URLSearchParams(window.location.search).get("tab") as TransactionTab | null;
      if (urlTab === "expense" || urlTab === "income") return urlTab;
      const saved = localStorage.getItem(TAB_STORAGE_KEY) as TransactionTab | null;
      if (saved === "expense" || saved === "income") return saved;
    } catch {
      // Ignore
    }
  }
  return "all";
}

interface Props {
  initialTab?: TransactionTab;
  initialRecords: FinancialRecord[];
  accounts: Account[];
  categories: Category[];
}

export function FinancialRecordsView({
  initialTab,
  initialRecords,
  accounts,
  categories,
}: Props) {
  const [records, setRecords] = useState<FinancialRecord[]>(initialRecords);
  const [activeTab, setActiveTab] = useState<TransactionTab>(() => getInitialTab(initialTab));
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("");
  const [selectedAccountId, setSelectedAccountId] = useState<string>("");
  const [datePreset, setDatePreset] = useState<DatePreset>("all");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
  const [editingRecord, setEditingRecord] = useState<FinancialRecord | null>(null);
  const [deletingRecord, setDeletingRecord] = useState<FinancialRecord | null>(null);

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

  const selectedCategory = useMemo(
    () => relevantCategories.find((cat) => cat.id === selectedCategoryId),
    [relevantCategories, selectedCategoryId]
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

  const totalItemsForTab = tabRecords.length;

  const dateOptions: FilterDropdownOption[] = [
    { value: "all", label: "All dates", icon: <CalendarIcon /> },
    { value: "this-month", label: "This month", icon: <CalendarIcon /> },
    { value: "last-month", label: "Last month", icon: <CalendarIcon /> },
    { value: "last-30-days", label: "Last 30 days", icon: <CalendarIcon /> },
    { value: "this-year", label: "This year", icon: <CalendarIcon /> },
    { value: "custom", label: "Custom range...", icon: <CalendarIcon /> },
  ];

  const accountOptions: FilterDropdownOption[] = useMemo(
    () => [
      { value: "", label: "All accounts", icon: <WalletIcon /> },
      ...accounts.map((acc) => ({
        value: acc.id,
        label: acc.name,
        icon: <WalletIcon />,
      })),
    ],
    [accounts]
  );

  const categoryOptions: FilterDropdownOption[] = useMemo(
    () => [
      {
        value: "",
        label: "All categories",
        count: totalItemsForTab,
        icon: <GeneralTagIcon />,
      },
      ...relevantCategories.map((cat) => ({
        value: cat.id,
        label: cat.name,
        count: categoryCounts[cat.id] || 0,
        icon: getCategoryIcon(cat.name),
      })),
    ],
    [relevantCategories, totalItemsForTab, categoryCounts]
  );

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

  // Synchronize active tab to URL if different from current query parameter
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

  // Sync state if user clicks browser Back / Forward buttons
  useEffect(() => {
    const handlePopState = () => {
      const params = new URLSearchParams(window.location.search);
      const tabParam = params.get("tab") as TransactionTab | null;
      if (tabParam === "expense" || tabParam === "income" || tabParam === "all") {
        setActiveTab(tabParam);
      }
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  const handleTabChange = (newTab: TransactionTab) => {
    setActiveTab(newTab);
    setSelectedCategoryId("");
    try {
      localStorage.setItem(TAB_STORAGE_KEY, newTab);
    } catch {
      // Ignore storage errors
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

  const handleRecordCreated = (newRecord: FinancialRecord) => setRecords((c) => [newRecord, ...c]);
  const handleRecordUpdated = (upd: FinancialRecord) => setRecords((c) => c.map((i) => (i.id === upd.id ? upd : i)));
  const handleRecordDeleted = (del: FinancialRecord) => setRecords((c) => c.filter((i) => i.id !== del.id));

  const handleDatePresetChange = (preset: DatePreset) => {
    setDatePreset(preset);
    const range = getDateRangeForPreset(preset);
    setStartDate(range.startDate);
    setEndDate(range.endDate);
  };

  const hasSecondaryFilters =
    Boolean(selectedCategoryId) ||
    Boolean(selectedAccountId) ||
    datePreset !== "all" ||
    Boolean(startDate) ||
    Boolean(endDate);

  const clearSecondaryFilters = () => {
    setSelectedCategoryId("");
    setSelectedAccountId("");
    setDatePreset("all");
    setStartDate("");
    setEndDate("");
  };

  const title =
    activeTab === "all" ? "Transactions Management" : activeTab === "expense" ? "Expenses Management" : "Income Management";
  const actionButtonText =
    activeTab === "all" ? "Add Transaction" : activeTab === "expense" ? "Add Expense" : "Add Income";
  const actionVariant =
    activeTab === "all" ? "transaction" : activeTab === "expense" ? "expense" : "forest";

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

          <ActionButton
            className={styles.headerActionButton}
            variant={actionVariant}
            onClick={() => setIsCreateModalOpen(true)}
          >
            {actionButtonText}
          </ActionButton>
        </header>

        <CashFlowSummaryCards
          records={visibleRecords}
          categories={categories}
          activeTab={activeTab}
        />

        <div className={styles.secondaryToolbar} aria-label="Secondary filters">
          <div className={styles.filterControls}>
            <FilterDropdown
              id="filter-date"
              label="Filter by date range"
              value={datePreset}
              options={dateOptions}
              onChange={(val) => handleDatePresetChange(val as DatePreset)}
              defaultIcon={<CalendarIcon />}
            />

            {datePreset === "custom" && (
              <div className={styles.customDateRange}>
                <span className={styles.customDateLabel}>From</span>
                <input
                  type="date"
                  aria-label="Start date"
                  className={styles.customDateInput}
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
                <span className={styles.dateDivider}>–</span>
                <span className={styles.customDateLabel}>To</span>
                <input
                  type="date"
                  aria-label="End date"
                  className={styles.customDateInput}
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
            )}

            <FilterDropdown
              id="filter-account"
              label="Filter by account"
              value={selectedAccountId}
              options={accountOptions}
              onChange={setSelectedAccountId}
              defaultIcon={<WalletIcon />}
            />

            <FilterDropdown
              id="filter-category"
              label="Filter by category"
              value={selectedCategoryId}
              options={categoryOptions}
              onChange={setSelectedCategoryId}
              defaultIcon={<GeneralTagIcon />}
              activeIcon={
                selectedCategory ? getCategoryIcon(selectedCategory.name) : undefined
              }
            />

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
          onEdit={(record) => setEditingRecord(record)}
          onDelete={(record) => setDeletingRecord(record)}
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

      <EditFinancialRecordModal
        isOpen={editingRecord !== null}
        record={editingRecord}
        accounts={accounts}
        categories={categories}
        onClose={() => setEditingRecord(null)}
        onRecordUpdated={handleRecordUpdated}
      />

      <DeleteFinancialRecordModal
        isOpen={deletingRecord !== null}
        record={deletingRecord}
        accounts={accounts}
        categories={categories}
        onClose={() => setDeletingRecord(null)}
        onRecordDeleted={handleRecordDeleted}
      />
    </div>
  );
}
