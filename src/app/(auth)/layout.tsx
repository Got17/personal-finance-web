import type { ReactNode } from "react";
import styles from "./layout.module.css";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className={styles.authContainer}>
      <div className={styles.authCard}>{children}</div>
    </div>
  );
}
