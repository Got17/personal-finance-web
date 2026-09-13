import { getCategoryIcon } from "./icons";
import styles from "./CategoryBadge.module.css";

interface CategoryBadgeProps {
  name: string;
  className?: string;
}

export function getCategoryThemeClass(name: string): string {
  const normalized = name.toLowerCase();
  if (normalized.includes("food") || normalized.includes("drink") || normalized.includes("dining") || normalized.includes("restaurant") || normalized.includes("coffee")) {
    return styles.food;
  }
  if (normalized.includes("transport") || normalized.includes("fuel") || normalized.includes("car") || normalized.includes("gas") || normalized.includes("transit")) {
    return styles.transport;
  }
  if (normalized.includes("invest") || normalized.includes("stock") || normalized.includes("crypto") || normalized.includes("savings")) {
    return styles.invest;
  }
  if (normalized.includes("grocer") || normalized.includes("market") || normalized.includes("shopping") || normalized.includes("supermarket")) {
    return styles.groceries;
  }
  if (normalized.includes("salary") || normalized.includes("wage") || normalized.includes("paycheck") || normalized.includes("income") || normalized.includes("bonus")) {
    return styles.salary;
  }
  if (normalized.includes("utilit") || normalized.includes("bill") || normalized.includes("electric") || normalized.includes("water") || normalized.includes("internet")) {
    return styles.utilities;
  }
  if (normalized.includes("entertain") || normalized.includes("movie") || normalized.includes("game") || normalized.includes("leisure")) {
    return styles.entertainment;
  }
  return styles.default;
}

export function CategoryBadge({ name, className }: CategoryBadgeProps) {
  const themeClass = getCategoryThemeClass(name);
  const icon = getCategoryIcon(name);

  return (
    <span className={`${styles.badge} ${themeClass} ${className || ""}`}>
      <span className={styles.iconWrapper}>{icon}</span>
      <span>{name}</span>
    </span>
  );
}
