import type { ReactNode } from "react";
import { getSessionToken } from "@/lib/session";
import { getCurrentUser } from "@/lib/auth-service";
import { redirect } from "next/navigation";
import { ResponsiveSidebar } from "@/components/navigation/ResponsiveSidebar";
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

  return (
    <div className={styles.appContainer}>
      <ResponsiveSidebar user={userResult.user} />
      <main className={styles.main}>{children}</main>
    </div>
  );
}

