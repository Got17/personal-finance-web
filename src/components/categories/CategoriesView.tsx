"use client";

import { useEffect, useMemo, useState } from "react";
import { Category } from "@/lib/schemas/categories";
import { ActionButton } from "@/components/ui/buttons/ActionButton";
import { PageHeader } from "@/components/ui/headers/PageHeader";
import { FilterDropdown, FilterDropdownOption, StatusFilter } from "@/components/ui/dropdowns/FilterDropdown";
import { CheckIcon, CloseIcon } from "@/components/financial-records/icons";
import { CategorySubTabs, CategoryTab } from "./CategoriesTable/CategorySubTabs";
import { CategorySummaryCards } from "./CategorySummary/CategorySummaryCards";
import { CategoriesTable } from "./CategoriesTable/CategoriesTable";
import { CreateCategoryModal } from "./CategoryModals/CreateCategoryModal";
import { EditCategoryModal } from "./CategoryModals/EditCategoryModal";
import { DeactivateCategoryModal } from "./CategoryModals/DeactivateCategoryModal";
import styles from "./CategoriesView.module.css";

const TAB_STORAGE_KEY = "pf_categories_active_tab";

function getInitialTab(initialTab?: CategoryTab): CategoryTab {
  if (
    initialTab &&
    (initialTab === CategoryTab.Expense || initialTab === CategoryTab.Income)
  ) {
    return initialTab;
  }
  if (typeof window !== "undefined") {
    try {
      const urlTab = new URLSearchParams(window.location.search).get("tab") as CategoryTab | null;
      if (urlTab === CategoryTab.Expense || urlTab === CategoryTab.Income) return urlTab;
      const saved = localStorage.getItem(TAB_STORAGE_KEY) as CategoryTab | null;
      if (saved === CategoryTab.Expense || saved === CategoryTab.Income) return saved;
    } catch {
      // Ignore storage errors
    }
  }
  return CategoryTab.All;
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

export interface CategoriesViewProps {
  readonly initialTab?: CategoryTab;
  readonly initialCategories: Category[];
}

export function CategoriesView({
  initialTab,
  initialCategories,
}: Readonly<CategoriesViewProps>) {
  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [activeTab, setActiveTab] = useState<CategoryTab>(() => getInitialTab(initialTab));
  const [statusFilter, setStatusFilter] = useState<StatusFilter>(StatusFilter.All);
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
    if (activeTab === CategoryTab.All && currentTabParam) {
      url.searchParams.delete("tab");
      window.history.replaceState(null, "", url.pathname + (url.search ? url.search : ""));
    } else if (activeTab !== CategoryTab.All && currentTabParam !== activeTab) {
      url.searchParams.set("tab", activeTab);
      window.history.replaceState(null, "", url.pathname + url.search);
    }
  }, [activeTab]);

  // Sync popstate for browser Back/Forward
  useEffect(() => {
    const handlePopState = () => {
      const params = new URLSearchParams(window.location.search);
      const tabParam = params.get("tab") as CategoryTab | null;
      if (
        tabParam === CategoryTab.Expense ||
        tabParam === CategoryTab.Income ||
        tabParam === CategoryTab.All
      ) {
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
      if (newTab === CategoryTab.All) {
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
    setStatusFilter(StatusFilter.All);
    setSearchQuery("");
  };

  // Filtered categories
  const visibleCategories = useMemo(() => {
    return categories.filter((cat) => {
      if (activeTab !== CategoryTab.All && cat.type !== activeTab) return false;
      if (statusFilter === StatusFilter.Active && !cat.is_active) return false;
      if (statusFilter === StatusFilter.Inactive && cat.is_active) return false;
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        return cat.name.toLowerCase().includes(query);
      }
      return true;
    });
  }, [categories, activeTab, statusFilter, searchQuery]);

  const hasSecondaryFilters = statusFilter !== StatusFilter.All || searchQuery.trim() !== "";

  const actionVariant = activeTab === CategoryTab.Expense ? "expense" : "forest";

  const statusOptions: FilterDropdownOption[] = [
    { value: StatusFilter.All, label: "All statuses", icon: <CheckIcon /> },
    { value: StatusFilter.Active, label: "Active only", icon: <CheckIcon /> },
    { value: StatusFilter.Inactive, label: "Inactive only", icon: <CloseIcon /> },
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
            New
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
              onChange={(val) => setStatusFilter(val as StatusFilter)}
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
