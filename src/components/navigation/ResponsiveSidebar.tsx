"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { SidebarNav } from "./Navigation";
import { SignOutButton } from "@/components/auth/SignOutButton";
import styles from "./ResponsiveSidebar.module.css";

export interface ResponsiveSidebarProps {
  user: {
    email?: string;
    base_currency?: string;
  };
}

export function ResponsiveSidebar({ user }: Readonly<ResponsiveSidebarProps>) {
  const [isOpen, setIsOpen] = useState(false);
  const userInitials = user.email ? user.email.slice(0, 2).toUpperCase() : "PF";

  // Close drawer on Escape key press and manage body scroll lock
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const handleClose = () => setIsOpen(false);

  return (
    <>
      {/* Mobile Top App Bar with Hamburger Toggle */}
      <header className={styles.mobileHeader}>
        <button
          type="button"
          className={styles.hamburgerButton}
          onClick={() => setIsOpen(true)}
          aria-label="Open navigation menu"
          aria-expanded={isOpen}
        >
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>

        <div className={styles.mobileBrand}>
          <Image
            src="/brand/pf-mark.svg"
            alt=""
            width={26}
            height={26}
            priority
          />
          <span className={styles.mobileBrandTitle}>Personal Finance Hub</span>
        </div>

        <span className={styles.mobileAvatar} aria-hidden="true">
          {userInitials}
        </span>
      </header>

      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className={styles.backdrop}
          onClick={handleClose}
          aria-hidden="true"
          data-testid="sidebar-backdrop"
        />
      )}

      {/* Sidebar Drawer on Mobile / Permanent Rail on Desktop */}
      <aside
        className={`${styles.sidebar} ${isOpen ? styles.sidebarOpen : ""}`}
        aria-label="Application sidebar"
      >
        <div className={styles.brandRow}>
          <div className={styles.brand}>
            <Image
              className={styles.logoBadge}
              src="/brand/pf-mark.svg"
              alt=""
              width={36}
              height={36}
              priority
            />
            <span className={styles.brandTitle}>
              Personal<br />Finance Hub
            </span>
          </div>

          <button
            type="button"
            className={styles.closeButton}
            onClick={handleClose}
            aria-label="Close navigation menu"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <SidebarNav onNavigate={handleClose} />

        <div className={styles.sidebarFooter}>
          <div className={styles.profile}>
            <span className={styles.avatar}>{userInitials}</span>
            <span>
              <strong>{user.email}</strong>
              <small>
                {user.base_currency ? `Base currency: ${user.base_currency}` : "Personal workspace"}
              </small>
            </span>
          </div>
          <SignOutButton />
        </div>
      </aside>
    </>
  );
}