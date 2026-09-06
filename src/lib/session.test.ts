import { describe, expect, it, vi, beforeEach } from "vitest";
import { getSessionToken, setSessionToken, clearSessionToken, COOKIE_NAME } from "./session";

// Mock next/headers cookies()
const mockCookieStore = {
  get: vi.fn(),
  set: vi.fn(),
  delete: vi.fn(),
};

vi.mock("next/headers", () => ({
  cookies: vi.fn(() => Promise.resolve(mockCookieStore)),
}));

describe("session", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getSessionToken", () => {
    it("returns null when cookie does not exist", async () => {
      mockCookieStore.get.mockReturnValue(undefined);
      const token = await getSessionToken();
      expect(token).toBeNull();
      expect(mockCookieStore.get).toHaveBeenCalledWith(COOKIE_NAME);
    });

    it("returns token value when cookie exists", async () => {
      mockCookieStore.get.mockReturnValue({ value: "test-token-123" });
      const token = await getSessionToken();
      expect(token).toBe("test-token-123");
      expect(mockCookieStore.get).toHaveBeenCalledWith(COOKIE_NAME);
    });
  });

  describe("setSessionToken", () => {
    it("sets httpOnly cookie with token value", async () => {
      await setSessionToken("new-token-456");
      expect(mockCookieStore.set).toHaveBeenCalledWith(COOKIE_NAME, "new-token-456", {
        httpOnly: true,
        secure: false, // development environment
        sameSite: "lax",
        path: "/",
      });
    });
  });

  describe("clearSessionToken", () => {
    it("deletes the session cookie", async () => {
      await clearSessionToken();
      expect(mockCookieStore.delete).toHaveBeenCalledWith(COOKIE_NAME);
    });
  });
});
