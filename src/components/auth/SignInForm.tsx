"use client";

import { useState, useTransition, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { signInAction } from "@/app/actions/auth";
import { EyeIcon, EyeOffIcon } from "@/components/icons/EyeIcons";
import styles from "./SignInForm.module.css";

export function SignInForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage(null);

    startTransition(async () => {
      const result = await signInAction({ email, password });

      if (!result.success) {
        setErrorMessage(result.error || "Failed to sign in.");
        return;
      }

      router.push("/");
      router.refresh();
    });
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      {errorMessage && (
        <div className={styles.errorBanner} role="alert">
          {errorMessage}
        </div>
      )}

      <div className={styles.fieldGroup}>
        <label htmlFor="email" className={styles.label}>
          Email address
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          placeholder="name@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={styles.input}
          disabled={isPending}
        />
      </div>

      <div className={styles.fieldGroup}>
        <label htmlFor="password" className={styles.label}>
          Password
        </label>
        <div className={styles.passwordWrapper}>
          <input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            required
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={styles.input}
            disabled={isPending}
          />
          <button
            type="button"
            className={styles.toggleButton}
            onClick={() => setShowPassword((prev) => !prev)}
            aria-label={showPassword ? "Hide password" : "Show password"}
            disabled={isPending}
          >
            {showPassword ? <EyeOffIcon /> : <EyeIcon />}
          </button>
        </div>
      </div>

      <button type="submit" className={styles.submitButton} disabled={isPending}>
        {isPending ? "Signing in..." : "Sign In"}
      </button>
    </form>
  );
}
