import test from "node:test";
import assert from "node:assert/strict";
import { createHmac } from "node:crypto";
import { verifyAccessToken } from "../src/utils/tokens.js";

const jwtSecret = process.env.JWT_SECRET ?? "devsecops-shop-dev-secret";

function base64UrlEncode(value: unknown) {
  return Buffer.from(JSON.stringify(value)).toString("base64url");
}

function signToken(payload: Record<string, unknown>) {
  const header = base64UrlEncode({ alg: "HS256", typ: "JWT" });
  const encodedPayload = base64UrlEncode(payload);
  const signature = createHmac("sha256", jwtSecret).update(`${header}.${encodedPayload}`).digest("base64url");

  return `${header}.${encodedPayload}.${signature}`;
}

test("verifyAccessToken accepts a valid access token", () => {
  const token = signToken({
    sub: "user-1",
    email: "user@example.com",
    username: "user",
    role: "customer",
    type: "access",
    exp: Math.floor(Date.now() / 1000) + 60
  });

  assert.equal(verifyAccessToken(token)?.sub, "user-1");
});

test("verifyAccessToken rejects expired token", () => {
  const token = signToken({
    sub: "user-1",
    type: "access",
    exp: Math.floor(Date.now() / 1000) - 60
  });

  assert.equal(verifyAccessToken(token), null);
});
