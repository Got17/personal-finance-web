import { Badge } from "../badges/Badge";
import { ActionButton, ActionButtonVariant } from "../buttons/ActionButton";
import styles from "./ViewHeader.module.css";

export interface ViewHeaderProps {
  title: string;
  count: number;
  unitSingular: string;
  unitPlural: string;
  actionLabel?: string;
  onAction?: () => void;
  actionAriaLabel?: string;
  actionVariant?: ActionButtonVariant;
}

export function ViewHeader({
  title,
  count,
  unitSingular,
  unitPlural,
  actionLabel,
  onAction,
  actionAriaLabel,
  actionVariant = "forest",
}: Readonly<ViewHeaderProps>) {
  const countText = `${count} ${count === 1 ? unitSingular : unitPlural}`;
  const displayLabel = actionLabel?.replace(/^\+\s*/, "");

  return (
    <div className={styles.headerRow}>
      <div className={styles.titleGroup}>
        <h2 className={styles.sectionTitle}>{title}</h2>
        <Badge variant="count">{countText}</Badge>
      </div>
      {actionLabel && onAction && (
        <ActionButton
          className={styles.headerActionButton}
          variant={actionVariant}
          onClick={onAction}
          aria-label={actionAriaLabel || actionLabel}
        >
          {displayLabel}
        </ActionButton>
      )}
    </div>
  );
}

