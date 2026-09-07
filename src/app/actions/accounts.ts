"use server";

import { getSessionToken } from "@/lib/session";
import {
  createAccount,
  getAccounts,
  updateAccount,
  deactivateAccount,
} from "@/lib/accounts-service";
import {
  CreateAccountInput,
  UpdateAccountInput,
  Account,
} from "@/lib/schemas/accounts";
import { revalidatePath } from "next/cache";

export interface CreateAccountActionResult {
  success: boolean;
  account?: Account;
  error?: string;
}

export interface GetAccountsActionResult {
  success: boolean;
  accounts?: Account[];
  error?: string;
}

export interface UpdateAccountActionResult {
  success: boolean;
  account?: Account;
  error?: string;
}

export interface DeactivateAccountActionResult {
  success: boolean;
  account?: Account;
  error?: string;
}

export async function createAccountAction(
  input: CreateAccountInput,
): Promise<CreateAccountActionResult> {
  const token = await getSessionToken();
  if (!token) {
    return {
      success: false,
      error: "Unauthenticated.",
    };
  }

  const result = await createAccount(token, input);

  if (!result.success) {
    return {
      success: false,
      error: result.error,
    };
  }

  revalidatePath("/accounts");

  return {
    success: true,
    account: result.account,
  };
}

export async function getAccountsAction(): Promise<GetAccountsActionResult> {
  const token = await getSessionToken();
  if (!token) {
    return {
      success: false,
      error: "Unauthenticated.",
    };
  }

  const result = await getAccounts(token);

  if (!result.success) {
    return {
      success: false,
      error: result.error,
    };
  }

  return {
    success: true,
    accounts: result.accounts,
  };
}

export async function updateAccountAction(
  id: string,
  input: UpdateAccountInput,
): Promise<UpdateAccountActionResult> {
  const token = await getSessionToken();
  if (!token) {
    return {
      success: false,
      error: "Unauthenticated.",
    };
  }

  const result = await updateAccount(token, id, input);

  if (!result.success) {
    return {
      success: false,
      error: result.error,
    };
  }

  revalidatePath("/accounts");

  return {
    success: true,
    account: result.account,
  };
}

export async function deactivateAccountAction(
  id: string,
): Promise<DeactivateAccountActionResult> {
  const token = await getSessionToken();
  if (!token) {
    return {
      success: false,
      error: "Unauthenticated.",
    };
  }

  const result = await deactivateAccount(token, id);

  if (!result.success) {
    return {
      success: false,
      error: result.error,
    };
  }

  revalidatePath("/accounts");

  return {
    success: true,
    account: result.account,
  };
}

