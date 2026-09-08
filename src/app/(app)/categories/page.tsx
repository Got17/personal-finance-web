import { getSessionToken } from "@/lib/session";
import { getCurrentUser } from "@/lib/auth-service";
import { getCategories } from "@/lib/categories-service";
import { redirect } from "next/navigation";
import { CategoriesView } from "@/components/categories/CategoriesView";
import { PageHeader } from "@/components/ui/PageHeader";
import styles from "./page.module.css";

export default async function CategoriesPage() {
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

  const categoriesResult = await getCategories(token);

  return (
    <div className={styles.pageContainer}>
      <PageHeader
        eyebrow="Workspace"
        title="Categories"
        subtitle="Create and view your income and expense categories to organize your personal finances."
      />

      {!categoriesResult.success && (
        <div className={styles.errorBanner}>
          Failed to load categories: {categoriesResult.error}
        </div>
      )}

      <CategoriesView
        initialCategories={categoriesResult.success ? categoriesResult.categories : []}
      />
    </div>
  );
}
