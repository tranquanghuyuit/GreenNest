import test from "node:test";
import assert from "node:assert/strict";
import { createHmac } from "node:crypto";
import { verifyAccessToken } from "../src/utils/tokens.js";
import { buildQueryString, formatVnpayDate } from "../src/utils/vnpay.js";
import { buildVietqrImageUrl, buildVietqrTransferContent } from "../src/utils/vietqr.js";

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

test("formatVnpayDate returns compact VNPAY date string", () => {
  assert.match(formatVnpayDate(new Date("2026-05-20T10:20:30+07:00")), /^\d{14}$/);
});

test("buildQueryString sorts and encodes VNPAY params", () => {
  assert.equal(
    buildQueryString({
      vnp_OrderInfo: "Thanh toan don hang",
      vnp_Amount: "1000000"
    }),
    "vnp_Amount=1000000&vnp_OrderInfo=Thanh+toan+don+hang"
  );
});

test("VietQR helpers create transfer content and image URL", () => {
  const content = buildVietqrTransferContent("ORD-123456");
  const imageUrl = buildVietqrImageUrl(123456, content);

  assert.equal(content, "GN ORD-123456");
  assert.match(imageUrl, /^https:\/\/img\.vietqr\.io\/image\//);
  assert.match(imageUrl, /amount=123456/);
});
