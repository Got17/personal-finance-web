"use client";

import { KeyboardEvent, useRef } from "react";
import styles from "./SubTabs.module.css";

export type BadgeVariant = "default" | "expense" | "income";

export interface TabItem<T extends string = string> {
  id: T;
  label: string;
  count?: number;
  badgeVariant?: BadgeVariant;
  panelId?: string;
}

export interface SubTabsProps<T extends string = string> {
  activeTab: T;
  tabs: TabItem<T>[];
  onTabChange: (tab: T) => void;
  ariaLabel?: string;
  className?: string;
}

export function SubTabs<T extends string = string>({
  activeTab,
  tabs,
  onTabChange,
  ariaLabel = "Sub-tabs navigation",
  className,
}: Readonly<SubTabsProps<T>>) {
  const tabRefs = useRef<{ [key: string]: HTMLButtonElement | null }>({});

  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const currentIndex = tabs.findIndex((t) => t.id === activeTab);
    let nextIndex = -1;

    if (e.key === "ArrowRight") {
      e.preventDefault();
      nextIndex = (currentIndex + 1) % tabs.length;
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      nextIndex = (currentIndex - 1 + tabs.length) % tabs.length;
    } else if (e.key === "Home") {
      e.preventDefault();
      nextIndex = 0;
    } else if (e.key === "End") {
      e.preventDefault();
      nextIndex = tabs.length - 1;
    }

    if (nextIndex !== -1) {
      const nextTab = tabs[nextIndex].id;
      onTabChange(nextTab);
      tabRefs.current[nextTab]?.focus();
    }
  };

  const getBadgeClass = (variant?: BadgeVariant): string => {
    if (variant === "expense") return styles.badgeExpense;
    if (variant === "income") return styles.badgeIncome;
    return styles.badgeDefault;
  };

  return (
    <div
      className={`${styles.tabContainer} ${className || ""}`.trim()}
      role="tablist"
      aria-label={ariaLabel}
      tabIndex={-1}
      onKeyDown={handleKeyDown}
    >
      {tabs.map((tab) => {
        const isSelected = activeTab === tab.id;
        const panelId = tab.panelId || `tabpanel-${tab.id}`;
        const badgeVariantClass = getBadgeClass(tab.badgeVariant);

        return (
          <button
            key={tab.id}
            ref={(el) => {
              tabRefs.current[tab.id] = el;
            }}
            type="button"
            role="tab"
            id={`tab-${tab.id}`}
            aria-selected={isSelected}
            aria-controls={panelId}
            tabIndex={isSelected ? 0 : -1}
            className={`${styles.tabButton} ${isSelected ? styles.activeTab : ""}`.trim()}
            onClick={() => onTabChange(tab.id)}
          >
            <span>{tab.label}</span>
            {tab.count !== undefined && (
              <span className={`${styles.tabBadge} ${isSelected ? "" : badgeVariantClass}`.trim()}>
                {tab.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
