"use client";

import { useState, useTransition, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { signUpAction } from "@/app/actions/auth";
import styles from "./SignUpForm.module.css";

export function SignUpForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [workspaceName, setWorkspaceName] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage(null);

    if (password.length < 8) {
      setErrorMessage("Password must be at least 8 characters.");
      return;
    }

    startTransition(async () => {
      const result = await signUpAction({
        email,
        password,
        workspaceName: workspaceName.trim() || undefined,
      });

      if (!result.success) {
        setErrorMessage(result.error || "Registration failed.");
        return;
      }

      router.push("/setup");
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
        <label htmlFor="workspaceName" className={styles.label}>
          Workspace name (optional)
        </label>
        <input
          id="workspaceName"
          name="workspaceName"
          type="text"
          placeholder="Personal Workspace"
          value={workspaceName}
          onChange={(e) => setWorkspaceName(e.target.value)}
          className={styles.input}
          disabled={isPending}
        />
      </div>

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
          Create a password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          placeholder="At least 8 characters"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className={styles.input}
          disabled={isPending}
        />
      </div>

      <button type="submit" className={styles.submitButton} disabled={isPending}>
        {isPending ? "Creating workspace..." : "Create workspace"}
      </button>
    </form>
  );
}
