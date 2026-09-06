"use server";

import { authenticateUser, signUpUser, SignInCredentials, SignUpCredentials } from "@/lib/auth-service";
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

export async function signUpAction(
  credentials: SignUpCredentials,
): Promise<ActionResult> {
  if (!credentials.email || !credentials.password) {
    return {
      success: false,
      error: "Email and password are required.",
    };
  }

  if (credentials.password.length < 8) {
    return {
      success: false,
      error: "Password must be at least 8 characters.",
    };
  }

  const result = await signUpUser(credentials);

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
