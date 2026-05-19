import {
  createRefreshToken as createRefreshTokenRecord,
  createUser,
  findActiveRefreshToken,
  findUserById,
  findUserByLogin,
  revokeRefreshToken
} from "../repositories/auth.repository.js";
import type { AuthUser, PublicUser } from "../types/auth.js";
import { hashPassword, verifyPassword } from "../utils/password.js";
import { exchangeGoogleCodeForProfile } from "../utils/google-oauth.js";
import {
  createRefreshToken,
  hashToken,
  signAccessToken,
  verifyAccessToken
} from "../utils/tokens.js";
import { config } from "../config.js";
import { AuthError } from "../errors/auth-error.js";

type RegisterInput = {
  email?: string;
  username?: string;
  password?: string;
};

type LoginInput = {
  login?: string;
  email?: string;
  username?: string;
  password?: string;
};

type GoogleCallbackInput = {
  code?: string;
  redirectUri?: string;
};

function toPublicUser(user: AuthUser): PublicUser {
  return {
    id: user.id,
    email: user.email,
    username: user.username,
    role: user.role,
    status: user.status
  };
}

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function normalizeUsername(username: string) {
  return username.trim().toLowerCase();
}

function assertValidPassword(password: string | undefined): asserts password is string {
  if (!password || password.length < 8) {
    throw new AuthError("Password must have at least 8 characters", 400);
  }
}

function assertValidEmail(email: string | undefined): asserts email is string {
  if (!email || !email.includes("@")) {
    throw new AuthError("Valid email is required", 400);
  }
}

function buildUsername(email: string, username: string | undefined) {
  const rawUsername = username || email.split("@")[0];
  const normalized = normalizeUsername(rawUsername).replace(/[^a-z0-9_.-]/g, "");
  return normalized || "google_user";
}

async function buildUniqueUsername(email: string, preferredUsername?: string) {
  const baseUsername = buildUsername(email, preferredUsername);

  for (let index = 0; index < 20; index += 1) {
    const candidate = index === 0 ? baseUsername : `${baseUsername}${index}`;
    const existing = await findUserByLogin(candidate);

    if (!existing) {
      return candidate;
    }
  }

  return `${baseUsername}${Date.now()}`;
}

function buildRefreshTokenExpiresAt() {
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + config.refreshTokenExpiresDays);
  return expiresAt;
}

async function issueTokens(user: AuthUser) {
  const accessToken = signAccessToken(user);
  const refreshToken = createRefreshToken();

  await createRefreshTokenRecord({
    userId: user.id,
    tokenHash: hashToken(refreshToken),
    expiresAt: buildRefreshTokenExpiresAt()
  });

  return {
    accessToken,
    refreshToken,
    tokenType: "Bearer",
    expiresIn: config.accessTokenExpiresSeconds
  };
}

export async function register(input: RegisterInput) {
  assertValidEmail(input.email);
  assertValidPassword(input.password);

  const email = normalizeEmail(input.email);
  const username = buildUsername(email, input.username);
  const existing = await findUserByLogin(email);

  if (existing) {
    throw new AuthError("Email or username already exists", 409);
  }

  const passwordHash = await hashPassword(input.password);

  try {
    const user = await createUser({
      email,
      username,
      passwordHash
    });
    const tokens = await issueTokens(user);

    return {
      user: toPublicUser(user),
      ...tokens
    };
  } catch (error) {
    if (error instanceof Error && error.message.includes("duplicate key")) {
      throw new AuthError("Email or username already exists", 409);
    }

    throw error;
  }
}

export async function login(input: LoginInput) {
  const loginValue = normalizeUsername(input.login || input.email || input.username || "");

  if (!loginValue || !input.password) {
    throw new AuthError("Login and password are required", 400);
  }

  const user = await findUserByLogin(loginValue);

  if (!user || !(await verifyPassword(input.password, user.passwordHash))) {
    throw new AuthError("Invalid login credentials", 401);
  }

  if (user.status !== "active") {
    throw new AuthError("User account is blocked", 403);
  }

  const tokens = await issueTokens(user);

  return {
    user: toPublicUser(user),
    ...tokens
  };
}

export async function loginWithGoogle(input: GoogleCallbackInput) {
  if (!input.code) {
    throw new AuthError("Google authorization code is required", 400);
  }

  const googleProfile = await exchangeGoogleCodeForProfile(input.code, input.redirectUri ?? config.googleRedirectUri);
  const email = normalizeEmail(googleProfile.email);
  const existingUser = await findUserByLogin(email);

  if (existingUser) {
    if (existingUser.status !== "active") {
      throw new AuthError("User account is blocked", 403);
    }

    const tokens = await issueTokens(existingUser);

    return {
      user: toPublicUser(existingUser),
      ...tokens
    };
  }

  const username = await buildUniqueUsername(email, googleProfile.name);
  const user = await createUser({
    email,
    username,
    passwordHash: `oauth:google:${googleProfile.sub}`
  });
  const tokens = await issueTokens(user);

  return {
    user: toPublicUser(user),
    ...tokens
  };
}

export async function getMe(accessToken: string | undefined) {
  if (!accessToken) {
    throw new AuthError("Missing access token", 401);
  }

  const payload = verifyAccessToken(accessToken);

  if (!payload) {
    throw new AuthError("Invalid or expired access token", 401);
  }

  const user = await findUserById(payload.sub);

  if (!user || user.status !== "active") {
    throw new AuthError("User not found or blocked", 401);
  }

  return {
    user: toPublicUser(user)
  };
}

export async function refresh(refreshToken: string | undefined) {
  if (!refreshToken) {
    throw new AuthError("Refresh token is required", 400);
  }

  const tokenHash = hashToken(refreshToken);
  const storedToken = await findActiveRefreshToken(tokenHash);

  if (!storedToken) {
    throw new AuthError("Invalid or expired refresh token", 401);
  }

  const user = await findUserById(storedToken.userId);

  if (!user || user.status !== "active") {
    throw new AuthError("User not found or blocked", 401);
  }

  await revokeRefreshToken(tokenHash);
  const tokens = await issueTokens(user);

  return {
    user: toPublicUser(user),
    ...tokens
  };
}

export async function logout(refreshToken: string | undefined) {
  if (refreshToken) {
    await revokeRefreshToken(hashToken(refreshToken));
  }

  return {
    success: true
  };
}
