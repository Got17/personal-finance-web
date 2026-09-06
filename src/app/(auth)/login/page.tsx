import Link from "next/link";
import { getSessionToken } from "@/lib/session";
import { redirect } from "next/navigation";
import { SignInForm } from "@/components/SignInForm";
import styles from "../auth-page.module.css";

export default async function LoginPage() { if (await getSessionToken()) redirect("/"); return <div className={styles.authPage}><p className={styles.eyebrow}>Welcome back</p><h1>Sign in to your financial home.</h1><p className={styles.subtitle}>Your accounts, goals, and decisions—held in one private place.</p><SignInForm /><p className={styles.switcher}>New here? <Link href="/signup">Create your workspace</Link></p></div>; }
