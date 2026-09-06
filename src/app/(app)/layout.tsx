import type { ReactNode } from "react";
import Image from "next/image";
import { getSessionToken, clearSessionToken } from "@/lib/session";
import { getCurrentUser } from "@/lib/auth-service";
import { redirect } from "next/navigation";
import { SignOutButton } from "@/components/SignOutButton";
import styles from "./layout.module.css";

const navItems = ["Overview", "Accounts", "Transactions", "Budget", "Goals"];

export default async function AppLayout({ children }: Readonly<{ children: ReactNode }>) {
  const token = await getSessionToken();
  if (!token) {
    redirect("/login");
    return null;
  }

  const userResult = await getCurrentUser(token);
  if (!userResult.success) {
    if (userResult.status === 401 || userResult.status === 403) {
      await clearSessionToken();
    }
    redirect("/login");
    return null;
  }


  const user = userResult.user;
  const userInitials = user.email ? user.email.slice(0, 2).toUpperCase() : "PF";


  return (
    <div className={styles.appContainer}>
      <aside className={styles.sidebar}>
        <div className={styles.brand}>
          <Image className={styles.logoBadge} src="/brand/pf-mark.svg" alt="" width={36} height={36} priority />
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
          <div className={styles.profile}>
            <span className={styles.avatar}>{userInitials}</span>
            <span>
              <strong>{user.email}</strong>
              <small>{user.base_currency ? `Base currency: ${user.base_currency}` : "Personal workspace"}</small>
            </span>
          </div>
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

