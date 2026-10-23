"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { getManageablePlayer } from "@/lib/access";
import { audit } from "@/lib/audit";
import { SKILL_BY_KEY } from "@/lib/skills";
import { drillScope } from "@/lib/drills";
import { notifyFamily } from "@/lib/notify";

const goal = z.object({
  skill: z.string().refine((s) => SKILL_BY_KEY[s], "Unknown skill"),
  description: z.string().trim().min(1).max(300),
  metric: z.string().trim().min(1).max(200),
  baseline: z.number().finite(),
  target: z.number().finite(),
  current: z.number().finite(),
  unit: z.string().max(12),
  weeklyTarget: z.string().trim().max(300),
});

const schema = z.object({
  title: z.string().trim().min(2).max(80),
  primaryFocus: z.string().trim().min(2).max(1200),
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
  goals: z.array(goal).min(1).max(8),
  drills: z.array(z.object({ drillId: z.string(), perWeek: z.number().int().min(1).max(7), coachNote: z.string().max(300) })).max(20),
});

export async function savePlan(playerId: string, form: FormData) {
  const user = await requireUser(["ADMIN", "CLUB", "COACH"]);
  await getManageablePlayer(user, playerId);
  const data = schema.parse(JSON.parse(String(form.get("payload"))));

  // Only drills this coach may use, or ones already in this player's plan.
  const validDrills = await db.drill.findMany({
    where: {
      id: { in: data.drills.map((d) => d.drillId) },
      OR: [drillScope(user), { planDrills: { some: { plan: { playerId, status: "ACTIVE" } } } }],
    },
    select: { id: true },
  });
  const ok = new Set(validDrills.map((d) => d.id));
  const goals = data.goals.map((g, i) => ({ ...g, sortOrder: i }));
  const drills = data.drills.filter((d) => ok.has(d.drillId));

  const existing = await db.developmentPlan.findFirst({ where: { playerId, status: "ACTIVE" }, orderBy: { createdAt: "desc" } });

  // Editing keeps the plan's check-in history; goals and drills are replaced.
  if (existing) {
    await db.$transaction([
      db.planGoal.deleteMany({ where: { planId: existing.id } }),
      db.planDrill.deleteMany({ where: { planId: existing.id } }),
      db.developmentPlan.update({
        where: { id: existing.id },
        data: {
          title: data.title,
          primaryFocus: data.primaryFocus,
          startDate: data.startDate,
          endDate: data.endDate,
          goals: { create: goals },
          drills: { create: drills },
        },
      }),
    ]);
    await audit(user.id, "PLAN_UPDATED", `player:${playerId}`, data.title);
  } else {
    await db.developmentPlan.create({
      data: {
        playerId,
        coachId: user.id,
        title: data.title,
        primaryFocus: data.primaryFocus,
        startDate: data.startDate,
        endDate: data.endDate,
        goals: { create: goals },
        drills: { create: drills },
      },
    });
    await audit(user.id, "PLAN_CREATED", `player:${playerId}`, data.title);
  }
  await notifyFamily(playerId, {
    kind: "PLAN",
    title: existing ? "Development plan updated" : "New development plan",
    body: `${data.title}: ${data.goals.length} goals and ${drills.length} drills to practise.`,
    href: `/players/${playerId}`,
  });
  redirect(`/players/${playerId}`);
}
