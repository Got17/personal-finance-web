import Link from "next/link";
import { getSessionToken } from "@/lib/session";
import { getCurrentUser } from "@/lib/auth-service";
import { redirect } from "next/navigation";
import { SignUpForm } from "@/components/SignUpForm";
import styles from "../auth-page.module.css";

export default async function SignupPage() {
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
      <p className={styles.eyebrow}>Start with clarity</p>
      <h1>Create your financial home.</h1>
      <p className={styles.subtitle}>
        Your accounts, goals, and decisions—held in one private place.
      </p>
      <SignUpForm />
      <p className={styles.switcher}>
        Already have a workspace? <Link href="/login">Sign in</Link>
      </p>
    </div>
  );
}
