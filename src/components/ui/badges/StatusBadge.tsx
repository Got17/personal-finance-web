import styles from "./StatusBadge.module.css";

export interface StatusBadgeProps {
  isActive: boolean;
  activeLabel?: string;
  inactiveLabel?: string;
}

export function StatusBadge({
  isActive,
  activeLabel = "Active",
  inactiveLabel = "Inactive",
}: StatusBadgeProps) {
  return (
    <span
      className={`${styles.statusBadge} ${
        isActive ? styles.activeStatus : styles.inactiveStatus
      }`}
    >
      {isActive ? activeLabel : inactiveLabel}
    </span>
  );
}
