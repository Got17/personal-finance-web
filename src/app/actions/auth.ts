"use server";

import { authenticateUser, SignInCredentials } from "@/lib/auth-service";
import { clearSessionToken, setSessionToken } from "@/lib/session";
import { redirect } from "next/navigation";

export interface ActionResult {
  success: boolean;
  error?: string;
}

export async function signInAction(
  credentials: SignInCredentials,
): Promise<ActionResult> {
  if (!credentials.email || !credentials.password) {
    return {
      success: false,
      error: "Email and password are required.",
    };
  }

  const result = await authenticateUser(credentials);

  if (!result.success) {
    return {
      success: false,
      error: result.error,
    };
  }

  await setSessionToken(result.accessToken);
  return { success: true };
}

export async function signOutAction(): Promise<never> {
  await clearSessionToken();
  redirect("/login");
}
