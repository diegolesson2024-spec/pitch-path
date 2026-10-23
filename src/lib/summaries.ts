import "server-only";
import type { Prisma } from "@prisma/client";
import { db } from "./db";
import { overallScore, toScoreMap, trafficLights, round1 } from "./analytics";

const EVAL_DUE_DAYS = 60;

// Compact per-player rows for lists and dashboards.
export async function playerSummaries(where: Prisma.PlayerWhereInput, opts: { familyView?: boolean } = {}) {
  const players = await db.player.findMany({
    where,
    include: {
      team: { select: { id: true, name: true } },
      evaluations: {
        where: opts.familyView ? { published: true } : {},
        orderBy: { date: "desc" },
        take: 2,
        include: { scores: true },
      },
      plans: { where: { status: "ACTIVE" }, include: { goals: true }, take: 1 },
      attendance: { select: { status: true } },
    },
    orderBy: [{ lastName: "asc" }, { firstName: "asc" }],
  });

  return players.map((p) => {
    const [latest, prev] = p.evaluations;
    const latestMap = latest ? toScoreMap(latest.scores) : null;
    const overall = latestMap ? overallScore(latestMap) : null;
    const prevOverall = prev ? overallScore(toScoreMap(prev.scores)) : null;
    const attended = p.attendance.filter((a) => a.status === "PRESENT" || a.status === "LATE").length;
    const daysSinceEval = latest ? Math.floor((Date.now() - latest.date.getTime()) / 86_400_000) : null;
    return {
      id: p.id,
      firstName: p.firstName,
      lastName: p.lastName,
      position: p.position,
      avatarHue: p.avatarHue,
      team: p.team,
      overall,
      delta: overall != null && prevOverall != null ? round1(overall - prevOverall) : null,
      lights: latestMap ? trafficLights(latestMap) : [],
      lastEval: latest ? { date: latest.date, label: latest.label } : null,
      evalDue: daysSinceEval == null || daysSinceEval > EVAL_DUE_DAYS,
      plan: p.plans[0] ?? null,
      attendance: p.attendance.length ? Math.round((attended / p.attendance.length) * 100) : null,
    };
  });
}

export type PlayerSummary = Awaited<ReturnType<typeof playerSummaries>>[number];
