import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { authenticateUser } from "./auth-service";

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
});
