import "server-only";
import { db } from "./db";
import { getViewablePlayer } from "./access";
import { isStaff, type CurrentUser } from "./auth";
import { ageOn, categoryAverages, dnaAxes, overallScore, rankedSkills, skillDeltas, toScoreMap, trafficLights } from "./analytics";
import { CATEGORIES } from "./skills";
import { fmtShort, pct } from "./format";
import type { ImportRow } from "./stat-import";

export async function loadPlayerReport(user: CurrentUser, playerId: string) {
  const player = await getViewablePlayer(user, playerId);
  const staff = isStaff(user);

  const [evaluations, matches, attendance, plan, notes, access, invites, imports] = await Promise.all([
    db.evaluation.findMany({
      where: { playerId, ...(staff ? {} : { published: true }) },
      include: { scores: true, coach: { select: { name: true } } },
      orderBy: { date: "asc" },
    }),
    db.matchStat.findMany({ where: { playerId }, orderBy: { date: "asc" } }),
    db.attendance.findMany({ where: { playerId }, include: { session: true } }),
    db.developmentPlan.findFirst({
      where: { playerId, status: "ACTIVE" },
      include: {
        goals: { orderBy: { sortOrder: "asc" } },
        drills: { include: { drill: true } },
        checkIns: { include: { author: { select: { name: true, role: true } } }, orderBy: { date: "desc" } },
        coach: { select: { name: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
    db.note.findMany({
      where: { playerId, ...(staff ? {} : { visibility: "FAMILY" }) },
      include: { author: { select: { name: true } } },
      orderBy: { createdAt: "desc" },
      take: 12,
    }),
    staff ? db.playerAccess.findMany({ where: { playerId }, include: { user: { select: { name: true, email: true } } } }) : Promise.resolve([]),
    staff ? db.invite.findMany({ where: { playerId, usedAt: null, expiresAt: { gt: new Date() } }, orderBy: { createdAt: "desc" } }) : Promise.resolve([]),
    // Staff see imports waiting for review; a parent sees their own uploads.
    db.statImport.findMany({
      where: staff ? { playerId, status: "PENDING" } : { playerId, uploadedById: user.id },
      include: { uploadedBy: { select: { name: true } }, reviewedBy: { select: { name: true } } },
      orderBy: { createdAt: "desc" },
      take: 10,
    }),
  ]);

  const latestEval = evaluations.at(-1);
  const prevEval = evaluations.at(-2);
  const latest = latestEval ? toScoreMap(latestEval.scores) : {};
  const previous = prevEval ? toScoreMap(prevEval.scores) : undefined;

  const dna = dnaAxes(latest).map((a) => ({
    ...a,
    previous: previous ? dnaAxes(previous).find((p) => p.key === a.key)?.value : undefined,
  }));

  const history = evaluations.map((e) => {
    const m = toScoreMap(e.scores);
    const c = categoryAverages(m);
    return {
      label: fmtShort(e.date),
      Overall: overallScore(m),
      Technical: c.TECHNICAL,
      Tactical: c.TACTICAL,
      Physical: c.PHYSICAL,
      Mentality: c.MENTAL,
    };
  });

  const totals = matches.reduce(
    (t, m) => ({
      apps: t.apps + 1,
      minutes: t.minutes + m.minutes,
      goals: t.goals + m.goals,
      assists: t.assists + m.assists,
      shots: t.shots + m.shots,
      onTarget: t.onTarget + m.shotsOnTarget,
      passC: t.passC + m.passesCompleted,
      passA: t.passA + m.passesAttempted,
      tackles: t.tackles + m.tackles,
      interceptions: t.interceptions + m.interceptions,
      keyPasses: t.keyPasses + m.keyPasses,
      dribbles: t.dribbles + m.dribblesWon,
    }),
    { apps: 0, minutes: 0, goals: 0, assists: 0, shots: 0, onTarget: 0, passC: 0, passA: 0, tackles: 0, interceptions: 0, keyPasses: 0, dribbles: 0 },
  );

  const attended = attendance.filter((a) => a.status === "PRESENT" || a.status === "LATE").length;

  return {
    player,
    staff,
    age: ageOn(player.dateOfBirth),
    evaluations,
    latestEval,
    prevEval,
    latest,
    previous,
    overall: overallScore(latest),
    previousOverall: previous ? overallScore(previous) : undefined,
    categories: categoryAverages(latest),
    previousCategories: previous ? categoryAverages(previous) : undefined,
    categoryList: CATEGORIES,
    dna,
    lights: latestEval ? trafficLights(latest) : [],
    ranked: rankedSkills(latest),
    deltas: skillDeltas(latest, previous),
    history,
    matches: matches.map((m) => ({ ...m, label: fmtShort(m.date), passPct: pct(m.passesCompleted, m.passesAttempted) })),
    totals: { ...totals, passPct: pct(totals.passC, totals.passA) },
    attendance: {
      total: attendance.length,
      attended,
      rate: pct(attended, attendance.length),
      late: attendance.filter((a) => a.status === "LATE").length,
    },
    plan,
    notes,
    access,
    invites,
    imports: imports.map((i) => ({
      ...i,
      rows: JSON.parse(i.rows) as ImportRow[],
      skipped: JSON.parse(i.skipped) as { line: number; reason: string }[],
    })),
    loggedDates: new Set(matches.map((m) => m.date.toISOString().slice(0, 10))),
  };
}

export type PlayerReport = Awaited<ReturnType<typeof loadPlayerReport>>;
