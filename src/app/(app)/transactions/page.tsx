import { redirect } from "next/navigation";
import { getSessionToken } from "@/lib/session";
import { getAccounts } from "@/lib/accounts-service";
import { getCategories } from "@/lib/categories-service";
import { getFinancialRecords } from "@/lib/financial-records-service";
import { PageHeader } from "@/components/ui/PageHeader";
import { FinancialRecordsView } from "@/components/financial-records/FinancialRecordsView";
import { TransactionTab } from "@/components/financial-records/FinancialRecordsTable/TransactionSubTabs";
import styles from "./page.module.css";

interface PageProps {
  searchParams?: Promise<{ tab?: string }>;
}

export default async function TransactionsPage({ searchParams }: PageProps = {}) {
  const token = await getSessionToken();
  if (!token) {
    redirect("/login");
    return null;
  }

  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const tabParam = resolvedSearchParams?.tab;
  const initialTab: TransactionTab =
    tabParam === TransactionTab.Expense || tabParam === TransactionTab.Income
      ? tabParam
      : TransactionTab.All;

  const [accounts, categories, records] = await Promise.all([
    getAccounts(token),
    getCategories(token),
    getFinancialRecords(token),
  ]);

  return (
    <main className={styles.page}>
      {!accounts.success || !categories.success || !records.success ? (
        <>
          <PageHeader
            eyebrow="Cash flow"
            title="Transactions"
            subtitle="Record income and spending in the currency it happened."
          />
          <p role="alert" className={styles.error}>
            We could not load your transaction workspace. Please refresh and try again.
          </p>
        </>
      ) : (
        <FinancialRecordsView
          initialTab={initialTab}
          initialRecords={records.records}
          accounts={accounts.accounts}
          categories={categories.categories}
        />
      )}
    </main>
  );
}
