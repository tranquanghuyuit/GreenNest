import test from "node:test";
import assert from "node:assert/strict";
import { hashPassword, verifyPassword } from "../src/utils/password.js";
import { createRefreshToken, hashToken, signAccessToken, verifyAccessToken } from "../src/utils/tokens.js";

test("hashPassword stores a password that verifyPassword can validate", async () => {
  const storedHash = await hashPassword("correct-password");

  assert.equal(await verifyPassword("correct-password", storedHash), true);
  assert.equal(await verifyPassword("wrong-password", storedHash), false);
});

test("signAccessToken creates a token that verifyAccessToken can read", () => {
  const token = signAccessToken({
    id: "user-1",
    email: "user@example.com",
    username: "user",
    role: "customer"
  });
  const payload = verifyAccessToken(token);

  assert.equal(payload?.sub, "user-1");
  assert.equal(payload?.email, "user@example.com");
  assert.equal(payload?.role, "customer");
});

test("hashToken is deterministic and createRefreshToken is random", () => {
  const firstToken = createRefreshToken();
  const secondToken = createRefreshToken();

  assert.notEqual(firstToken, secondToken);
  assert.equal(hashToken(firstToken), hashToken(firstToken));
  assert.notEqual(hashToken(firstToken), firstToken);
});
