"use client";

import { useTransition } from "react";
import { signOutAction } from "@/app/actions/auth";
import styles from "./SignOutButton.module.css";

export function SignOutButton() {
  const [isPending, startTransition] = useTransition();

  const handleSignOut = () => {
    startTransition(async () => {
      await signOutAction();
    });
  };

  return (
    <button
      type="button"
      onClick={handleSignOut}
      className={styles.button}
      disabled={isPending}
    >
      {isPending ? "Signing out..." : "Sign Out"}
    </button>
  );
}
