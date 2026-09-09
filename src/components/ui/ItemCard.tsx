import { ReactNode } from "react";
import { StatusBadge } from "./StatusBadge";
import { CardActions } from "./CardActions";
import styles from "./ItemCard.module.css";

export interface ItemCardProps {
  id: string;
  title: string;
  icon?: ReactNode;
  iconVariant?: "income" | "expense" | "default";
  subtitle?: ReactNode;
  badge?: ReactNode;
  description?: string | null;
  isActive: boolean;
  onEdit?: () => void;
  onDeactivate?: () => void;
  editAriaLabel?: string;
  deactivateAriaLabel?: string;
  testId?: string;
  children?: ReactNode;
}

export function ItemCard({
  id,
  title,
  icon,
  iconVariant = "default",
  subtitle,
  badge,
  description,
  isActive,
  onEdit,
  onDeactivate,
  editAriaLabel,
  deactivateAriaLabel,
  testId,
  children,
}: ItemCardProps) {
  const iconClass =
    iconVariant === "income"
      ? styles.incomeIcon
      : iconVariant === "expense"
      ? styles.expenseIcon
      : "";

  return (
    <div
      className={`${styles.cardContainer} ${!isActive ? styles.inactiveCard : ""}`}
      data-testid={testId || `item-card-${id}`}
    >
      <div className={styles.cardHeader}>
        <div className={styles.headerLeft}>
          {icon && (
            <div className={`${styles.iconTile} ${iconClass}`.trim()} aria-hidden="true">
              {icon}
            </div>
          )}
          <div className={styles.titleGroup}>
            <h3 className={styles.title}>{title}</h3>
            <div className={styles.metaRow}>
              {badge}
              {subtitle && <span className={styles.subtitle}>{subtitle}</span>}
            </div>
          </div>
        </div>

        <StatusBadge isActive={isActive} />
      </div>

      <div className={styles.cardBody}>
        {description && <p className={styles.description}>{description}</p>}
        {children}
      </div>

      <CardActions
        onEdit={onEdit}
        onDeactivate={onDeactivate}
        canDeactivate={isActive}
        editAriaLabel={editAriaLabel || `Edit ${title}`}
        deactivateAriaLabel={deactivateAriaLabel || `Deactivate ${title}`}
      />
    </div>
  );
}
