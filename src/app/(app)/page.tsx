import { getSessionToken } from "@/lib/session";
import { redirect } from "next/navigation";
import styles from "./page.module.css";

export default async function HomePage() {
  const token = await getSessionToken();

  if (!token) {
    redirect("/login");
  }

  return (
    <div className={styles.container}>
      <header className={styles.pageHeader}>
        <p className={styles.eyebrow}>Personal finance, made clear</p>
        <h1 className={styles.title}>Personal Finance Hub</h1>
        <p className={styles.description}>
          Your private place to understand the whole financial picture. The
          foundation is ready for your accounts, categories, and everyday money
          decisions.
        </p>
      </header>

      <div className={styles.dashboardGrid}>
        <div className={styles.card}>
          <h2 className={styles.cardTitle}>Account Overview</h2>
          <p className={styles.cardText}>
            Track and manage all your cash, bank, and investment accounts in one place.
          </p>
        </div>

        <div className={styles.card}>
          <h2 className={styles.cardTitle}>Categories & Budgets</h2>
          <p className={styles.cardText}>
            Organize cash flows, assign categories, and build tailored spending targets.
          </p>
        </div>
      </div>
    </div>
  );
}
