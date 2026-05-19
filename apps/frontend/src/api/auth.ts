const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? "http://localhost:4000").replace(/\/$/, "");

export type AuthApiUser = {
  id: string;
  email: string;
  username: string;
  role: "customer" | "admin";
  status: "active" | "blocked";
};

export type AuthTokens = {
  accessToken: string;
  refreshToken: string;
};

type AuthResponse = AuthTokens & {
  user: AuthApiUser;
  tokenType: "Bearer";
  expiresIn: number;
};

type MeResponse = {
  user: AuthApiUser;
};

type ApiErrorBody = {
  message?: string;
  details?: {
    message?: string;
  };
};

export class AuthApiError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number
  ) {
    super(message);
  }
}

async function requestAuth<T>(path: string, options: RequestInit = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      Accept: "application/json",
      ...(options.body ? { "Content-Type": "application/json" } : {}),
      ...options.headers
    }
  });

  const contentType = response.headers.get("content-type") ?? "";
  const data = contentType.includes("application/json") ? ((await response.json()) as ApiErrorBody) : null;

  if (!response.ok) {
    throw new AuthApiError(data?.details?.message ?? data?.message ?? "Không thể gọi Auth API.", response.status);
  }

  return data as T;
}

export function registerAccount(payload: { email: string; username: string; password: string }) {
  return requestAuth<AuthResponse>("/api/auth/register", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export function loginWithPassword(payload: { login: string; password: string }) {
  return requestAuth<AuthResponse>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export function loginWithGoogleCode(payload: { code: string; redirectUri: string }) {
  return requestAuth<AuthResponse>("/api/auth/google/callback", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export function fetchCurrentUser(accessToken: string) {
  return requestAuth<MeResponse>("/api/auth/me", {
    headers: {
      Authorization: `Bearer ${accessToken}`
    }
  });
}

export function refreshAuthSession(refreshToken: string) {
  return requestAuth<AuthResponse>("/api/auth/refresh", {
    method: "POST",
    body: JSON.stringify({ refreshToken })
  });
}

export function logoutAuthSession(refreshToken: string) {
  return requestAuth<{ success: boolean }>("/api/auth/logout", {
    method: "POST",
    body: JSON.stringify({ refreshToken })
  });
}
