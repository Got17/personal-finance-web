import { getSessionToken } from "@/lib/session";
import { getUserPreferences } from "@/lib/preferences-service";
import { redirect } from "next/navigation";
import { SetupForm } from "./setup-form";
import styles from "./page.module.css";

export default async function SetupPage() {
  const token = await getSessionToken();
  if (!token) {
    redirect("/login");
    return null;
  }

  const preferencesResult = await getUserPreferences(token);
  const initialCurrency = preferencesResult.success
    ? preferencesResult.baseCurrency
    : "USD";

  return (
    <div className={styles.container}>
      <main className={styles.setupCard}>
        <p className={styles.eyebrow}>First-use setup</p>
        <h1 className={styles.title}>Choose your base currency.</h1>
        <p className={styles.description}>
          Select the primary currency for your workspace accounts, budgets, and net worth calculations.
        </p>
        <SetupForm initialCurrency={initialCurrency} />
      </main>
    </div>
  );
}
