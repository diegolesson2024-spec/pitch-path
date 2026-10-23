import "server-only";
import { db } from "./db";
import type { CurrentUser } from "./auth";
import { notifyUser } from "./notify";
import { getPractice, today, weekStart } from "./practice";

// From Wednesday on, families with drills still to do this week get one reminder per player per week.
// Runs when a family member opens the app, so no background job is needed for in-app reminders.
export async function ensureWeeklyReminders(user: CurrentUser) {
  if (user.role !== "PARENT" && user.role !== "PLAYER") return;
  const day = today();
  const dow = new Date(`${day}T00:00:00Z`).getUTCDay();
  if (dow === 1 || dow === 2) return; // Monday and Tuesday: too early to nag

  const access = await db.playerAccess.findMany({ where: { userId: user.id }, include: { player: { select: { firstName: true } } } });
  for (const a of access) {
    const p = await getPractice(a.playerId);
    if (p.drills.length === 0 || p.weekLeft === 0) continue;
    const self = user.role === "PLAYER";
    await notifyUser(user.id, {
      kind: "REMINDER",
      title: self ? `${p.weekLeft} drill${p.weekLeft > 1 ? "s" : ""} left this week. You've got this!` : `${a.player.firstName} has ${p.weekLeft} drill${p.weekLeft > 1 ? "s" : ""} left this week`,
      body: self ? "Do one today to keep your streak going." : "A short session at home today keeps the plan on track.",
      href: self ? "/dashboard" : `/players/${a.playerId}`,
      dedupeKey: `reminder:${a.playerId}:${weekStart(day)}`,
    });
  }
}
