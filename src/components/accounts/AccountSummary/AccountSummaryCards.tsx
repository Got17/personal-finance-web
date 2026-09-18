import { useMemo } from "react";
import { Account } from "@/lib/schemas/accounts";
import { AccountTab, getAccountTabForType } from "../AccountsTable/AccountSubTabs";
import { SummaryCardsGrid, SummaryCard } from "@/components/ui/cards/SummaryCards";
import {
  InflowArrowIcon,
  TrendingStarIcon,
} from "@/components/financial-records/summary-icons";
import { CheckIcon, WalletIcon } from "@/components/financial-records/icons";

interface AccountSummaryCardsProps {
  readonly accounts: Account[];
  readonly activeTab: AccountTab;
}

export function AccountSummaryCards({
  accounts,
  activeTab,
}: Readonly<AccountSummaryCardsProps>) {
  const bankingAccounts = useMemo(
    () => accounts.filter((a) => getAccountTabForType(a.type) === AccountTab.Banking),
    [accounts]
  );

  const investmentAccounts = useMemo(
    () => accounts.filter((a) => getAccountTabForType(a.type) === AccountTab.Investment),
    [accounts]
  );

  const totalActive = useMemo(
    () => accounts.filter((a) => a.is_active).length,
    [accounts]
  );

  const activeBanking = useMemo(
    () => bankingAccounts.filter((a) => a.is_active).length,
    [bankingAccounts]
  );

  const activeInvestment = useMemo(
    () => investmentAccounts.filter((a) => a.is_active).length,
    [investmentAccounts]
  );

  const uniqueCurrencies = useMemo(() => {
    const set = new Set(accounts.map((a) => a.currency));
    return set.size;
  }, [accounts]);

  if (activeTab === AccountTab.Banking) {
    return (
      <SummaryCardsGrid testId="summary-cards-banking">
        <SummaryCard
          variant="inflow"
          label="Banking Accounts"
          icon={<InflowArrowIcon />}
          value={bankingAccounts.length}
          subtext={<span>Checking, savings, and cash accounts</span>}
        />
        <SummaryCard
          variant="inflow"
          label="Active Accounts"
          icon={<CheckIcon />}
          value={activeBanking}
          subtext={<span>Available for transaction records</span>}
        />
        <SummaryCard
          variant="neutral"
          label="Currencies"
          icon={<WalletIcon />}
          value={uniqueCurrencies}
          subtext={<span>{uniqueCurrencies === 1 ? "Active currency" : "Active currencies"}</span>}
        />
      </SummaryCardsGrid>
    );
  }

  if (activeTab === AccountTab.Investment) {
    return (
      <SummaryCardsGrid testId="summary-cards-investment">
        <SummaryCard
          variant="highlight"
          label="Investments & Assets"
          icon={<TrendingStarIcon />}
          value={investmentAccounts.length}
          subtext={<span>Brokerages and other holdings</span>}
        />
        <SummaryCard
          variant="highlight"
          label="Active Accounts"
          icon={<CheckIcon />}
          value={activeInvestment}
          subtext={<span>Tracked asset portfolios</span>}
        />
        <SummaryCard
          variant="neutral"
          label="Currencies"
          icon={<WalletIcon />}
          value={uniqueCurrencies}
          subtext={<span>{uniqueCurrencies === 1 ? "Active currency" : "Active currencies"}</span>}
        />
      </SummaryCardsGrid>
    );
  }

  // Active tab === 'all'
  return (
    <SummaryCardsGrid testId="summary-cards-all">
      <SummaryCard
        variant="inflow"
        label="Banking Accounts"
        icon={<InflowArrowIcon />}
        value={bankingAccounts.length}
        subtext={<span>{activeBanking} active liquid accounts</span>}
      />
      <SummaryCard
        variant="highlight"
        label="Investments & Assets"
        icon={<TrendingStarIcon />}
        value={investmentAccounts.length}
        subtext={<span>{activeInvestment} active investment accounts</span>}
      />
      <SummaryCard
        variant="neutral"
        label="Total Accounts"
        icon={<WalletIcon />}
        value={accounts.length}
        subtext={<span>{totalActive} of {accounts.length} active in workspace</span>}
      />
    </SummaryCardsGrid>
  );
}
