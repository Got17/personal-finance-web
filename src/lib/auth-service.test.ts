import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { authenticateUser, signUpUser } from "./auth-service";

describe("auth-service", () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it("sends POST request to /v1/auth/login with credentials and returns token on success", async () => {
    const mockSuccessResponse = {
      success: true,
      data: {
        access_token: "secret-bearer-token",
        token_type: "Bearer",
      },
      message: "An authenticated session was issued.",
    };

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: () => Promise.resolve(mockSuccessResponse),
    } as Response);

    const result = await authenticateUser({
      email: "user@example.com",
      password: "password123",
    });

    expect(global.fetch).toHaveBeenCalledWith(
      "http://localhost:8080/v1/auth/login",
      expect.objectContaining({
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: "user@example.com",
          password: "password123",
        }),
      }),
    );

    expect(result).toEqual({
      success: true,
      accessToken: "secret-bearer-token",
    });
  });

  it("returns error message when API responds with 401 invalid credentials", async () => {
    const mockErrorResponse = {
      success: false,
      error: "invalid_credentials",
      message: "The supplied credentials are invalid.",
    };

    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 401,
      json: () => Promise.resolve(mockErrorResponse),
    } as Response);

    const result = await authenticateUser({
      email: "user@example.com",
      password: "wrongpassword",
    });

    expect(result).toEqual({
      success: false,
      error: "The supplied credentials are invalid.",
    });
  });

  it("handles network error gracefully", async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error("Network connection failed"));

    const result = await authenticateUser({
      email: "user@example.com",
      password: "password123",
    });

    expect(result).toEqual({
      success: false,
      error: "Unable to connect to authentication server.",
    });
  });

  describe("signUpUser", () => {
    it("sends POST request to /v1/auth/signup with credentials and returns token on success", async () => {
      const mockSuccessResponse = {
        success: true,
        data: {
          access_token: "signup-bearer-token",
          token_type: "Bearer",
        },
        message: "User registered successfully.",
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 201,
        json: () => Promise.resolve(mockSuccessResponse),
      } as Response);

      const result = await signUpUser({
        email: "newuser@example.com",
        password: "securepassword123",
        workspaceName: "My Workspace",
      });

      expect(global.fetch).toHaveBeenCalledWith(
        "http://localhost:8080/v1/auth/signup",
        expect.objectContaining({
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: "newuser@example.com",
            password: "securepassword123",
            workspace_name: "My Workspace",
          }),
        }),
      );

      expect(result).toEqual({
        success: true,
        accessToken: "signup-bearer-token",
      });
    });

    it("returns error message when duplicate email is registered (409 conflict)", async () => {
      const mockConflictResponse = {
        success: false,
        error: "CONFLICT",
        message: "An account with this email already exists.",
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 409,
        json: () => Promise.resolve(mockConflictResponse),
      } as Response);

      const result = await signUpUser({
        email: "existing@example.com",
        password: "securepassword123",
      });

      expect(result).toEqual({
        success: false,
        error: "An account with this email already exists.",
      });
    });

    it("returns error message on validation failure (422/400)", async () => {
      const mockValidationError = {
        success: false,
        error: "UNPROCESSABLE_ENTITY",
        message: "Password must be at least 8 characters long.",
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 422,
        json: () => Promise.resolve(mockValidationError),
      } as Response);

      const result = await signUpUser({
        email: "user@example.com",
        password: "short",
      });

      expect(result).toEqual({
        success: false,
        error: "Password must be at least 8 characters long.",
      });
    });

    it("handles network error gracefully during signup", async () => {
      global.fetch = vi.fn().mockRejectedValue(new Error("Network failure"));

      const result = await signUpUser({
        email: "user@example.com",
        password: "password123",
      });

      expect(result).toEqual({
        success: false,
        error: "Unable to connect to authentication server.",
      });
    });
  });

  describe("getCurrentUser", () => {
    it("sends GET request to /v1/users/me with Bearer token and returns user profile on success", async () => {
      const mockUserResponse = {
        success: true,
        data: {
          id: "123e4567-e89b-12d3-a456-426614174000",
          email: "alex@example.com",
          created_at: "2026-09-06T10:00:00Z",
          updated_at: "2026-09-06T10:00:00Z",
        },
        message: "The current user identity.",
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: () => Promise.resolve(mockUserResponse),
      } as Response);

      const { getCurrentUser } = await import("./auth-service");
      const result = await getCurrentUser("valid-bearer-token");

      expect(global.fetch).toHaveBeenCalledWith(
        "http://localhost:8080/v1/users/me",
        expect.objectContaining({
          method: "GET",
          cache: "no-store",
          headers: {
            Authorization: "Bearer valid-bearer-token",
          },
        }),
      );

      expect(result).toEqual({
        success: true,
        status: 200,
        user: {
          id: "123e4567-e89b-12d3-a456-426614174000",
          email: "alex@example.com",
          created_at: "2026-09-06T10:00:00Z",
          updated_at: "2026-09-06T10:00:00Z",
        },
      });
    });

    it("returns error message and status code when token is invalid or unauthorized (401)", async () => {
      const mockErrorResponse = {
        success: false,
        error: "UNAUTHORIZED",
        message: "Unauthenticated or invalid token.",
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 401,
        json: () => Promise.resolve(mockErrorResponse),
      } as Response);

      const { getCurrentUser } = await import("./auth-service");
      const result = await getCurrentUser("invalid-token");

      expect(result).toEqual({
        success: false,
        status: 401,
        error: "Unauthenticated or invalid token.",
      });
    });

    it("handles non-JSON error bodies gracefully without throwing", async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 502,
        json: () => Promise.reject(new Error("Unexpected token < in JSON")),
      } as Response);

      const { getCurrentUser } = await import("./auth-service");
      const result = await getCurrentUser("valid-token");

      expect(result).toEqual({
        success: false,
        status: 502,
        error: "HTTP error 502",
      });
    });

    it("handles network error gracefully when retrieving user profile", async () => {
      global.fetch = vi.fn().mockRejectedValue(new Error("Connection error"));

      const { getCurrentUser } = await import("./auth-service");
      const result = await getCurrentUser("valid-token");

      expect(result).toEqual({
        success: false,
        error: "Unable to connect to authentication server.",
      });
    });
  });
});


