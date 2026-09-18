import { AccountType } from "@/lib/schemas/accounts";
import { SubTabs, TabItem } from "@/components/ui/navigation/SubTabs";

export enum AccountTab {
  All = "all",
  Banking = "banking",
  Investment = "investment",
}

export function getAccountTabForType(type: AccountType): AccountTab | null {
  if (type === "checking" || type === "savings" || type === "cash") {
    return AccountTab.Banking;
  }
  if (type === "investment" || type === "other") {
    return AccountTab.Investment;
  }
  return null;
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
  readonly investmentCount: number;
}

export function AccountSubTabs({
  activeTab,
  onTabChange,
  allCount,
  bankingCount,
  investmentCount,
}: Readonly<AccountSubTabsProps>) {
  const tabs: TabItem<AccountTab>[] = [
    { id: AccountTab.All, label: "All", count: allCount, badgeVariant: "default" },
    { id: AccountTab.Banking, label: "Banking", count: bankingCount, badgeVariant: "income" },
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
