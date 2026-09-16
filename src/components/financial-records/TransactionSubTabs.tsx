import { SubTabs, TabItem } from "@/components/ui/SubTabs";

export enum TransactionTab {
  All = "all",
  Expense = "expense",
  Income = "income",
}

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
    { id: TransactionTab.All, label: "All", count: allCount, badgeVariant: "default" },
    { id: TransactionTab.Expense, label: "Expenses", count: expenseCount, badgeVariant: "expense" },
    { id: TransactionTab.Income, label: "Income", count: incomeCount, badgeVariant: "income" },
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
