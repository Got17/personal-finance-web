import { Account } from "@/lib/schemas/accounts";
import { Category } from "@/lib/schemas/categories";
import { UserProfile } from "@/lib/auth-service";

export interface MockUser extends UserProfile {
  password: string;
}

function generateId(prefix: string): string {
  return `${prefix}-${Date.now()}-${crypto.randomUUID().substring(0, 8)}`;
}

function jsonResponse(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

function parseRequestBody(body: unknown): Record<string, unknown> {
  if (typeof body !== "string" || !body) return {};
  try {
    return JSON.parse(body);
  } catch {
    return {};
  }
}

const SUPPORTED_CURRENCIES = [
  { code: "LAK", name: "Lao Kip", symbol: "₭", decimal_digits: 0 },
  { code: "THB", name: "Thai Baht", symbol: "฿", decimal_digits: 2 },
  { code: "USD", name: "US Dollar", symbol: "$", decimal_digits: 2 },
  { code: "CNY", name: "Chinese Yuan", symbol: "¥", decimal_digits: 2 },
  { code: "EUR", name: "Euro", symbol: "€", decimal_digits: 2 },
];

function handleSignUp(
  body: Record<string, unknown>,
  users: Map<string, MockUser>,
  tokens: Map<string, string>
): Response {
  const email = typeof body.email === "string" ? body.email : "";
  const password = typeof body.password === "string" ? body.password : "";
  if (!email || !password) {
    return jsonResponse(
      { success: false, error: "VALIDATION_FAILED", message: "Email and password required" },
      422
    );
  }
  const emailExists = Array.from(users.values()).some((u) => u.email === email);
  if (emailExists) {
    return jsonResponse(
      { success: false, error: "CONFLICT", message: "Email already in use" },
      409
    );
  }
  const userId = generateId("usr");
  const now = new Date().toISOString();
  const user: MockUser = {
    id: userId,
    email,
    password,
    base_currency: "USD",
    created_at: now,
    updated_at: now,
  };
  users.set(userId, user);
  const token = `token-${userId}`;
  tokens.set(token, userId);
  return jsonResponse(
    { success: true, data: { access_token: token, token_type: "Bearer" }, message: "User created" },
    201
  );
}

function handleLogin(
  body: Record<string, unknown>,
  users: Map<string, MockUser>,
  tokens: Map<string, string>
): Response {
  const { email, password } = body;
  const targetUser = Array.from(users.values()).find(
    (u) => u.email === email && u.password === password
  );
  if (!targetUser) {
    return jsonResponse(
      { success: false, error: "invalid_credentials", message: "Invalid credentials" },
      401
    );
  }
  const token = `token-${targetUser.id}`;
  tokens.set(token, targetUser.id);
  return jsonResponse(
    { success: true, data: { access_token: token, token_type: "Bearer" }, message: "Login successful" },
    200
  );
}

function handlePublicRoutes(
  path: string,
  method: string,
  body: Record<string, unknown>,
  users: Map<string, MockUser>,
  tokens: Map<string, string>
): Response | null {
  if (path === "/v1/auth/signup" && method === "POST") {
    return handleSignUp(body, users, tokens);
  }
  if (path === "/v1/currencies" && method === "GET") {
    return jsonResponse({ success: true, data: SUPPORTED_CURRENCIES, message: "The supported currencies." }, 200);
  }
  if (path === "/v1/auth/login" && method === "POST") {
    return handleLogin(body, users, tokens);
  }
  return null;
}

function authenticate(
  headers: Headers,
  tokens: Map<string, string>,
  users: Map<string, MockUser>
): MockUser | null {
  const auth = headers.get("Authorization");
  if (!auth?.startsWith("Bearer ")) return null;
  const token = auth.replace("Bearer ", "").trim();
  const userId = tokens.get(token);
  return userId ? users.get(userId) || null : null;
}

function handleUserPreferences(
  method: string,
  body: Record<string, unknown>,
  currentUser: MockUser
): Response | null {
  if (method === "GET") {
    return jsonResponse(
      { success: true, data: { base_currency: currentUser.base_currency || "USD" }, message: "Preferences" },
      200
    );
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
  return null;
}

function handleUserRoutes(
  path: string,
  method: string,
  body: Record<string, unknown>,
  currentUser: MockUser
): Response | null {
  if (path === "/v1/users/me" && method === "GET") {
    const publicUser: UserProfile = {
      id: currentUser.id,
      email: currentUser.email,
      base_currency: currentUser.base_currency,
      created_at: currentUser.created_at,
      updated_at: currentUser.updated_at,
    };
    return jsonResponse({ success: true, data: publicUser, message: "User info" }, 200);
  }
  if (path === "/v1/users/me/preferences") {
    return handleUserPreferences(method, body, currentUser);
  }
  return null;
}

function handleAccountCollection(
  method: string,
  body: Record<string, unknown>,
  currentUser: MockUser,
  accounts: Map<string, Account>
): Response | null {
  if (method === "GET") {
    const userAccounts = Array.from(accounts.values()).filter((a) => a.user_id === currentUser.id);
    return jsonResponse({ success: true, data: userAccounts, message: "Accounts retrieved" }, 200);
  }
  if (method === "POST") {
    const { name, type, currency, description, is_active } = body;
    if (
      typeof name !== "string" ||
      !name ||
      typeof type !== "string" ||
      !type ||
      typeof currency !== "string" ||
      !currency
    ) {
      return jsonResponse({ success: false, error: "VALIDATION_FAILED", message: "Missing required fields" }, 422);
    }
    const accId = generateId("acc");
    const account: Account = {
      id: accId,
      user_id: currentUser.id,
      name,
      type: type as Account["type"],
      currency,
      description: typeof description === "string" ? description : null,
      is_active: typeof is_active === "boolean" ? is_active : true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    accounts.set(accId, account);
    return jsonResponse({ success: true, data: account, message: "Account created" }, 201);
  }
  return null;
}

function handleAccountItem(
  id: string,
  method: string,
  body: Record<string, unknown>,
  currentUser: MockUser,
  accounts: Map<string, Account>
): Response {
  const existing = accounts.get(id);
  if (!existing) {
    return jsonResponse({ success: false, error: "NOT_FOUND", message: "Account not found." }, 404);
  }
  if (existing.user_id !== currentUser.id) {
    return jsonResponse({ success: false, error: "FORBIDDEN", message: "Forbidden account access" }, 403);
  }
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
  return jsonResponse({ success: false, error: "NOT_FOUND", message: "Endpoint not found" }, 404);
}

function handleAccountRoutes(
  path: string,
  method: string,
  body: Record<string, unknown>,
  currentUser: MockUser,
  accounts: Map<string, Account>
): Response | null {
  if (path === "/v1/accounts") {
    return handleAccountCollection(method, body, currentUser, accounts);
  }
  if (path.startsWith("/v1/accounts/")) {
    const id = path.substring("/v1/accounts/".length);
    return handleAccountItem(id, method, body, currentUser, accounts);
  }
  return null;
}

function handleCategoryCollection(
  method: string,
  body: Record<string, unknown>,
  currentUser: MockUser,
  categories: Map<string, Category>
): Response | null {
  if (method === "GET") {
    const userCategories = Array.from(categories.values()).filter((c) => c.user_id === currentUser.id);
    return jsonResponse({ success: true, data: userCategories, message: "Categories retrieved" }, 200);
  }
  if (method === "POST") {
    const { name, type, is_active } = body;
    if (typeof name !== "string" || !name || typeof type !== "string" || !type) {
      return jsonResponse({ success: false, error: "VALIDATION_FAILED", message: "Missing required fields" }, 422);
    }
    const catId = generateId("cat");
    const category: Category = {
      id: catId,
      user_id: currentUser.id,
      name,
      type: type as Category["type"],
      is_active: typeof is_active === "boolean" ? is_active : true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    categories.set(catId, category);
    return jsonResponse({ success: true, data: category, message: "Category created" }, 201);
  }
  return null;
}

function handleCategoryItem(
  id: string,
  method: string,
  body: Record<string, unknown>,
  currentUser: MockUser,
  categories: Map<string, Category>
): Response {
  const existing = categories.get(id);
  if (!existing) {
    return jsonResponse({ success: false, error: "NOT_FOUND", message: "Category not found." }, 404);
  }
  if (existing.user_id !== currentUser.id) {
    return jsonResponse({ success: false, error: "FORBIDDEN", message: "Forbidden category access" }, 403);
  }
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
  return jsonResponse({ success: false, error: "NOT_FOUND", message: "Endpoint not found" }, 404);
}

function handleCategoryRoutes(
  path: string,
  method: string,
  body: Record<string, unknown>,
  currentUser: MockUser,
  categories: Map<string, Category>
): Response | null {
  if (path === "/v1/categories") {
    return handleCategoryCollection(method, body, currentUser, categories);
  }
  if (path.startsWith("/v1/categories/")) {
    const id = path.substring("/v1/categories/".length);
    return handleCategoryItem(id, method, body, currentUser, categories);
  }
  return null;
}

export function createMockApiHandler() {
  const users = new Map<string, MockUser>();
  const tokens = new Map<string, string>();
  const accounts = new Map<string, Account>();
  const categories = new Map<string, Category>();

  async function handleRequest(urlStr: string, init?: RequestInit): Promise<Response> {
    const url = new URL(urlStr);
    const path = url.pathname;
    const method = (init?.method || "GET").toUpperCase();
    const headers = new Headers(init?.headers);
    const body = parseRequestBody(init?.body);

    const publicResponse = handlePublicRoutes(path, method, body, users, tokens);
    if (publicResponse) return publicResponse;

    const currentUser = authenticate(headers, tokens, users);
    if (!currentUser) {
      return jsonResponse({ success: false, error: "UNAUTHORIZED", message: "Unauthenticated or invalid token." }, 401);
    }

    const authResponse =
      handleUserRoutes(path, method, body, currentUser) ||
      handleAccountRoutes(path, method, body, currentUser, accounts) ||
      handleCategoryRoutes(path, method, body, currentUser, categories);

    return authResponse || jsonResponse({ success: false, error: "NOT_FOUND", message: "Endpoint not found" }, 404);
  }

  return { handleRequest };
}
