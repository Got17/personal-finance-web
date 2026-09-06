import type { ReactNode } from "react";
import { SignOutButton } from "@/components/SignOutButton";
import styles from "./layout.module.css";

const navItems = ["Overview", "Accounts", "Transactions", "Budget", "Goals"];

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <div className={styles.appContainer}>
      <aside className={styles.sidebar}>
        <div className={styles.brand}>
          <span className={styles.logoBadge} aria-hidden="true">PF</span>
          <span className={styles.brandTitle}>Personal<br />Finance Hub</span>
        </div>
        <nav className={styles.navigation} aria-label="Primary navigation">
          {navItems.map((item, index) => (
            <a className={index === 0 ? styles.activeNavItem : styles.navItem} href={`#${item.toLowerCase()}`} key={item}>
              <span className={styles.navMark} aria-hidden="true">0{index + 1}</span>
              <span>{item}</span>
            </a>
          ))}
        </nav>
        <div className={styles.sidebarFooter}>
          <div className={styles.profile}><span className={styles.avatar}>AL</span><span><strong>Alex Lee</strong><small>Personal workspace</small></span></div>
          <SignOutButton />
        </div>
      </aside>
      <main className={styles.main}>{children}</main>
      <nav className={styles.mobileNavigation} aria-label="Mobile navigation">
        {navItems.slice(0, 4).map((item, index) => <a href={`#${item.toLowerCase()}`} key={item}>{index + 1}<span>{item}</span></a>)}
      </nav>
    </div>
  );
}
