import Link from "next/link";
import { getSessionToken } from "@/lib/session";
import { getCurrentUser } from "@/lib/auth-service";
import { redirect } from "next/navigation";
import { SignInForm } from "@/components/SignInForm";
import styles from "../auth-page.module.css";

export default async function LoginPage() {
  const token = await getSessionToken();
  if (token) {
    const userResult = await getCurrentUser(token);
    if (userResult.success) {
      redirect("/");
      return null;
    }
  }

  return (
    <div className={styles.authPage}>
      <p className={styles.eyebrow}>Welcome back</p>
      <h1>Sign in to your financial home.</h1>
      <p className={styles.subtitle}>
        Your accounts, goals, and decisions—held in one private place.
      </p>
      <SignInForm />
      <p className={styles.switcher}>
        New here? <Link href="/signup">Create your workspace</Link>
      </p>
    </div>
  );
}

