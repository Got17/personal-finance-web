import { getSessionToken } from "@/lib/session";
import { redirect } from "next/navigation";
import { SignInForm } from "@/components/SignInForm";
import styles from "./page.module.css";

export default async function LoginPage() {
  const token = await getSessionToken();

  if (token) {
    redirect("/");
  }

  return (
    <div className={styles.loginWrapper}>
      <header className={styles.header}>
        <p className={styles.eyebrow}>Personal Finance Hub</p>
        <h1 className={styles.title}>Sign in to Personal Finance Hub</h1>
        <p className={styles.subtitle}>
          Enter your credentials to access your financial workspace.
        </p>
      </header>
      <SignInForm />
    </div>
  );
}
