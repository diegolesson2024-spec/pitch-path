import "server-only";
import { db } from "./db";
import { hashResetToken } from "./reset-token";

// Server-only on purpose: exported functions in "use server" files become callable endpoints.
export async function findValidResetToken(token: string) {
  const row = await db.passwordResetToken.findUnique({ where: { tokenHash: hashResetToken(token) } });
  return row && !row.usedAt && row.expiresAt > new Date() ? row : null;
}
