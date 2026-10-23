"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { getViewablePlayer } from "@/lib/access";
import { notifyFamily } from "@/lib/notify";
import { getPractice, today } from "@/lib/practice";

const input = z.object({ playerId: z.string(), drillId: z.string() });

async function check(form: FormData) {
  const user = await requireUser();
  const { playerId, drillId } = input.parse({ playerId: form.get("playerId"), drillId: form.get("drillId") });
  await getViewablePlayer(user, playerId); // families, and staff who can see the player
  const inPlan = await db.planDrill.findFirst({ where: { drillId, plan: { playerId, status: "ACTIVE" } } });
  if (!inPlan) throw new Error("That drill isn't in this player's plan.");
  return { user, playerId, drillId };
}

// "I did it!" Records today's practice and awards any new badges.
export async function logDrill(form: FormData) {
  const { user, playerId, drillId } = await check(form);
  const before = await getPractice(playerId);
  try {
    await db.drillLog.create({ data: { playerId, drillId, day: today(), loggedById: user.id } });
  } catch (e) {
    if ((e as { code?: string }).code !== "P2002") throw e; // already logged today
  }
  const after = await getPractice(playerId);
  const had = new Set(before.badges.filter((b) => b.earned).map((b) => b.key));
  for (const b of after.badges.filter((x) => x.earned && !had.has(x.key))) {
    await notifyFamily(playerId, {
      kind: "BADGE",
      title: `Badge unlocked: ${b.label}!`,
      body: b.hint,
      href: "/dashboard",
      dedupeKey: `badge:${playerId}:${b.key}`,
    });
  }
  revalidatePath("/", "layout");
}

export async function undoDrill(form: FormData) {
  const { playerId, drillId } = await check(form);
  await db.drillLog.deleteMany({ where: { playerId, drillId, day: today() } });
  revalidatePath("/", "layout");
}
