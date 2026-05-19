import { createHmac, createHash, randomBytes } from "crypto";
import { config } from "../config.js";
import type { AccessTokenPayload, AuthUser } from "../types/auth.js";

function base64UrlEncode(input: string | Buffer) {
  const buffer = typeof input === "string" ? Buffer.from(input) : input;
  return buffer.toString("base64url");
}

function base64UrlDecodeJson<T>(input: string): T {
  return JSON.parse(Buffer.from(input, "base64url").toString("utf8")) as T;
}

function sign(data: string) {
  return createHmac("sha256", config.jwtSecret).update(data).digest("base64url");
}

export function signAccessToken(user: AuthUser) {
  const now = Math.floor(Date.now() / 1000);
  const header = base64UrlEncode(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const payload = base64UrlEncode(
    JSON.stringify({
      sub: user.id,
      email: user.email,
      username: user.username,
      role: user.role,
      type: "access",
      iat: now,
      exp: now + config.accessTokenExpiresSeconds
    })
  );
  const signature = sign(`${header}.${payload}`);

  return `${header}.${payload}.${signature}`;
}

export function verifyAccessToken(token: string): AccessTokenPayload | null {
  const [header, payload, signature] = token.split(".");

  if (!header || !payload || !signature) {
    return null;
  }

  if (sign(`${header}.${payload}`) !== signature) {
    return null;
  }

  const decoded = base64UrlDecodeJson<AccessTokenPayload>(payload);
  const now = Math.floor(Date.now() / 1000);

  if (decoded.type !== "access" || decoded.exp <= now) {
    return null;
  }

  return decoded;
}

export function createRefreshToken() {
  return randomBytes(48).toString("base64url");
}

export function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}
