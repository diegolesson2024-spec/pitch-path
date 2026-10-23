// Home practice: which plan drills are done this week, streaks and badges.
// Days are local calendar dates as "YYYY-MM-DD"; weeks run Monday to Sunday.
import "server-only";
import { db } from "./db";
import { goalProgress } from "./analytics";

export const today = () => new Date().toLocaleDateString("en-CA");

const toUtc = (day: string) => new Date(`${day}T00:00:00Z`);
const fromUtc = (d: Date) => d.toISOString().slice(0, 10);
export const addDays = (day: string, n: number) => fromUtc(new Date(toUtc(day).getTime() + n * 86_400_000));

export function weekStart(day: string) {
  const dow = toUtc(day).getUTCDay(); // 0 = Sunday
  return addDays(day, -((dow + 6) % 7));
}

export const weekDays = (day: string) => Array.from({ length: 7 }, (_, i) => addDays(weekStart(day), i));

export type BadgeKey = "first" | "streak3" | "streak7" | "week" | "ten" | "fifty" | "goal";

export const BADGES: { key: BadgeKey; label: string; hint: string }[] = [
  { key: "first", label: "First drill", hint: "Log your first home drill" },
  { key: "streak3", label: "On fire", hint: "Practise 3 days in a row" },
  { key: "streak7", label: "Unstoppable", hint: "Practise 7 days in a row" },
  { key: "week", label: "Full week", hint: "Finish every drill in a week" },
  { key: "ten", label: "10 drills", hint: "Complete 10 drills" },
  { key: "fifty", label: "50 drills", hint: "Complete 50 drills" },
  { key: "goal", label: "Goal smashed", hint: "Hit one of your plan targets" },
];

function streaks(days: Set<string>, now: string) {
  // Current streak counts back from today, or from yesterday if today isn't done yet.
  let cursor = days.has(now) ? now : addDays(now, -1);
  let current = 0;
  while (days.has(cursor)) {
    current++;
    cursor = addDays(cursor, -1);
  }
  let best = 0;
  for (const d of days) {
    if (days.has(addDays(d, -1))) continue; // only start counting at the beginning of a run
    let run = 1;
    while (days.has(addDays(d, run))) run++;
    best = Math.max(best, run);
  }
  return { current, best };
}

export async function getPractice(playerId: string) {
  const now = today();
  const [plan, logs] = await Promise.all([
    db.developmentPlan.findFirst({
      where: { playerId, status: "ACTIVE" },
      include: { drills: { include: { drill: true } }, goals: true },
      orderBy: { createdAt: "desc" },
    }),
    db.drillLog.findMany({ where: { playerId }, select: { drillId: true, day: true }, orderBy: { day: "asc" } }),
  ]);

  const week = weekDays(now);
  const inWeek = new Set(week);
  const drills = (plan?.drills ?? []).map((pd) => {
    const weekLogs = logs.filter((l) => l.drillId === pd.drillId && inWeek.has(l.day));
    return {
      planDrillId: pd.id,
      drillId: pd.drillId,
      name: pd.drill.name,
      skill: pd.drill.skill,
      minutes: pd.drill.minutes,
      atHome: pd.drill.atHome,
      hasVideo: Boolean(pd.drill.videoFile),
      summary: pd.drill.summary,
      perWeek: pd.perWeek,
      doneThisWeek: weekLogs.length,
      doneToday: weekLogs.some((l) => l.day === now),
      daysThisWeek: weekLogs.map((l) => l.day),
    };
  });

  const weekTarget = drills.reduce((a, d) => a + d.perWeek, 0);
  const weekDone = drills.reduce((a, d) => a + Math.min(d.doneThisWeek, d.perWeek), 0);
  const days = new Set(logs.map((l) => l.day));
  const { current, best } = streaks(days, now);

  // A week counts as complete if every current plan drill hit its weekly target that week.
  const weeksLogged = new Set(logs.map((l) => weekStart(l.day)));
  const fullWeek =
    drills.length > 0 &&
    [...weeksLogged].some((ws) => {
      const wd = new Set(weekDays(ws));
      return drills.every((d) => logs.filter((l) => l.drillId === d.drillId && wd.has(l.day)).length >= d.perWeek);
    });

  const earned: Record<BadgeKey, boolean> = {
    first: logs.length >= 1,
    streak3: best >= 3,
    streak7: best >= 7,
    week: fullWeek,
    ten: logs.length >= 10,
    fifty: logs.length >= 50,
    goal: (plan?.goals ?? []).some((g) => goalProgress(g) >= 1),
  };

  return {
    today: now,
    week,
    planTitle: plan?.title ?? null,
    primaryFocus: plan?.primaryFocus ?? null,
    drills,
    weekTarget,
    weekDone,
    weekLeft: Math.max(0, weekTarget - weekDone),
    streak: current,
    bestStreak: best,
    total: logs.length,
    activeDays: week.map((d) => days.has(d)),
    badges: BADGES.map((b) => ({ ...b, earned: earned[b.key] })),
  };
}

export type Practice = Awaited<ReturnType<typeof getPractice>>;
