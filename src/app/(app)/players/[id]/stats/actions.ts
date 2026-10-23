"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { getManageablePlayer } from "@/lib/access";

const count = z.coerce.number().int().min(0).max(500);

const schema = z
  .object({
    opponent: z.string().trim().min(1).max(80),
    date: z.coerce.date(),
    competition: z.enum(["League", "Cup", "Friendly", "Tournament"]),
    minutes: z.coerce.number().int().min(0).max(130),
    goals: count,
    assists: count,
    shots: count,
    shotsOnTarget: count,
    keyPasses: count,
    passesCompleted: count,
    passesAttempted: count,
    dribblesWon: count,
    tackles: count,
    interceptions: count,
    rating: z.preprocess((v) => (v === "" ? undefined : v), z.coerce.number().min(1).max(10).optional()),
  })
  .refine((d) => d.shotsOnTarget <= d.shots, "Shots on target can't exceed total shots")
  .refine((d) => d.passesCompleted <= d.passesAttempted, "Completed passes can't exceed total passes");

export async function saveMatchStats(playerId: string, form: FormData) {
  const user = await requireUser(["ADMIN", "CLUB", "COACH"]);
  await getManageablePlayer(user, playerId);
  const data = schema.parse(Object.fromEntries(form));
  await db.matchStat.create({ data: { playerId, ...data } });
  redirect(`/players/${playerId}`);
}
