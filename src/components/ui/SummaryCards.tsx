import { ReactNode } from "react";
import styles from "./SummaryCards.module.css";

export interface SummaryCardsGridProps {
  children: ReactNode;
  testId?: string;
  className?: string;
}

export function SummaryCardsGrid({
  children,
  testId,
  className,
}: SummaryCardsGridProps) {
  return (
    <div
      className={`${styles.grid} ${className || ""}`.trim()}
      data-testid={testId}
    >
      {children}
    </div>
  );
}

export interface SummaryCardProps {
  variant?: "inflow" | "outflow" | "neutral" | "highlight";
  label: string;
  icon: ReactNode;
  value: ReactNode;
  valueClassName?: string;
  subtext?: ReactNode;
  className?: string;
  testId?: string;
}

export function SummaryCard({
  variant = "neutral",
  label,
  icon,
  value,
  valueClassName,
  subtext,
  className,
  testId,
}: SummaryCardProps) {
  const cardVariantClass =
    variant === "inflow"
      ? styles.cardInflow
      : variant === "outflow"
      ? styles.cardOutflow
      : variant === "highlight"
      ? styles.cardHighlight
      : styles.cardNeutral;

  const iconWrapperVariantClass =
    variant === "inflow"
      ? styles.inflowIconWrapper
      : variant === "outflow"
      ? styles.outflowIconWrapper
      : variant === "highlight"
      ? styles.highlightIconWrapper
      : styles.neutralIconWrapper;

  const defaultValueClass =
    variant === "inflow"
      ? styles.inflowValue
      : variant === "outflow"
      ? styles.outflowValue
      : styles.neutralValue;

  return (
    <div
      className={`${styles.card} ${cardVariantClass} ${className || ""}`.trim()}
      data-testid={testId}
    >
      <div className={styles.cardHeader}>
        <span className={styles.label}>{label}</span>
        <div className={`${styles.iconWrapper} ${iconWrapperVariantClass}`.trim()}>
          {icon}
        </div>
      </div>
      <div className={styles.valueContainer}>
        <span className={`${styles.value} ${valueClassName || defaultValueClass}`.trim()}>
          {value}
        </span>
        {subtext && <div className={styles.subtextRow}>{subtext}</div>}
      </div>
    </div>
  );
}
