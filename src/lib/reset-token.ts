import crypto from "node:crypto";

export const RESET_TOKEN_TTL_MS = 60 * 60 * 1000; // 1 hour

// The raw token only ever goes in the email link; the database keeps its hash,
// so a leaked database can't be used to reset anyone's password.
export function hashResetToken(token: string) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export function newResetToken() {
  const token = crypto.randomBytes(32).toString("base64url");
  return { token, tokenHash: hashResetToken(token), expiresAt: new Date(Date.now() + RESET_TOKEN_TTL_MS) };
}
