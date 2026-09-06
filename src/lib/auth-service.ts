function getBaseUrl(): string {
  return process.env.API_BASE_URL || "http://localhost:8080";
}

export interface SignInCredentials {
  email: string;
  password: string;
}

export type AuthResult =
  | { success: true; accessToken: string }
  | { success: false; error: string };

export async function authenticateUser(
  credentials: SignInCredentials,
): Promise<AuthResult> {
  const baseUrl = getBaseUrl();

  try {
    const response = await fetch(`${baseUrl}/v1/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(credentials),
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      const errorMessage = data?.message || "Invalid credentials provided.";
      return { success: false, error: errorMessage };
    }

    return {
      success: true,
      accessToken: data.data.access_token,
    };
  } catch {
    return {
      success: false,
      error: "Unable to connect to authentication server.",
    };
  }
}

export interface SignUpCredentials {
  email: string;
  password: string;
  confirmPassword?: string;
  workspaceName?: string;
}

export async function signUpUser(
  credentials: SignUpCredentials,
): Promise<AuthResult> {
  const baseUrl = getBaseUrl();

  try {
    const response = await fetch(`${baseUrl}/v1/auth/signup`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: credentials.email,
        password: credentials.password,
        ...(credentials.workspaceName ? { workspace_name: credentials.workspaceName } : {}),
      }),
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      const errorMessage = data?.message || "Registration failed.";
      return { success: false, error: errorMessage };
    }

    return {
      success: true,
      accessToken: data.data.access_token,
    };
  } catch {
    return {
      success: false,
      error: "Unable to connect to authentication server.",
    };
  }
}

export interface UserProfile {
  id: string;
  email: string;
  base_currency?: string;
  created_at: string;
  updated_at: string;
}

export type GetCurrentUserResult =
  | { success: true; user: UserProfile; status: number }
  | { success: false; error: string; status?: number };

export async function getCurrentUser(
  token: string,
): Promise<GetCurrentUserResult> {
  const baseUrl = getBaseUrl();

  try {
    const response = await fetch(`${baseUrl}/v1/users/me`, {
      method: "GET",
      cache: "no-store",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    let data: { success?: boolean; message?: string; data?: UserProfile } | null = null;
    try {
      data = await response.json();
    } catch {
      // Handles non-JSON or empty response bodies safely
    }

    if (!response.ok || !data?.success) {
      const errorMessage =
        data?.message ||
        (response.status === 401 || response.status === 403
          ? "Unauthenticated."
          : `HTTP error ${response.status}`);
      return { success: false, error: errorMessage, status: response.status };
    }

    return {
      success: true,
      user: data.data!,
      status: response.status,
    };
  } catch {
    return {
      success: false,
      error: "Unable to connect to authentication server.",
    };
  }
}



