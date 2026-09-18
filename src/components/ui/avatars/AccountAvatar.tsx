import { ReactNode } from "react";
import { AccountType } from "@/lib/schemas/accounts";
import styles from "./AccountAvatar.module.css";

export interface AccountAvatarProps {
  type: AccountType;
  className?: string;
}

function BankIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  );
}

function SavingsVaultIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <circle cx="12" cy="12" r="4" />
      <line x1="12" y1="8" x2="12" y2="16" />
      <line x1="8" y1="12" x2="16" y2="12" />
    </svg>
  );
}


function InvestmentIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
      <polyline points="16 7 22 7 22 13" />
    </svg>
  );
}

function CashIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect width="20" height="12" x="2" y="6" rx="2" />
      <circle cx="12" cy="12" r="2" />
      <path d="M6 12h.01M18 12h.01" />
    </svg>
  );
}


function OtherIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  );
}

export function getAccountAvatarIcon(type: AccountType): ReactNode {
  switch (type) {
    case "checking":
      return <BankIcon />;
    case "savings":
      return <SavingsVaultIcon />;
    case "investment":
      return <InvestmentIcon />;
    case "cash":
      return <CashIcon />;
    case "other":
    default:
      return <OtherIcon />;
  }
}

export function AccountAvatar({ type, className }: Readonly<AccountAvatarProps>) {
  const themeClass = styles[type] || styles.other;
  const icon = getAccountAvatarIcon(type);

  return (
    <div
      className={`${styles.avatar} ${themeClass} ${className || ""}`.trim()}
      aria-hidden="true"
      data-testid="account-avatar"
    >
      {icon}
    </div>
  );
}
