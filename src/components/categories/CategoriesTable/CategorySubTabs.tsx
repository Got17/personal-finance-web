import { SubTabs, TabItem } from "@/components/ui/navigation/SubTabs";

export enum CategoryTab {
  All = "all",
  Expense = "expense",
  Income = "income",
}

interface CategorySubTabsProps {
  readonly activeTab: CategoryTab;
  readonly onTabChange: (tab: CategoryTab) => void;
  readonly allCount: number;
  readonly expenseCount: number;
  readonly incomeCount: number;
}

export function CategorySubTabs({
  activeTab,
  onTabChange,
  allCount,
  expenseCount,
  incomeCount,
}: Readonly<CategorySubTabsProps>) {
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
