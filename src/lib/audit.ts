import "server-only";
import { db } from "./db";

export async function audit(userId: string | null, action: string, target: string, detail = "") {
  await db.auditLog.create({ data: { userId, action, target, detail } });
}
