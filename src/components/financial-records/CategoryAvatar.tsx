import { getCategoryIcon } from "./icons";
import styles from "./CategoryAvatar.module.css";

interface CategoryAvatarProps {
  categoryName: string;
  className?: string;
}

export function getCategoryAvatarThemeClass(name: string): string {
  const normalized = name.toLowerCase();
  if (
    normalized.includes("food") ||
    normalized.includes("drink") ||
    normalized.includes("dining") ||
    normalized.includes("restaurant") ||
    normalized.includes("coffee")
  ) {
    return styles.food;
  }
  if (
    normalized.includes("transport") ||
    normalized.includes("fuel") ||
    normalized.includes("car") ||
    normalized.includes("gas") ||
    normalized.includes("transit")
  ) {
    return styles.transport;
  }
  if (
    normalized.includes("invest") ||
    normalized.includes("stock") ||
    normalized.includes("crypto") ||
    normalized.includes("savings")
  ) {
    return styles.invest;
  }
  if (
    normalized.includes("grocer") ||
    normalized.includes("market") ||
    normalized.includes("shopping") ||
    normalized.includes("supermarket")
  ) {
    return styles.groceries;
  }
  if (
    normalized.includes("salary") ||
    normalized.includes("wage") ||
    normalized.includes("paycheck") ||
    normalized.includes("income") ||
    normalized.includes("bonus")
  ) {
    return styles.salary;
  }
  if (
    normalized.includes("utilit") ||
    normalized.includes("bill") ||
    normalized.includes("electric") ||
    normalized.includes("water") ||
    normalized.includes("internet")
  ) {
    return styles.utilities;
  }
  if (
    normalized.includes("entertain") ||
    normalized.includes("movie") ||
    normalized.includes("game") ||
    normalized.includes("leisure")
  ) {
    return styles.entertainment;
  }
  return styles.default;
}

export function CategoryAvatar({ categoryName, className }: CategoryAvatarProps) {
  const themeClass = getCategoryAvatarThemeClass(categoryName);
  const icon = getCategoryIcon(categoryName);

  return (
    <div
      className={`${styles.avatar} ${themeClass} ${className || ""}`.trim()}
      aria-hidden="true"
      data-testid="category-avatar"
    >
      {icon}
    </div>
  );
}
