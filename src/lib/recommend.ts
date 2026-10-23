// Turns an evaluation into suggested, measurable goals and drills.
// Coaches always review and edit the suggestion before it is saved.

import { SKILL_BY_KEY } from "./skills";
import type { ScoreMap } from "./analytics";

type Template = {
  metric: string;
  unit: string;
  baseline: (score: number) => number;
  target: (baseline: number) => number;
  weekly: string;
  description: string;
};

const clamp = (n: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, n));

export const GOAL_TEMPLATES: Record<string, Template> = {
  firstTouch: {
    metric: "Clean first touches out of 50 (wall test)",
    unit: "/50",
    baseline: (s) => clamp(Math.round(s * 4.5), 10, 46),
    target: (b) => clamp(b + 8, b + 1, 50),
    weekly: "3 x Wall Pass Rhythm, retest every Sunday",
    description: "Take the first touch out of your feet and into space, both feet.",
  },
  passing: {
    metric: "Match pass completion",
    unit: "%",
    baseline: (s) => clamp(Math.round(48 + s * 4), 50, 90),
    target: (b) => clamp(b + 8, b + 1, 95),
    weekly: "3 x Target Gates, track gates hit out of 60",
    description: "Lock the ankle, open the body and hit the target first time.",
  },
  dribbling: {
    metric: "Cone slalom best time",
    unit: "s",
    baseline: (s) => Math.round((16 - s * 0.6) * 10) / 10,
    target: (b) => Math.round((b - 1.5) * 10) / 10,
    weekly: "3 x Cone Slalom using both feet, best of 5 runs",
    description: "Close control at speed with small touches and your head up.",
  },
  finishing: {
    metric: "Shots on target out of 20 from 12m",
    unit: "/20",
    baseline: (s) => clamp(Math.round(s * 1.7), 3, 18),
    target: (b) => clamp(b + 4, b + 1, 20),
    weekly: "2 x Corners of the Goal, 1 x Touch and Finish",
    description: "Pick a corner and place it. Accuracy before power.",
  },
  weakFoot: {
    metric: "Clean weak-foot wall passes out of 50",
    unit: "/50",
    baseline: (s) => clamp(Math.round(s * 4), 8, 45),
    target: (b) => clamp(b + 10, b + 1, 50),
    weekly: "Weak Foot Week: every home touch on the weaker foot",
    description: "Use your weaker foot in every session until it feels natural.",
  },
  scanning: {
    metric: "Scans before receiving (per 10 receptions)",
    unit: "/10",
    baseline: (s) => clamp(Math.round(s * 0.8), 1, 8),
    target: (b) => clamp(b + 3, b + 1, 10),
    weekly: "3 x Shoulder Check Colours, coach counts scans in one game",
    description: "Check both shoulders before the ball arrives so you know your next move.",
  },
  decisionMaking: {
    metric: "Coach decision rating",
    unit: "/10",
    baseline: (s) => s,
    target: (b) => clamp(b + 2, b + 1, 10),
    weekly: "1 x Match Film Review, 2 x Pass or Dribble Gates",
    description: "Pick the best option: forward when it's on, keep it when it isn't.",
  },
  attackingMovement: {
    metric: "Times receiving between the lines per game",
    unit: "",
    baseline: (s) => clamp(Math.round(s * 0.7), 1, 8),
    target: (b) => b + 3,
    weekly: "2 x Find the Pocket, watch one striker's movement clip",
    description: "Move into the gaps where teammates can find you.",
  },
  defensivePositioning: {
    metric: "1v1 duels won out of 10 (training)",
    unit: "/10",
    baseline: (s) => clamp(Math.round(s * 0.8), 2, 8),
    target: (b) => clamp(b + 2, b + 1, 10),
    weekly: "2 x Shadow Defending, 1 x Recovery Run Race",
    description: "Stay side-on, be patient and show the attacker where you want them to go.",
  },
  pressing: {
    metric: "Presses within 5 seconds of losing the ball (per game)",
    unit: "",
    baseline: (s) => clamp(Math.round(s * 0.9), 2, 9),
    target: (b) => b + 3,
    weekly: "Five-Second Press focus in every small-sided game",
    description: "React first when the ball is lost. Win it back quickly.",
  },
  speed: {
    metric: "20m sprint time",
    unit: "s",
    baseline: (s) => Math.round((4.6 - s * 0.08) * 100) / 100,
    target: (b) => Math.round((b - 0.15) * 100) / 100,
    weekly: "2 x Acceleration Starts, 1 x Flying 20s",
    description: "Sharper first steps and a faster top speed.",
  },
  agility: {
    metric: "T-test best time",
    unit: "s",
    baseline: (s) => Math.round((13.5 - s * 0.25) * 10) / 10,
    target: (b) => Math.round((b - 0.6) * 10) / 10,
    weekly: "2 x Ladder Feet, 1 x T-Test Turns",
    description: "Change direction quickly while staying balanced.",
  },
  stamina: {
    metric: "Box-to-box runs completed at pace",
    unit: "",
    baseline: (s) => clamp(Math.round(s), 4, 10),
    target: (b) => b + 3,
    weekly: "2 x Ball Mastery Intervals, 1 x Box-to-Box Runs",
    description: "Keep your intensity high for the whole match.",
  },
  strength: {
    metric: "Plank hold",
    unit: "s",
    baseline: (s) => clamp(Math.round(s * 7), 20, 75),
    target: (b) => b + 20,
    weekly: "3 x Bodyweight Strength Circuit",
    description: "Build a strong core to hold off opponents and win duels.",
  },
  coordination: {
    metric: "Single-leg wall passes without touching down",
    unit: "/20",
    baseline: (s) => clamp(Math.round(s * 1.6), 4, 18),
    target: (b) => clamp(b + 5, b + 1, 20),
    weekly: "3 x Single-Leg Balance Passes",
    description: "Better balance means better touches and fewer falls.",
  },
  composure: {
    metric: "Calm rating after pressure penalties",
    unit: "/5",
    baseline: (s) => clamp(Math.round(s / 2), 1, 4),
    target: (b) => clamp(b + 1, b + 1, 5),
    weekly: "1 x Pressure Penalties with your routine",
    description: "Use a routine to stay calm when the pressure is on.",
  },
  workRate: {
    metric: "Average weekly effort check-in",
    unit: "/5",
    baseline: (s) => clamp(Math.round(s / 2), 1, 4),
    target: (b) => clamp(b + 1, b + 1, 5),
    weekly: "Effort Tracker after every session",
    description: "Work as hard without the ball as with it.",
  },
  communication: {
    metric: "On-pitch calls counted per session",
    unit: "",
    baseline: (s) => clamp(Math.round(s), 1, 10),
    target: (b) => b + 5,
    weekly: "Use one of your five calls every rep",
    description: "Talk early, short and loud to help teammates.",
  },
  coachability: {
    metric: "Feedback questions asked per week",
    unit: "",
    baseline: (s) => clamp(Math.round(s / 3), 0, 3),
    target: (b) => b + 2,
    weekly: "Ask One Question after every session",
    description: "Turn coach feedback into something you try next time.",
  },
  resilience: {
    metric: "Mistake reset used (coach observed, out of 5)",
    unit: "/5",
    baseline: (s) => clamp(Math.round(s / 2), 1, 4),
    target: (b) => clamp(b + 1, b + 1, 5),
    weekly: "Mistake Reset in every session, post-match reflection",
    description: "Move on quickly from mistakes and go again.",
  },
};

