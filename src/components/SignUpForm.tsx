"use client";

import { useState, useTransition, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { signUpAction } from "@/app/actions/auth";
import { signUpSchema } from "@/lib/schemas/auth";
import { EyeIcon, EyeOffIcon } from "@/components/icons/EyeIcons";
import styles from "./SignUpForm.module.css";

export function SignUpForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [workspaceName, setWorkspaceName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage(null);

    const validationResult = signUpSchema.safeParse({
      email,
      password,
      confirmPassword,
      workspaceName: workspaceName.trim() || undefined,
    });

    if (!validationResult.success) {
      const firstIssue = validationResult.error.issues[0];
      setErrorMessage(firstIssue?.message || "Validation failed.");
      return;
    }

    startTransition(async () => {
      const result = await signUpAction({
        email,
        password,
        confirmPassword,
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
    <form className={styles.form} onSubmit={handleSubmit} noValidate>
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
        <div className={styles.passwordWrapper}>
          <input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            required
            placeholder="At least 8 characters"
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

      <div className={styles.fieldGroup}>
        <label htmlFor="confirmPassword" className={styles.label}>
          Confirm password
        </label>
        <div className={styles.passwordWrapper}>
          <input
            id="confirmPassword"
            name="confirmPassword"
            type={showConfirmPassword ? "text" : "password"}
            required
            placeholder="Re-enter your password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className={styles.input}
            disabled={isPending}
          />
          <button
            type="button"
            className={styles.toggleButton}
            onClick={() => setShowConfirmPassword((prev) => !prev)}
            aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
            disabled={isPending}
          >
            {showConfirmPassword ? <EyeOffIcon /> : <EyeIcon />}
          </button>
        </div>
      </div>

      <button type="submit" className={styles.submitButton} disabled={isPending}>
        {isPending ? "Creating workspace..." : "Create workspace"}
      </button>
    </form>
  );
}

