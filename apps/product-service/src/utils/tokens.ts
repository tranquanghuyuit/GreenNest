import { createHmac, timingSafeEqual } from "crypto";
import { config } from "../config.js";
import type { AccessTokenPayload } from "../types/catalog.js";

function base64UrlDecodeJson<T>(input: string): T {
  return JSON.parse(Buffer.from(input, "base64url").toString("utf8")) as T;
}

function sign(data: string) {
  return createHmac("sha256", config.jwtSecret).update(data).digest("base64url");
}

function safeCompare(left: string, right: string) {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);

  return leftBuffer.length === rightBuffer.length && timingSafeEqual(leftBuffer, rightBuffer);
}

export function verifyAccessToken(token: string): AccessTokenPayload | null {
  try {
    const [header, payload, signature] = token.split(".");

    if (!header || !payload || !signature || !safeCompare(sign(`${header}.${payload}`), signature)) {
      return null;
    }

    const decoded = base64UrlDecodeJson<AccessTokenPayload>(payload);
    const now = Math.floor(Date.now() / 1000);

    if (decoded.type !== "access" || decoded.exp <= now) {
      return null;
    }

    return decoded;
  } catch {
    return null;
  }
}
