import "server-only";
import { db } from "./db";

export type NotificationInput = {
  kind: "EVALUATION" | "PLAN" | "NOTE" | "REMINDER" | "BADGE";
  title: string;
  body?: string;
  href: string;
  dedupeKey?: string;
};

// Creates a notification once per (user, dedupeKey); without a key it always creates one.
export async function notifyUser(userId: string, n: NotificationInput) {
  try {
    await db.notification.create({ data: { userId, kind: n.kind, title: n.title, body: n.body ?? "", href: n.href, dedupeKey: n.dedupeKey } });
  } catch (e) {
    if ((e as { code?: string }).code !== "P2002") throw e; // already sent
  }
}

// Notifies every parent/player account linked to a player.
export async function notifyFamily(playerId: string, n: NotificationInput, opts: { only?: "PARENT" | "SELF"; exceptUserId?: string } = {}) {
  const access = await db.playerAccess.findMany({ where: { playerId, ...(opts.only ? { relation: opts.only } : {}) } });
  for (const a of access) {
    if (a.userId === opts.exceptUserId) continue;
    await notifyUser(a.userId, n);
  }
}
