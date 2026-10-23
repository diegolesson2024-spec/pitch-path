import { test } from "node:test";
import assert from "node:assert/strict";
import { isSameOrigin } from "./origin";

process.env.SESSION_SECRET = "test-secret-that-is-definitely-longer-than-32-chars";

test("session tokens round-trip and reject tampering", async () => {
  const { signSession, verifySession } = await import("./session");
  const token = await signSession({ uid: "u1", role: "COACH", sv: 2 });
  assert.deepEqual(await verifySession(token), { uid: "u1", role: "COACH", sv: 2 });
  const [h, p, s] = token.split(".");
  const forged = Buffer.from(JSON.stringify({ uid: "u1", role: "ADMIN", sv: 2 })).toString("base64url");
  assert.equal(await verifySession(`${h}.${forged}.${s}`), null);
  assert.equal(await verifySession(`${h}.${p}.x${s.slice(1)}`), null);
  assert.equal(await verifySession(undefined), null);
});

test("same-origin check for state-changing route handlers", () => {
  const req = (origin?: string) =>
    new Request("http://app.test/api/drills", { method: "POST", headers: { host: "app.test", ...(origin ? { origin } : {}) } });
  assert.equal(isSameOrigin(req("http://app.test")), true);
  assert.equal(isSameOrigin(req("https://evil.example")), false);
  assert.equal(isSameOrigin(req()), false);
});
