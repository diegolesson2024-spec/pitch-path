import { test } from "node:test";
import assert from "node:assert/strict";
import { hashResetToken, newResetToken, RESET_TOKEN_TTL_MS } from "./reset-token";

test("reset tokens are random, long, and stored only as a hash", () => {
  const a = newResetToken();
  const b = newResetToken();
  assert.notEqual(a.token, b.token);
  assert.ok(a.token.length >= 40);
  assert.equal(a.tokenHash, hashResetToken(a.token));
  assert.notEqual(a.tokenHash, a.token);
  assert.match(a.tokenHash, /^[0-9a-f]{64}$/);
});

test("reset tokens expire in about an hour", () => {
  const { expiresAt } = newResetToken();
  const ms = expiresAt.getTime() - Date.now();
  assert.ok(ms > RESET_TOKEN_TTL_MS - 5000 && ms <= RESET_TOKEN_TTL_MS);
});
