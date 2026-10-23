"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { canManageTeam } from "@/lib/access";
import { audit } from "@/lib/audit";

export async function createTeam(form: FormData) {
  const user = await requireUser(["ADMIN", "CLUB"]);
  const data = z
    .object({
      name: z.string().trim().min(2).max(60),
      ageGroup: z.string().trim().min(2).max(10),
      season: z.string().trim().min(4).max(12),
      clubId: z.string().optional(),
    })
    .parse(Object.fromEntries(form));
  const clubId = user.role === "ADMIN" ? data.clubId : user.clubId;
  if (!clubId) throw new Error("Club required");
  const team = await db.team.create({ data: { clubId, name: data.name, ageGroup: data.ageGroup, season: data.season } });
  await audit(user.id, "TEAM_CREATED", `team:${team.id}`, team.name);
  redirect(`/teams/${team.id}`);
}

export async function assignCoach(teamId: string, form: FormData) {
  const user = await requireUser(["ADMIN", "CLUB"]);
  if (!(await canManageTeam(user, teamId))) throw new Error("Not allowed");
  const team = await db.team.findUniqueOrThrow({ where: { id: teamId } });
  const coachId = z.string().parse(form.get("userId"));
  const coach = await db.user.findFirst({ where: { id: coachId, role: "COACH", clubId: team.clubId } });
  if (!coach) throw new Error("Coach not in this club");
  await db.coachTeam.upsert({ where: { userId_teamId: { userId: coach.id, teamId } }, create: { userId: coach.id, teamId }, update: {} });
  await audit(user.id, "COACH_ASSIGNED", `team:${teamId}`, coach.name);
  revalidatePath(`/teams/${teamId}`);
}

export async function recordSession(teamId: string, form: FormData) {
  const user = await requireUser(["ADMIN", "CLUB", "COACH"]);
  if (!(await canManageTeam(user, teamId))) throw new Error("Not allowed");
  const data = z
    .object({ date: z.coerce.date(), kind: z.enum(["TRAINING", "MATCH"]), title: z.string().trim().min(1).max(80) })
    .parse({ date: form.get("date"), kind: form.get("kind"), title: form.get("title") });
  const players = await db.player.findMany({ where: { teamId }, select: { id: true } });
  const status = z.enum(["PRESENT", "LATE", "ABSENT", "EXCUSED"]);
  await db.session.create({
    data: {
      teamId,
      ...data,
      attendance: {
        create: players.map((p) => ({ playerId: p.id, status: status.catch("PRESENT").parse(form.get(`att_${p.id}`)) })),
      },
    },
  });
  revalidatePath(`/teams/${teamId}`);
}
