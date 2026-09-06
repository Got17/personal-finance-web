"use server";

import { authenticateUser, signUpUser, SignInCredentials, SignUpCredentials } from "@/lib/auth-service";
import { clearSessionToken, setSessionToken } from "@/lib/session";
import { redirect } from "next/navigation";
import { signUpSchema } from "@/lib/schemas/auth";

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
  const parsed = signUpSchema.safeParse(credentials);
  if (!parsed.success) {
    const firstIssue = parsed.error.issues[0];
    return {
      success: false,
      error: firstIssue?.message || "Validation failed.",
    };
  }

  const result = await signUpUser({
    email: parsed.data.email,
    password: parsed.data.password,
    workspaceName: parsed.data.workspaceName,
  });

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
