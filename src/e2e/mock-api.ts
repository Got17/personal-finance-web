import { Account } from "@/lib/schemas/accounts";
import { Category } from "@/lib/schemas/categories";
import { UserProfile } from "@/lib/auth-service";

export interface MockUser extends UserProfile {
  password: string;
}

export function createMockApiHandler() {
  const users = new Map<string, MockUser>();
  const tokens = new Map<string, string>();
  const accounts = new Map<string, Account>();
  const categories = new Map<string, Category>();

  function authenticate(requestHeaders: Headers): MockUser | null {
    const auth = requestHeaders.get("Authorization");
    if (!auth || !auth.startsWith("Bearer ")) return null;
    const token = auth.replace("Bearer ", "").trim();
    const userId = tokens.get(token);
    return userId ? users.get(userId) || null : null;
  }

  function jsonResponse(data: unknown, status = 200): Response {
    return new Response(JSON.stringify(data), {
      status,
      headers: { "Content-Type": "application/json" },
    });
  }

  function generateId(prefix: string): string {
    return `${prefix}-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
  }

  async function handleRequest(urlStr: string, init?: RequestInit): Promise<Response> {
    const url = new URL(urlStr);
    const path = url.pathname;
    const method = (init?.method || "GET").toUpperCase();
    const headers = new Headers(init?.headers);
    const body = JSON.parse((typeof init?.body === "string" ? init.body : "") || "{}");

    // Unauthenticated Endpoints
    if (path === "/v1/auth/signup" && method === "POST") {
      const { email, password } = body;
      if (!email || !password) {
        return jsonResponse({ success: false, error: "VALIDATION_FAILED", message: "Email and password required" }, 422);
      }
      for (const existingUser of users.values()) {
        if (existingUser.email === email) {
          return jsonResponse({ success: false, error: "CONFLICT", message: "Email already in use" }, 409);
        }
      }
      const userId = generateId("usr");
      const user: MockUser = {
        id: userId,
        email,
        password,
        base_currency: "USD",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      users.set(userId, user);
      const token = `token-${userId}`;
      tokens.set(token, userId);
      return jsonResponse({ success: true, data: { access_token: token, token_type: "Bearer" }, message: "User created" }, 201);
    }

    if (path === "/v1/auth/login" && method === "POST") {
      const { email, password } = body;
      const targetUser = Array.from(users.values()).find((u) => u.email === email && u.password === password);
      if (!targetUser) {
        return jsonResponse({ success: false, error: "invalid_credentials", message: "Invalid credentials" }, 401);
      }
      const token = `token-${targetUser.id}`;
      tokens.set(token, targetUser.id);
      return jsonResponse({ success: true, data: { access_token: token, token_type: "Bearer" }, message: "Login successful" }, 200);
    }

    // Authenticated Endpoints Guard
    const currentUser = authenticate(headers);
    if (!currentUser) {
      return jsonResponse({ success: false, error: "UNAUTHORIZED", message: "Unauthenticated or invalid token." }, 401);
    }

    if (path === "/v1/users/me" && method === "GET") {
      const { password: _password, ...publicUser } = currentUser;
      return jsonResponse({ success: true, data: publicUser, message: "User info" }, 200);
    }

    if (path === "/v1/users/me/preferences") {
      if (method === "GET") {
        return jsonResponse({ success: true, data: { base_currency: currentUser.base_currency || "USD" }, message: "Preferences" }, 200);
      }
      if (method === "PUT" || method === "PATCH") {
        const { base_currency } = body;
        if (!base_currency || typeof base_currency !== "string" || !/^[A-Z]{3}$/.test(base_currency)) {
          return jsonResponse({ success: false, error: "INVALID_CURRENCY", message: "Invalid currency code" }, 422);
        }
        currentUser.base_currency = base_currency;
        currentUser.updated_at = new Date().toISOString();
        return jsonResponse({ success: true, data: { base_currency }, message: "Preferences updated" }, 200);
      }
    }

    // Accounts Routes
    if (path === "/v1/accounts") {
      if (method === "GET") {
        const userAccounts = Array.from(accounts.values()).filter((a) => a.user_id === currentUser.id);
        return jsonResponse({ success: true, data: userAccounts, message: "Accounts retrieved" }, 200);
      }
      if (method === "POST") {
        const { name, type, currency, description, is_active } = body;
        if (!name || !type || !currency) {
          return jsonResponse({ success: false, error: "VALIDATION_FAILED", message: "Missing required fields" }, 422);
        }
        const accId = generateId("acc");
        const account: Account = {
          id: accId,
          user_id: currentUser.id,
          name,
          type,
          currency,
          description: description || null,
          is_active: is_active ?? true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        accounts.set(accId, account);
        return jsonResponse({ success: true, data: account, message: "Account created" }, 201);
      }
    }

    if (path.startsWith("/v1/accounts/")) {
      const id = path.substring("/v1/accounts/".length);
      const existing = accounts.get(id);
      if (!existing) return jsonResponse({ success: false, error: "NOT_FOUND", message: "Account not found." }, 404);
      if (existing.user_id !== currentUser.id) return jsonResponse({ success: false, error: "FORBIDDEN", message: "Forbidden account access" }, 403);

      if (method === "PUT" || method === "PATCH") {
        const updated: Account = { ...existing, ...body, updated_at: new Date().toISOString() };
        accounts.set(id, updated);
        return jsonResponse({ success: true, data: updated, message: "Account updated" }, 200);
      }
      if (method === "DELETE") {
        const deactivated: Account = { ...existing, is_active: false, updated_at: new Date().toISOString() };
        accounts.set(id, deactivated);
        return jsonResponse({ success: true, data: deactivated, message: "Account deactivated" }, 200);
      }
    }

    // Categories Routes
    if (path === "/v1/categories") {
      if (method === "GET") {
        const userCategories = Array.from(categories.values()).filter((c) => c.user_id === currentUser.id);
        return jsonResponse({ success: true, data: userCategories, message: "Categories retrieved" }, 200);
      }
      if (method === "POST") {
        const { name, type, is_active } = body;
        if (!name || !type) {
          return jsonResponse({ success: false, error: "VALIDATION_FAILED", message: "Missing required fields" }, 422);
        }
        const catId = generateId("cat");
        const category: Category = {
          id: catId,
          user_id: currentUser.id,
          name,
          type,
          is_active: is_active ?? true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        categories.set(catId, category);
        return jsonResponse({ success: true, data: category, message: "Category created" }, 201);
      }
    }

    if (path.startsWith("/v1/categories/")) {
      const id = path.substring("/v1/categories/".length);
      const existing = categories.get(id);
      if (!existing) return jsonResponse({ success: false, error: "NOT_FOUND", message: "Category not found." }, 404);
      if (existing.user_id !== currentUser.id) return jsonResponse({ success: false, error: "FORBIDDEN", message: "Forbidden category access" }, 403);

      if (method === "PUT" || method === "PATCH") {
        const updated: Category = { ...existing, ...body, updated_at: new Date().toISOString() };
        categories.set(id, updated);
        return jsonResponse({ success: true, data: updated, message: "Category updated" }, 200);
      }
      if (method === "DELETE") {
        const deactivated: Category = { ...existing, is_active: false, updated_at: new Date().toISOString() };
        categories.set(id, deactivated);
        return jsonResponse({ success: true, data: deactivated, message: "Category deactivated" }, 200);
      }
    }

    return jsonResponse({ success: false, error: "NOT_FOUND", message: "Endpoint not found" }, 404);
  }

  return { handleRequest };
}
