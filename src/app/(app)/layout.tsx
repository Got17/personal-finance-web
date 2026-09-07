import type { ReactNode } from "react";
import Image from "next/image";
import { getSessionToken } from "@/lib/session";
import { getCurrentUser } from "@/lib/auth-service";
import { redirect } from "next/navigation";
import { SignOutButton } from "@/components/SignOutButton";
import { SidebarNav, MobileNav } from "@/components/Navigation";
import styles from "./layout.module.css";

export default async function AppLayout({ children }: Readonly<{ children: ReactNode }>) {
  const token = await getSessionToken();
  if (!token) {
    redirect("/login");
    return null;
  }

  const userResult = await getCurrentUser(token);
  if (!userResult.success) {
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
        <SidebarNav />
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
      <MobileNav />
    </div>
  );
}

