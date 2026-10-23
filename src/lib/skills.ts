// The evaluation framework: four pillars, five skills each, scored 1-10.

export type Category = "TECHNICAL" | "TACTICAL" | "PHYSICAL" | "MENTAL";

export const CATEGORIES: { key: Category; label: string; blurb: string }[] = [
  { key: "TECHNICAL", label: "Technical", blurb: "What the player can do with the ball." },
  { key: "TACTICAL", label: "Tactical", blurb: "How well they read and understand the game." },
  { key: "PHYSICAL", label: "Physical", blurb: "Speed, agility, endurance and strength." },
  { key: "MENTAL", label: "Mentality", blurb: "Attitude, composure and how they learn." },
];

export const SKILLS: { key: string; label: string; category: Category; hint: string }[] = [
  { key: "firstTouch", label: "First touch", category: "TECHNICAL", hint: "Controls the ball cleanly and into space." },
  { key: "passing", label: "Passing", category: "TECHNICAL", hint: "Accuracy and weight over short and long range." },
  { key: "dribbling", label: "Dribbling", category: "TECHNICAL", hint: "Keeps close control and beats opponents 1v1." },
  { key: "finishing", label: "Finishing", category: "TECHNICAL", hint: "Hits the target and converts chances." },
  { key: "weakFoot", label: "Weaker foot", category: "TECHNICAL", hint: "Comfort and quality on the non-dominant side." },
  { key: "scanning", label: "Scanning", category: "TACTICAL", hint: "Checks shoulders before receiving." },
  { key: "decisionMaking", label: "Decision making", category: "TACTICAL", hint: "Chooses the right option at the right time." },
  { key: "attackingMovement", label: "Movement off the ball", category: "TACTICAL", hint: "Creates space and makes good runs." },
  { key: "defensivePositioning", label: "Defensive positioning", category: "TACTICAL", hint: "Body shape, cover and recovery runs." },
  { key: "pressing", label: "Pressing & transitions", category: "TACTICAL", hint: "Reacts quickly when possession changes." },
  { key: "speed", label: "Speed", category: "PHYSICAL", hint: "Acceleration and top speed." },
  { key: "agility", label: "Agility", category: "PHYSICAL", hint: "Changes direction quickly and in balance." },
  { key: "stamina", label: "Stamina", category: "PHYSICAL", hint: "Maintains intensity for the whole game." },
  { key: "strength", label: "Strength & duels", category: "PHYSICAL", hint: "Holds off opponents, wins physical battles." },
  { key: "coordination", label: "Balance & coordination", category: "PHYSICAL", hint: "Stays on their feet and moves efficiently." },
  { key: "composure", label: "Composure", category: "MENTAL", hint: "Stays calm under pressure." },
  { key: "workRate", label: "Work rate", category: "MENTAL", hint: "Effort in and out of possession." },
  { key: "communication", label: "Communication", category: "MENTAL", hint: "Talks, organises and encourages teammates." },
  { key: "coachability", label: "Coachability", category: "MENTAL", hint: "Listens, applies feedback, asks questions." },
  { key: "resilience", label: "Resilience", category: "MENTAL", hint: "Bounces back from mistakes and setbacks." },
];

export const SKILL_BY_KEY = Object.fromEntries(SKILLS.map((s) => [s.key, s]));

// Six-axis "Performance DNA" radar, built from the underlying skills.
export const DNA_AXES: { key: string; label: string; skills: string[] }[] = [
  { key: "PAC", label: "Pace", skills: ["speed", "agility"] },
  { key: "SHO", label: "Shooting", skills: ["finishing", "weakFoot"] },
  { key: "PAS", label: "Passing", skills: ["passing", "scanning", "decisionMaking"] },
  { key: "DRI", label: "Dribbling", skills: ["dribbling", "firstTouch", "coordination"] },
  { key: "DEF", label: "Defending", skills: ["defensivePositioning", "pressing"] },
  { key: "PHY", label: "Physical", skills: ["stamina", "strength", "workRate"] },
];

export const POSITIONS: { key: string; label: string; x: number; y: number }[] = [
  { key: "GK", label: "Goalkeeper", x: 50, y: 92 },
  { key: "CB", label: "Centre back", x: 50, y: 78 },
  { key: "FB", label: "Full back", x: 16, y: 72 },
  { key: "CDM", label: "Defensive midfield", x: 50, y: 62 },
  { key: "CM", label: "Central midfield", x: 50, y: 50 },
  { key: "CAM", label: "Attacking midfield", x: 50, y: 36 },
  { key: "W", label: "Winger", x: 84, y: 30 },
  { key: "ST", label: "Striker", x: 50, y: 16 },
];

export const POSITION_BY_KEY = Object.fromEntries(POSITIONS.map((p) => [p.key, p]));

export const ROLES = ["ADMIN", "CLUB", "COACH", "PARENT", "PLAYER"] as const;
export type Role = (typeof ROLES)[number];

export const ROLE_LABEL: Record<Role, string> = {
  ADMIN: "Platform admin",
  CLUB: "Club director",
  COACH: "Coach",
  PARENT: "Parent",
  PLAYER: "Player",
};
