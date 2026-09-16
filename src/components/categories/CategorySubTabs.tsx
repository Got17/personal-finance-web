import { SubTabs, TabItem } from "@/components/ui/SubTabs";

export enum CategoryTab {
  All = "all",
  Expense = "expense",
  Income = "income",
}

interface CategorySubTabsProps {
  activeTab: CategoryTab;
  onTabChange: (tab: CategoryTab) => void;
  allCount: number;
  expenseCount: number;
  incomeCount: number;
}

export function CategorySubTabs({
  activeTab,
  onTabChange,
  allCount,
  expenseCount,
  incomeCount,
}: CategorySubTabsProps) {
  const tabs: TabItem<CategoryTab>[] = [
    { id: CategoryTab.All, label: "All", count: allCount, badgeVariant: "default" },
    { id: CategoryTab.Expense, label: "Expenses", count: expenseCount, badgeVariant: "expense" },
    { id: CategoryTab.Income, label: "Income", count: incomeCount, badgeVariant: "income" },
  ];

  return (
    <SubTabs
      activeTab={activeTab}
      tabs={tabs}
      onTabChange={onTabChange}
      ariaLabel="Category type sub-tabs"
    />
  );
}
