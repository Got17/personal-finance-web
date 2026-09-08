"use client";

import { Account } from "@/lib/schemas/accounts";
import { EditAccountForm } from "./EditAccountForm";
import { Modal } from "@/components/ui/Modal";

interface EditAccountModalProps {
  isOpen: boolean;
  account: Account | null;
  onClose: () => void;
  onAccountUpdated: (account: Account) => void;
}

export function EditAccountModal({
  isOpen,
  account,
  onClose,
  onAccountUpdated,
}: EditAccountModalProps) {
  if (!account) return null;

  const handleUpdated = (updatedAccount: Account) => {
    onAccountUpdated(updatedAccount);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Edit Account"
      description={`Modify details or change status for ${account.name}.`}
      testId="edit-account-modal"
    >
      <EditAccountForm
        account={account}
        onAccountUpdated={handleUpdated}
        onCancel={onClose}
      />
    </Modal>
  );
}
