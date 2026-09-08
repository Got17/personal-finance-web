"use client";

import { Account } from "@/lib/schemas/accounts";
import { CreateAccountForm } from "./CreateAccountForm";
import { Modal } from "@/components/ui/Modal";

interface CreateAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultCurrency?: string;
  onAccountCreated: (account: Account) => void;
}

export function CreateAccountModal({
  isOpen,
  onClose,
  defaultCurrency = "USD",
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
        onAccountCreated={handleCreated}
        onCancel={onClose}
      />
    </Modal>
  );
}
