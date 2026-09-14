import { SubTabs, TabItem } from "@/components/ui/SubTabs";

export type CategoryTab = "all" | "expense" | "income";

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
    { id: "all", label: "All", count: allCount, badgeVariant: "default" },
    { id: "expense", label: "Expenses", count: expenseCount, badgeVariant: "expense" },
    { id: "income", label: "Income", count: incomeCount, badgeVariant: "income" },
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
