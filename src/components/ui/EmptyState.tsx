"use client";

import styles from "./EmptyState.module.css";

export interface EmptyStateProps {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({
  title,
  description,
  actionLabel,
  onAction,
}: EmptyStateProps) {
  return (
    <div className={styles.emptyState}>
      <h3 className={styles.emptyTitle}>{title}</h3>
      <p className={styles.emptyDescription}>{description}</p>
      {actionLabel && onAction && (
        <button type="button" className={styles.actionButton} onClick={onAction}>
          {actionLabel}
        </button>
      )}
    </div>
  );
}
