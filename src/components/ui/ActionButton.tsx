import { ButtonHTMLAttributes, ReactNode } from "react";
import styles from "./ActionButton.module.css";

export type ActionButtonVariant = "forest" | "expense" | "transaction";

export interface ActionButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ActionButtonVariant;
  icon?: ReactNode;
  showIcon?: boolean;
  children: ReactNode;
}

function DefaultPlusIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}

export function ActionButton({
  variant = "forest",
  icon,
  showIcon = true,
  children,
  className,
  type = "button",
  ...rest
}: ActionButtonProps) {
  const variantClass =
    variant === "expense"
      ? styles.buttonExpense
      : variant === "transaction"
      ? styles.buttonTransaction
      : styles.buttonForest;

  const iconToRender = showIcon ? (
    <span className={styles.icon}>{icon || <DefaultPlusIcon />}</span>
  ) : null;

  return (
    <button
      type={type}
      className={`${styles.actionButton} ${variantClass} ${className || ""}`.trim()}
      {...rest}
    >
      {iconToRender}
      <span className={styles.buttonLabel}>{children}</span>
    </button>
  );
}
