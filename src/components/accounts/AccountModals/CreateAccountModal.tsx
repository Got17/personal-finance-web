"use client";

import { Account, AccountType } from "@/lib/schemas/accounts";
import { CreateAccountForm } from "../AccountForm/CreateAccountForm";
import { Modal } from "@/components/ui/modals/Modal";

interface CreateAccountModalProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly defaultCurrency?: string;
  readonly defaultType?: AccountType;
  readonly onAccountCreated: (account: Account) => void;
}

export function CreateAccountModal({
  isOpen,
  onClose,
  defaultCurrency = "LAK",
  defaultType = "checking",
  onAccountCreated,
}: Readonly<CreateAccountModalProps>) {
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
