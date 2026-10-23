import { test } from "node:test";
import assert from "node:assert/strict";
import { ageOn, categoryAverages, goalProgress, overallScore, trafficLights } from "./analytics";
import { scoreTone } from "./colors";
import { SKILLS } from "./skills";
import { suggestPlan } from "./recommend";

const all = (n: number) => Object.fromEntries(SKILLS.map((s) => [s.key, n]));

test("overall and pillar averages", () => {
  const m = { ...all(6), speed: 10, agility: 10, stamina: 10, strength: 10, coordination: 10 };
  assert.equal(categoryAverages(m).PHYSICAL, 10);
  assert.equal(categoryAverages(m).TECHNICAL, 6);
  assert.equal(overallScore(m), 7);
});

test("traffic lights pick strongest, monitor and weakest pillars", () => {
  const m = { ...all(6), scanning: 2, decisionMaking: 2, attackingMovement: 2, defensivePositioning: 2, pressing: 2, speed: 9, agility: 9, stamina: 9, strength: 9, coordination: 9 };
  const l = trafficLights(m);
  assert.equal(l.find((x) => x.level === "STRONGEST")?.category, "PHYSICAL");
  assert.equal(l.find((x) => x.level === "NEEDS_FOCUS")?.category, "TACTICAL");
});

test("goal progress works for lower-is-better metrics and clamps", () => {
  assert.ok(Math.abs(goalProgress({ baseline: 4.2, target: 4.0, current: 4.1 }) - 0.5) < 1e-9);
  assert.equal(goalProgress({ baseline: 3, target: 7, current: 9 }), 1);
  assert.equal(goalProgress({ baseline: 3, target: 7, current: 1 }), 0);
});

test("age in years and days", () => {
  assert.deepEqual(ageOn(new Date("2012-05-10T00:00:00"), new Date("2026-05-12T00:00:00")), { years: 14, days: 2 });
  assert.equal(ageOn(new Date("2012-05-10T00:00:00"), new Date("2026-05-09T00:00:00")).years, 13);
});

test("score tone thresholds", () => {
  assert.equal(scoreTone(7), "good");
  assert.equal(scoreTone(6.9), "warn");
  assert.equal(scoreTone(5), "warn");
  assert.equal(scoreTone(4.9), "bad");
});

test("suggested plan targets the weakest skills and only real drills", () => {
  const m = { ...all(7), scanning: 3, finishing: 4 };
  const drills = [
    { id: "d1", name: "Shoulder Check Colours", skill: "scanning", atHome: true, minutes: 10 },
    { id: "d2", name: "Corners", skill: "finishing", atHome: true, minutes: 10 },
    { id: "d3", name: "Other", skill: "speed", atHome: true, minutes: 10 },
  ];
  const p = suggestPlan(m, "ST", drills, "Leo");
  assert.ok(p.goals.some((g) => g.skill === "scanning"));
  assert.ok(p.goals.some((g) => g.skill === "finishing"));
  assert.ok(p.drillIds.every((id) => ["d1", "d2", "d3"].includes(id)));
  for (const g of p.goals) assert.notEqual(g.baseline, g.target);
});