// Skills that matter most for each position get prioritised when scores are close.
const POSITION_PRIORITIES: Record<string, string[]> = {
  GK: ["composure", "communication", "decisionMaking", "agility", "passing"],
  CB: ["defensivePositioning", "strength", "passing", "communication", "composure"],
  FB: ["defensivePositioning", "stamina", "speed", "passing", "pressing"],
  CDM: ["scanning", "passing", "defensivePositioning", "pressing", "decisionMaking"],
  CM: ["scanning", "passing", "firstTouch", "stamina", "decisionMaking"],
  CAM: ["firstTouch", "decisionMaking", "passing", "dribbling", "scanning"],
  W: ["dribbling", "speed", "finishing", "attackingMovement", "agility"],
  ST: ["finishing", "attackingMovement", "firstTouch", "composure", "weakFoot"],
};

export type DrillLite = { id: string; name: string; skill: string; atHome: boolean; minutes: number };

export type SuggestedGoal = {
  skill: string;
  description: string;
  metric: string;
  baseline: number;
  target: number;
  unit: string;
  weeklyTarget: string;
};

export function suggestFocusSkills(scores: ScoreMap, position: string, count = 3) {
  const priorities = POSITION_PRIORITIES[position] ?? [];
  return Object.entries(scores)
    .map(([skill, score]) => ({ skill, score, weight: (10 - score) * (priorities.includes(skill) ? 1.35 : 1) }))
    .sort((a, b) => b.weight - a.weight)
    .slice(0, count)
    .map((x) => x.skill);
}

export function suggestGoal(skill: string, score: number): SuggestedGoal {
  const t = GOAL_TEMPLATES[skill];
  const baseline = t.baseline(score);
  return {
    skill,
    description: t.description,
    metric: t.metric,
    baseline,
    target: t.target(baseline),
    unit: t.unit,
    weeklyTarget: t.weekly,
  };
}

export function suggestPlan(scores: ScoreMap, position: string, drills: DrillLite[], firstName: string) {
  const skills = suggestFocusSkills(scores, position);
  const goals = skills.map((s) => suggestGoal(s, scores[s]));
  const drillIds = skills.flatMap((s) =>
    drills
      .filter((d) => d.skill === s)
      .sort((a, b) => Number(b.atHome) - Number(a.atHome))
      .slice(0, 2)
      .map((d) => d.id),
  );
  const labels = skills.map((s) => SKILL_BY_KEY[s]?.label.toLowerCase() ?? s);
  const primaryFocus = `${firstName}'s next step is ${labels[0]}. Alongside it we'll build ${labels[1]} and ${labels[2]} so improvements show up in matches, not just training.`;
  return { title: `${SKILL_BY_KEY[skills[0]]?.label ?? "Development"} focus block`, primaryFocus, goals, drillIds };
}
