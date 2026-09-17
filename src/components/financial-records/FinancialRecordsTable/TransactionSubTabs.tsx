import { SubTabs, TabItem } from "@/components/ui/navigation/SubTabs";

export enum TransactionTab {
  All = "all",
  Expense = "expense",
  Income = "income",
  Transfer = "transfer",
}

interface TransactionSubTabsProps {
  activeTab: TransactionTab;
  onTabChange: (tab: TransactionTab) => void;
  allCount: number;
  expenseCount: number;
  incomeCount: number;
  transferCount?: number;
}

export function TransactionSubTabs({
  activeTab,
  onTabChange,
  allCount,
  expenseCount,
  incomeCount,
  transferCount = 0,
}: Readonly<TransactionSubTabsProps>) {
  const tabs: TabItem<TransactionTab>[] = [
    { id: TransactionTab.All, label: "All", count: allCount, badgeVariant: "default" },
    { id: TransactionTab.Expense, label: "Expenses", count: expenseCount, badgeVariant: "expense" },
    { id: TransactionTab.Income, label: "Income", count: incomeCount, badgeVariant: "income" },
    { id: TransactionTab.Transfer, label: "Transfers", count: transferCount, badgeVariant: "default" },
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
