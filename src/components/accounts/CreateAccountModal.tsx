"use client";

import { Account, AccountType } from "@/lib/schemas/accounts";
import { CreateAccountForm } from "./CreateAccountForm";
import { Modal } from "@/components/ui/Modal";

interface CreateAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultCurrency?: string;
  defaultType?: AccountType;
  onAccountCreated: (account: Account) => void;
}

export function CreateAccountModal({
  isOpen,
  onClose,
  defaultCurrency = "USD",
  defaultType = "checking",
  onAccountCreated,
}: CreateAccountModalProps) {
  const handleCreated = (account: Account) => {
    onAccountCreated(account);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Add New Account"
      description="Enter details to track a bank account, card, or asset."
      testId="create-account-modal"
    >
      <CreateAccountForm
        defaultCurrency={defaultCurrency}
        defaultType={defaultType}
        onAccountCreated={handleCreated}
        onCancel={onClose}
      />
    </Modal>
  );
}
