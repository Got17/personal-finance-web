import { redirect } from "next/navigation";
import { getSessionToken } from "@/lib/session";
import { getAccounts } from "@/lib/accounts-service";
import { getCategories } from "@/lib/categories-service";
import { getFinancialRecords } from "@/lib/financial-records-service";
import { PageHeader } from "@/components/ui/PageHeader";
import { FinancialRecordsView } from "@/components/financial-records/FinancialRecordsView";
import styles from "./page.module.css";

export default async function TransactionsPage() {
  const token = await getSessionToken();
  if (!token) { redirect("/login"); return null; }
  const [accounts, categories, records] = await Promise.all([getAccounts(token), getCategories(token), getFinancialRecords(token)]);
  return <main className={styles.page}><PageHeader eyebrow="Cash flow" title="Transactions" subtitle="Record income and spending in the currency it happened." />
    {(!accounts.success || !categories.success || !records.success) ? <p role="alert" className={styles.error}>We could not load your transaction workspace. Please refresh and try again.</p> : <FinancialRecordsView initialRecords={records.records} accounts={accounts.accounts} categories={categories.categories} />}
  </main>;
}
