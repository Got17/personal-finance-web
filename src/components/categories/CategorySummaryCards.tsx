import { useMemo } from "react";
import { Category } from "@/lib/schemas/categories";
import { CategoryTab } from "./CategorySubTabs";
import {
  SummaryCard,
  SummaryCardsGrid,
} from "@/components/ui/SummaryCards";
import {
  InflowArrowIcon,
  OutflowArrowIcon,
  TrendingStarIcon,
} from "@/components/financial-records/summary-icons";
import { GeneralTagIcon, CheckIcon } from "@/components/financial-records/icons";

interface CategorySummaryCardsProps {
  categories: Category[];
  activeTab: CategoryTab;
}

export function CategorySummaryCards({
  categories,
  activeTab,
}: CategorySummaryCardsProps) {
  const expenseCategories = useMemo(
    () => categories.filter((c) => c.type === "expense"),
    [categories]
  );

  const incomeCategories = useMemo(
    () => categories.filter((c) => c.type === "income"),
    [categories]
  );

  const activeExpenses = useMemo(
    () => expenseCategories.filter((c) => c.is_active).length,
    [expenseCategories]
  );

  const inactiveExpenses = expenseCategories.length - activeExpenses;

  const activeIncomes = useMemo(
    () => incomeCategories.filter((c) => c.is_active).length,
    [incomeCategories]
  );

  const inactiveIncomes = incomeCategories.length - activeIncomes;

  const totalActive = activeExpenses + activeIncomes;

  if (activeTab === CategoryTab.Income) {
    return (
      <SummaryCardsGrid testId="summary-cards-income">
        <SummaryCard
          variant="inflow"
          label="Total Income"
          icon={<InflowArrowIcon />}
          value={incomeCategories.length}
          subtext={<span>Inflow classification streams</span>}
        />
        <SummaryCard
          variant="inflow"
          label="Active Streams"
          icon={<CheckIcon />}
          value={activeIncomes}
          subtext={<span>Available for transaction records</span>}
        />
        <SummaryCard
          variant="neutral"
          label="Archived Streams"
          icon={<GeneralTagIcon />}
          value={inactiveIncomes}
          subtext={<span>Deactivated historical streams</span>}
        />
      </SummaryCardsGrid>
    );
  }

  if (activeTab === CategoryTab.Expense) {
    return (
      <SummaryCardsGrid testId="summary-cards-expense">
        <SummaryCard
          variant="outflow"
          label="Total Expenses"
          icon={<OutflowArrowIcon />}
          value={expenseCategories.length}
          subtext={<span>Outflow classifications</span>}
        />
        <SummaryCard
          variant="inflow"
          label="Active Categories"
          icon={<CheckIcon />}
          value={activeExpenses}
          subtext={<span>Available for spending records</span>}
        />
        <SummaryCard
          variant="neutral"
          label="Archived Categories"
          icon={<GeneralTagIcon />}
          value={inactiveExpenses}
          subtext={<span>Deactivated historical categories</span>}
        />
      </SummaryCardsGrid>
    );
  }

  // Active tab === 'all'
  return (
    <SummaryCardsGrid testId="summary-cards-all">
      <SummaryCard
        variant="outflow"
        label="Expense Categories"
        icon={<OutflowArrowIcon />}
        value={expenseCategories.length}
        subtext={
          <span>
            {activeExpenses} active, {inactiveExpenses} inactive
          </span>
        }
      />
      <SummaryCard
        variant="inflow"
        label="Income Categories"
        icon={<InflowArrowIcon />}
        value={incomeCategories.length}
        subtext={
          <span>
            {activeIncomes} active, {inactiveIncomes} inactive
          </span>
        }
      />
      <SummaryCard
        variant="neutral"
        label="Total Classification"
        icon={<TrendingStarIcon />}
        value={categories.length}
        subtext={<span>{totalActive} active in workspace</span>}
      />
    </SummaryCardsGrid>
  );
}
