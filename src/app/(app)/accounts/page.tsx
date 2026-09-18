import { getSessionToken } from "@/lib/session";
import { getCurrentUser } from "@/lib/auth-service";
import { getAccounts } from "@/lib/accounts-service";
import { getCategories } from "@/lib/categories-service";
import { redirect } from "next/navigation";
import { AccountsView } from "@/components/accounts/AccountsView";
import { AccountTab } from "@/components/accounts/AccountsTable/AccountSubTabs";
import { PageHeader } from "@/components/ui/headers/PageHeader";
import styles from "./page.module.css";

interface PageProps {
  searchParams?: Promise<{ tab?: string }>;
}

export default async function AccountsPage({ searchParams }: PageProps = {}) {
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

  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const tabParam = resolvedSearchParams?.tab;
  const initialTab: AccountTab =
    tabParam === AccountTab.Banking ||
    tabParam === AccountTab.Investment
      ? tabParam
      : AccountTab.All;

  const [accountsResult, categoriesResult] = await Promise.all([
    getAccounts(token),
    getCategories(token),
  ]);

  return (
    <div className={styles.pageContainer}>
      {!accountsResult.success ? (
        <>
          <PageHeader
            eyebrow="Workspace"
            title="Accounts"
            subtitle="Create and view bank accounts, credit cards, and investments in one place."
          />
          <div className={styles.errorBanner} role="alert">
            Failed to load accounts: {accountsResult.error}
          </div>
        </>
      ) : (
        <AccountsView
          initialTab={initialTab}
          initialAccounts={accountsResult.accounts}
          categories={categoriesResult.success ? categoriesResult.categories : []}
          defaultCurrency={userResult.user.base_currency || "LAK"}
        />
      )}
    </div>
  );
}

