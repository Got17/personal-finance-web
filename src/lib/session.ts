import { cookies } from "next/headers";

export const COOKIE_NAME = "pf_session_token";

export async function getSessionToken(): Promise<string | null> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(COOKIE_NAME);
  return sessionCookie?.value ?? null;
}

export async function setSessionToken(token: string): Promise<void> {
  const cookieStore = await cookies();
  const isProduction = process.env.NODE_ENV === "production";

  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: isProduction,
    sameSite: "lax",
    path: "/",
  });
}

export async function clearSessionToken(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

export async function withAuth<T extends { success: boolean; error?: string }>(
  handler: (token: string) => Promise<T>,
): Promise<T> {
  const token = await getSessionToken();
  if (!token) {
    return {
      success: false,
      error: "Unauthenticated.",
    } as T;
  }

  return handler(token);
}
