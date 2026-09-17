import { AccountType } from "@/lib/schemas/accounts";
import { SubTabs, TabItem } from "@/components/ui/navigation/SubTabs";

export enum AccountTab {
  All = "all",
  Banking = "banking",
  Credit = "credit",
  Investment = "investment",
}

export function getAccountTabForType(type: AccountType): AccountTab {
  if (type === "checking" || type === "savings" || type === "cash") {
    return AccountTab.Banking;
  }
  if (type === "credit_card" || type === "loan") {
    return AccountTab.Credit;
  }
  return AccountTab.Investment;
}

export function accountMatchesTab(type: AccountType, tab: AccountTab): boolean {
  if (tab === AccountTab.All) return true;
  return getAccountTabForType(type) === tab;
}

interface AccountSubTabsProps {
  readonly activeTab: AccountTab;
  readonly onTabChange: (tab: AccountTab) => void;
  readonly allCount: number;
  readonly bankingCount: number;
  readonly creditCount: number;
  readonly investmentCount: number;
}

export function AccountSubTabs({
  activeTab,
  onTabChange,
  allCount,
  bankingCount,
  creditCount,
  investmentCount,
}: Readonly<AccountSubTabsProps>) {
  const tabs: TabItem<AccountTab>[] = [
    { id: AccountTab.All, label: "All", count: allCount, badgeVariant: "default" },
    { id: AccountTab.Banking, label: "Banking", count: bankingCount, badgeVariant: "income" },
    { id: AccountTab.Credit, label: "Credit & Loans", count: creditCount, badgeVariant: "expense" },
    { id: AccountTab.Investment, label: "Investments", count: investmentCount, badgeVariant: "default" },
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
