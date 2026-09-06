import type { ReactNode } from "react";
import { SignOutButton } from "@/components/SignOutButton";
import styles from "./layout.module.css";

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <div className={styles.appContainer}>
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.brand}>
            <span className={styles.logoBadge}>PF</span>
            <span className={styles.brandTitle}>Personal Finance Hub</span>
          </div>
          <div className={styles.userActions}>
            <span className={styles.statusBadge}>Authenticated</span>
            <SignOutButton />
          </div>
        </div>
      </header>
      <main className={styles.main}>{children}</main>
    </div>
  );
}
