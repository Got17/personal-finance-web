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
  const baseUrl = process.env.API_BASE_URL || "http://localhost:8080";

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
  const baseUrl = process.env.API_BASE_URL || "http://localhost:8080";

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
