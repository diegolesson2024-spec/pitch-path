"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { getManageablePlayer } from "@/lib/access";
import { audit } from "@/lib/audit";
import { notifyFamily } from "@/lib/notify";
import { SKILLS } from "@/lib/skills";

const schema = z.object({
  label: z.string().trim().min(2).max(80),
  date: z.coerce.date(),
  strengths: z.string().trim().min(2).max(1500),
  improvements: z.string().trim().min(2).max(1500),
  comment: z.string().trim().min(2).max(3000),
  published: z.string().optional(),
  next: z.enum(["report", "plan"]).default("report"),
});

export async function saveEvaluation(playerId: string, form: FormData) {
  const user = await requireUser(["ADMIN", "CLUB", "COACH"]);
  await getManageablePlayer(user, playerId);
  const raw = Object.fromEntries(form);
  const data = schema.parse(raw);
  const scores = SKILLS.map((s) => ({
    category: s.category,
    skill: s.key,
    score: z.coerce.number().int().min(1).max(10).parse(raw[`score_${s.key}`]),
  }));

  const evaluation = await db.evaluation.create({
    data: {
      playerId,
      coachId: user.id,
      date: data.date,
      label: data.label,
      strengths: data.strengths,
      improvements: data.improvements,
      comment: data.comment,
      published: Boolean(data.published),
      scores: { create: scores },
    },
  });
  await audit(user.id, "EVALUATION_CREATED", `player:${playerId}`, evaluation.label);
  if (evaluation.published) {
    await notifyFamily(playerId, {
      kind: "EVALUATION",
      title: `New evaluation from ${user.name}`,
      body: `${evaluation.label} is ready to read, with feedback on what's going well and what to work on.`,
      href: `/players/${playerId}`,
    });
  }
  redirect(data.next === "plan" ? `/players/${playerId}/plan?suggest=1` : `/players/${playerId}`);
}
