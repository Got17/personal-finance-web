"use client";

import { Account } from "@/lib/schemas/accounts";
import { deactivateAccountAction } from "@/app/actions/accounts";
import { DeactivateModal } from "@/components/ui/DeactivateModal";
import styles from "./DeactivateAccountModal.module.css";

interface DeactivateAccountModalProps {
  isOpen: boolean;
  account: Account | null;
  onClose: () => void;
  onAccountDeactivated: (account: Account) => void;
}

export function DeactivateAccountModal({
  isOpen,
  account,
  onClose,
  onAccountDeactivated,
}: DeactivateAccountModalProps) {
  return (
    <DeactivateModal
      isOpen={isOpen}
      item={account}
      entityName="Account"
      description={
        account ? (
          <>
            Are you sure you want to deactivate{" "}
            <span className={styles.accountHighlight}>{account.name}</span>? The account will be marked
            inactive, but its past transactions and history will remain available for reporting.
          </>
        ) : undefined
      }
      onClose={onClose}
      onConfirm={async (id) => {
        const res = await deactivateAccountAction(id);
        return {
          success: res.success,
          error: res.error,
          item: res.account,
        };
      }}
      onDeactivated={onAccountDeactivated}
      testId="deactivate-account-modal"
    />
  );
}
