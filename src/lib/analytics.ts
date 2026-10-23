import { CATEGORIES, DNA_AXES, SKILLS, SKILL_BY_KEY, type Category } from "./skills";

export type ScoreRow = { skill: string; score: number; category?: string };
export type ScoreMap = Record<string, number>;

export function toScoreMap(rows: ScoreRow[]): ScoreMap {
  return Object.fromEntries(rows.map((r) => [r.skill, r.score]));
}

const avg = (xs: number[]) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : 0);
export const round1 = (n: number) => Math.round(n * 10) / 10;

export function categoryAverages(m: ScoreMap): Record<Category, number> {
  const out = {} as Record<Category, number>;
  for (const c of CATEGORIES) {
    const vals = SKILLS.filter((s) => s.category === c.key && m[s.key] != null).map((s) => m[s.key]);
    out[c.key] = round1(avg(vals));
  }
  return out;
}

export function overallScore(m: ScoreMap): number {
  return round1(avg(Object.values(m)));
}

export function dnaAxes(m: ScoreMap) {
  return DNA_AXES.map((a) => ({
    key: a.key,
    label: a.label,
    value: round1(avg(a.skills.filter((s) => m[s] != null).map((s) => m[s]))),
  }));
}

export type Light = { level: "STRONGEST" | "MONITOR" | "NEEDS_FOCUS"; category: Category; label: string; value: number };

// Strongest pillar, the middle pillar to keep an eye on, and the weakest pillar.
export function trafficLights(m: ScoreMap): Light[] {
  const cats = categoryAverages(m);
  const sorted = CATEGORIES.map((c) => ({ ...c, value: cats[c.key] })).sort((a, b) => b.value - a.value);
  const pick = (c: (typeof sorted)[number], level: Light["level"]): Light => ({
    level,
    category: c.key,
    label: c.label,
    value: c.value,
  });
  return [pick(sorted[0], "STRONGEST"), pick(sorted[2], "MONITOR"), pick(sorted[3], "NEEDS_FOCUS")];
}

export function rankedSkills(m: ScoreMap) {
  return SKILLS.filter((s) => m[s.key] != null)
    .map((s) => ({ ...s, score: m[s.key] }))
    .sort((a, b) => b.score - a.score);
}

export function skillDeltas(current: ScoreMap, previous?: ScoreMap) {
  if (!previous) return [];
  return Object.keys(current)
    .filter((k) => previous[k] != null)
    .map((k) => ({ key: k, label: SKILL_BY_KEY[k]?.label ?? k, delta: current[k] - previous[k], score: current[k] }))
    .sort((a, b) => b.delta - a.delta);
}

export function ageOn(dob: Date, on = new Date()) {
  let years = on.getFullYear() - dob.getFullYear();
  const birthdayThisYear = new Date(on.getFullYear(), dob.getMonth(), dob.getDate());
  if (on < birthdayThisYear) years -= 1;
  const lastBirthday = new Date(dob.getFullYear() + years, dob.getMonth(), dob.getDate());
  const days = Math.floor((on.getTime() - lastBirthday.getTime()) / 86_400_000);
  return { years, days };
}

export function goalProgress(g: { baseline: number; target: number; current: number }) {
  const span = g.target - g.baseline;
  if (span === 0) return 1;
  return Math.max(0, Math.min(1, (g.current - g.baseline) / span));
}

export function scoreBand(score: number) {
  if (score >= 7) return { label: "Strong", tone: "good" as const };
  if (score >= 5) return { label: "Developing", tone: "warn" as const };
  return { label: "Needs work", tone: "red" as const };
}
