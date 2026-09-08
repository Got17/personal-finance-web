"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import styles from "./Navigation.module.css";

export interface NavItem {
  name: string;
  href: string;
}

const navItems: NavItem[] = [
  { name: "Overview", href: "/" },
  { name: "Accounts", href: "/accounts" },
  { name: "Categories", href: "/categories" },
  { name: "Transactions", href: "/#transactions" },
  { name: "Budget", href: "/#budget" },
  { name: "Goals", href: "/#goals" },
];

export function SidebarNav() {
  const pathname = usePathname();

  return (
    <nav className={styles.navigation} aria-label="Primary navigation">
      {navItems.map((item, index) => {
        const isActive =
          item.href === "/"
            ? pathname === "/" || pathname === ""
            : pathname.startsWith(item.href);

        return (
          <Link
            className={isActive ? styles.activeNavItem : styles.navItem}
            href={item.href}
            key={item.name}
          >
            <span className={styles.navMark} aria-hidden="true">
              0{index + 1}
            </span>
            <span>{item.name}</span>
          </Link>
        );
      })}
    </nav>
  );
}

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className={styles.mobileNavigation} aria-label="Mobile navigation">
      {navItems.slice(0, 4).map((item, index) => {
        const isActive =
          item.href === "/"
            ? pathname === "/" || pathname === ""
            : pathname.startsWith(item.href);

        return (
          <Link
            key={item.name}
            href={item.href}
            className={isActive ? styles.activeMobileNavItem : undefined}
          >
            {index + 1}
            <span>{item.name}</span>
          </Link>
        );
      })}
    </nav>
  );
}
