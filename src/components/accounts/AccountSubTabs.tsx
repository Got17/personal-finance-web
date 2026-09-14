import { AccountType } from "@/lib/schemas/accounts";
import { SubTabs, TabItem } from "@/components/ui/SubTabs";

export type AccountTab = "all" | "banking" | "credit" | "investment";

export function getAccountTabForType(type: AccountType): AccountTab {
  if (type === "checking" || type === "savings" || type === "cash") {
    return "banking";
  }
  if (type === "credit_card" || type === "loan") {
    return "credit";
  }
  return "investment";
}

export function accountMatchesTab(type: AccountType, tab: AccountTab): boolean {
  if (tab === "all") return true;
  return getAccountTabForType(type) === tab;
}

interface AccountSubTabsProps {
  activeTab: AccountTab;
  onTabChange: (tab: AccountTab) => void;
  allCount: number;
  bankingCount: number;
  creditCount: number;
  investmentCount: number;
}

export function AccountSubTabs({
  activeTab,
  onTabChange,
  allCount,
  bankingCount,
  creditCount,
  investmentCount,
}: AccountSubTabsProps) {
  const tabs: TabItem<AccountTab>[] = [
    { id: "all", label: "All", count: allCount, badgeVariant: "default" },
    { id: "banking", label: "Banking", count: bankingCount, badgeVariant: "income" },
    { id: "credit", label: "Credit & Loans", count: creditCount, badgeVariant: "expense" },
    { id: "investment", label: "Investments", count: investmentCount, badgeVariant: "default" },
  ];

  return (
    <SubTabs
      activeTab={activeTab}
      tabs={tabs}
      onTabChange={onTabChange}
      ariaLabel="Account classification sub-tabs"
    />
  );
}
