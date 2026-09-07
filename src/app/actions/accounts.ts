"use server";

import { getSessionToken } from "@/lib/session";
import { createAccount, getAccounts } from "@/lib/accounts-service";
import { CreateAccountInput, Account } from "@/lib/schemas/accounts";
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
