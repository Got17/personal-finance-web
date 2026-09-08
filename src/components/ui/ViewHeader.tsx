import { Badge } from "./Badge";
import styles from "./ViewHeader.module.css";

export interface ViewHeaderProps {
  title: string;
  count: number;
  unitSingular: string;
  unitPlural: string;
  actionLabel?: string;
  onAction?: () => void;
  actionAriaLabel?: string;
}

export function ViewHeader({
  title,
  count,
  unitSingular,
  unitPlural,
  actionLabel,
  onAction,
  actionAriaLabel,
}: ViewHeaderProps) {
  const countText = `${count} ${count === 1 ? unitSingular : unitPlural}`;

  return (
    <div className={styles.headerRow}>
      <div className={styles.titleGroup}>
        <h2 className={styles.sectionTitle}>{title}</h2>
        <Badge variant="count">{countText}</Badge>
      </div>
      {actionLabel && onAction && (
        <button
          type="button"
          className={styles.addButton}
          onClick={onAction}
          aria-label={actionAriaLabel || actionLabel}
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}
