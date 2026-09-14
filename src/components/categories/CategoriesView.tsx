"use client";

import { useEffect, useMemo, useState } from "react";
import { Category } from "@/lib/schemas/categories";
import { ActionButton } from "@/components/ui/ActionButton";
import { PageHeader } from "@/components/ui/PageHeader";
import { FilterDropdown, FilterDropdownOption } from "@/components/ui/FilterDropdown";
import { CheckIcon, CloseIcon } from "@/components/financial-records/icons";
import { CategorySubTabs, CategoryTab } from "./CategorySubTabs";
import { CategorySummaryCards } from "./CategorySummaryCards";
import { CategoriesTable } from "./CategoriesTable";
import { CreateCategoryModal } from "./CreateCategoryModal";
import { EditCategoryModal } from "./EditCategoryModal";
import { DeactivateCategoryModal } from "./DeactivateCategoryModal";
import styles from "./CategoriesView.module.css";

const TAB_STORAGE_KEY = "pf_categories_active_tab";

function getInitialTab(initialTab?: CategoryTab): CategoryTab {
  if (initialTab && (initialTab === "expense" || initialTab === "income")) return initialTab;
  if (typeof window !== "undefined") {
    try {
      const urlTab = new URLSearchParams(window.location.search).get("tab") as CategoryTab | null;
      if (urlTab === "expense" || urlTab === "income") return urlTab;
      const saved = localStorage.getItem(TAB_STORAGE_KEY) as CategoryTab | null;
      if (saved === "expense" || saved === "income") return saved;
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

interface CategoriesViewProps {
  initialCategories: Category[];
  initialTab?: CategoryTab;
}

export function CategoriesView({
  initialCategories,
  initialTab,
}: CategoriesViewProps) {
  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [activeTab, setActiveTab] = useState<CategoryTab>(() => getInitialTab(initialTab));
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [deactivatingCategory, setDeactivatingCategory] = useState<Category | null>(null);

  // Sub-tab counts
  const allCount = categories.length;
  const expenseCount = useMemo(
    () => categories.filter((c) => c.type === "expense").length,
    [categories]
  );
  const incomeCount = useMemo(
    () => categories.filter((c) => c.type === "income").length,
    [categories]
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
      const tabParam = params.get("tab") as CategoryTab | null;
      if (tabParam === "expense" || tabParam === "income" || tabParam === "all") {
        setActiveTab(tabParam);
      }
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  const handleTabChange = (newTab: CategoryTab) => {
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

  const handleCategoryCreated = (newCategory: Category) => {
    setCategories((prev) => [newCategory, ...prev]);
  };

  const handleCategoryUpdated = (updatedCategory: Category) => {
    setCategories((prev) =>
      prev.map((cat) => (cat.id === updatedCategory.id ? updatedCategory : cat))
    );
  };

  const handleCategoryDeactivated = (deactivatedCategory: Category) => {
    setCategories((prev) =>
      prev.map((cat) => (cat.id === deactivatedCategory.id ? deactivatedCategory : cat))
    );
  };

  const clearFilters = () => {
    setStatusFilter("all");
    setSearchQuery("");
  };

  // Filtered categories
  const visibleCategories = useMemo(() => {
    return categories.filter((cat) => {
      if (activeTab !== "all" && cat.type !== activeTab) return false;
      if (statusFilter === "active" && !cat.is_active) return false;
      if (statusFilter === "inactive" && cat.is_active) return false;
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        return cat.name.toLowerCase().includes(query);
      }
      return true;
    });
  }, [categories, activeTab, statusFilter, searchQuery]);

  const hasSecondaryFilters = statusFilter !== "all" || searchQuery.trim() !== "";

  const actionButtonText =
    activeTab === "all"
      ? "Add Category"
      : activeTab === "expense"
      ? "Add Expense Category"
      : "Add Income Category";

  const actionVariant =
    activeTab === "all" ? "transaction" : activeTab === "expense" ? "expense" : "forest";

  const statusOptions: FilterDropdownOption[] = [
    { value: "all", label: "All statuses", icon: <CheckIcon /> },
    { value: "active", label: "Active only", icon: <CheckIcon /> },
    { value: "inactive", label: "Inactive only", icon: <CloseIcon /> },
  ];

  return (
    <div className={styles.container}>
      <PageHeader
        eyebrow="Structure"
        title="Categories"
        subtitle="Create and view your income and expense categories to organize your personal finances."
        action={
          <ActionButton
            variant={actionVariant}
            onClick={() => setIsCreateModalOpen(true)}
            aria-label="Add new category"
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
        <CategorySummaryCards categories={categories} activeTab={activeTab} />

        <div className={styles.toolbar} aria-label="Category filters">
          <div className={styles.primaryFilters}>
            <CategorySubTabs
              activeTab={activeTab}
              onTabChange={handleTabChange}
              allCount={allCount}
              expenseCount={expenseCount}
              incomeCount={incomeCount}
            />
          </div>

          <div className={styles.secondaryFilters}>
            <div className={styles.searchContainer}>
              <span className={styles.searchIcon} aria-hidden="true">
                <SearchIcon />
              </span>
              <input
                type="text"
                placeholder="Search categories..."
                aria-label="Search categories by name"
                className={styles.searchInput}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <FilterDropdown
              id="filter-category-status"
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
              {visibleCategories.length}{" "}
              {visibleCategories.length === 1 ? "category" : "categories"}
            </span>
          </div>
        </div>

        <CategoriesTable
          categories={visibleCategories}
          onEdit={(cat) => setEditingCategory(cat)}
          onDeactivate={(cat) => setDeactivatingCategory(cat)}
        />
      </div>

      <CreateCategoryModal
        isOpen={isCreateModalOpen}
        defaultType={activeTab === "income" ? "income" : "expense"}
        onClose={() => setIsCreateModalOpen(false)}
        onCategoryCreated={handleCategoryCreated}
      />

      <EditCategoryModal
        isOpen={editingCategory !== null}
        category={editingCategory}
        onClose={() => setEditingCategory(null)}
        onCategoryUpdated={handleCategoryUpdated}
      />

      <DeactivateCategoryModal
        isOpen={deactivatingCategory !== null}
        category={deactivatingCategory}
        onClose={() => setDeactivatingCategory(null)}
        onCategoryDeactivated={handleCategoryDeactivated}
      />
    </div>
  );
}
