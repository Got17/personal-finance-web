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
}: Readonly<SummaryCardsGridProps>) {
  return (
    <div
      className={`${styles.grid} ${className || ""}`.trim()}
      data-testid={testId}
    >
      {children}
    </div>
  );
}

export type SummaryCardVariant = "inflow" | "outflow" | "neutral" | "highlight";

export interface SummaryCardProps {
  variant?: SummaryCardVariant;
  label: string;
  icon: ReactNode;
  value: ReactNode;
  valueClassName?: string;
  subtext?: ReactNode;
  className?: string;
  testId?: string;
}

const CARD_VARIANT_CLASSES: Record<SummaryCardVariant, string> = {
  inflow: styles.cardInflow,
  outflow: styles.cardOutflow,
  highlight: styles.cardHighlight,
  neutral: styles.cardNeutral,
};

const ICON_WRAPPER_VARIANT_CLASSES: Record<SummaryCardVariant, string> = {
  inflow: styles.inflowIconWrapper,
  outflow: styles.outflowIconWrapper,
  highlight: styles.highlightIconWrapper,
  neutral: styles.neutralIconWrapper,
};

const DEFAULT_VALUE_CLASSES: Record<SummaryCardVariant, string> = {
  inflow: styles.inflowValue,
  outflow: styles.outflowValue,
  highlight: styles.neutralValue,
  neutral: styles.neutralValue,
};

export function SummaryCard({
  variant = "neutral",
  label,
  icon,
  value,
  valueClassName,
  subtext,
  className,
  testId,
}: Readonly<SummaryCardProps>) {
  const cardVariantClass = CARD_VARIANT_CLASSES[variant] ?? styles.cardNeutral;
  const iconWrapperVariantClass =
    ICON_WRAPPER_VARIANT_CLASSES[variant] ?? styles.neutralIconWrapper;
  const defaultValueClass = DEFAULT_VALUE_CLASSES[variant] ?? styles.neutralValue;

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
