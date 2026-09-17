import { getSessionToken } from "@/lib/session";
import { getCurrentUser } from "@/lib/auth-service";
import { getCategories } from "@/lib/categories-service";
import { redirect } from "next/navigation";
import { CategoriesView } from "@/components/categories/CategoriesView";
import { CategoryTab } from "@/components/categories/CategoriesTable/CategorySubTabs";
import { PageHeader } from "@/components/ui/headers/PageHeader";
import styles from "./page.module.css";

interface PageProps {
  searchParams?: Promise<{ tab?: string }>;
}

export default async function CategoriesPage({ searchParams }: PageProps = {}) {
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
  const initialTab: CategoryTab =
    tabParam === CategoryTab.Expense || tabParam === CategoryTab.Income
      ? tabParam
      : CategoryTab.All;

  const categoriesResult = await getCategories(token);

  return (
    <div className={styles.pageContainer}>
      {!categoriesResult.success ? (
        <>
          <PageHeader
            eyebrow="Structure"
            title="Categories"
            subtitle="Create and view your income and expense categories to organize your personal finances."
          />
          <div className={styles.errorBanner} role="alert">
            Failed to load categories: {categoriesResult.error}
          </div>
        </>
      ) : (
        <CategoriesView
          initialTab={initialTab}
          initialCategories={categoriesResult.categories}
        />
      )}
    </div>
  );
}
