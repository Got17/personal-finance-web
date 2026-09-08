import styles from "./CardActions.module.css";

export interface CardActionsProps {
  onEdit?: () => void;
  onDeactivate?: () => void;
  editLabel?: string;
  deactivateLabel?: string;
  editAriaLabel?: string;
  deactivateAriaLabel?: string;
  canDeactivate?: boolean;
}

export function CardActions({
  onEdit,
  onDeactivate,
  editLabel = "Edit",
  deactivateLabel = "Deactivate",
  editAriaLabel,
  deactivateAriaLabel,
  canDeactivate = true,
}: CardActionsProps) {
  if (!onEdit && (!onDeactivate || !canDeactivate)) return null;

  return (
    <div className={styles.cardActions}>
      {onEdit && (
        <button
          type="button"
          className={styles.editButton}
          onClick={onEdit}
          aria-label={editAriaLabel || editLabel}
        >
          {editLabel}
        </button>
      )}
      {onDeactivate && canDeactivate && (
        <button
          type="button"
          className={styles.deactivateButton}
          onClick={onDeactivate}
          aria-label={deactivateAriaLabel || deactivateLabel}
        >
          {deactivateLabel}
        </button>
      )}
    </div>
  );
}
