import { getSessionToken } from "@/lib/session";
import { getCurrentUser } from "@/lib/auth-service";
import { getAccounts } from "@/lib/accounts-service";
import { redirect } from "next/navigation";
import { AccountsView } from "@/components/accounts/AccountsView";
import { PageHeader } from "@/components/ui/PageHeader";
import styles from "./page.module.css";

export default async function AccountsPage() {
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

  const accountsResult = await getAccounts(token);

  return (
    <div className={styles.pageContainer}>
      <PageHeader
        eyebrow="Workspace"
        title="Accounts"
        subtitle="Create and view bank accounts, credit cards, and investments in one place."
      />

      {!accountsResult.success && (
        <div className={styles.errorBanner}>
          Failed to load accounts: {accountsResult.error}
        </div>
      )}

      <AccountsView
        initialAccounts={accountsResult.success ? accountsResult.accounts : []}
        defaultCurrency={userResult.user.base_currency || "USD"}
      />
    </div>
  );
}
