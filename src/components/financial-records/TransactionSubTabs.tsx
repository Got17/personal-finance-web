import { SubTabs, TabItem } from "@/components/ui/SubTabs";

export type TransactionTab = "all" | "expense" | "income";

interface TransactionSubTabsProps {
  activeTab: TransactionTab;
  onTabChange: (tab: TransactionTab) => void;
  allCount: number;
  expenseCount: number;
  incomeCount: number;
}

export function TransactionSubTabs({
  activeTab,
  onTabChange,
  allCount,
  expenseCount,
  incomeCount,
}: TransactionSubTabsProps) {
  const tabs: TabItem<TransactionTab>[] = [
    { id: "all", label: "All", count: allCount, badgeVariant: "default" },
    { id: "expense", label: "Expenses", count: expenseCount, badgeVariant: "expense" },
    { id: "income", label: "Income", count: incomeCount, badgeVariant: "income" },
  ];

  return (
    <SubTabs
      activeTab={activeTab}
      tabs={tabs}
      onTabChange={onTabChange}
      ariaLabel="Transaction type sub-tabs"
    />
  );
}
