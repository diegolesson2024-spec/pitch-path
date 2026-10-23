"use client";

import { useState } from "react";
import clsx from "clsx";
import { Plus, RefreshCw, Trash2, Home, Check, PlayCircle } from "lucide-react";
import { SKILLS, SKILL_BY_KEY, CATEGORIES } from "@/lib/skills";
import { suggestGoal, suggestPlan } from "@/lib/recommend";
import { savePlan } from "./actions";

export type GoalDraft = { skill: string; description: string; metric: string; baseline: number; target: number; current: number; unit: string; weeklyTarget: string };
export type PlanDraft = {
  title: string;
  primaryFocus: string;
  startDate: string;
  endDate: string;
  goals: GoalDraft[];
  drills: { drillId: string; perWeek: number; coachNote: string }[];
};
type DrillOpt = {
  id: string;
  name: string;
  skill: string;
  category: string;
  minutes: number;
  atHome: boolean;
  difficulty: string;
  summary: string;
  hasVideo: boolean;
  mine: boolean;
  coachMade: boolean;
};

export function PlanEditor({
  playerId,
  firstName,
  position,
  scores,
  initial,
  drills,
  hasExisting,
}: {
  playerId: string;
  firstName: string;
  position: string;
  scores: Record<string, number>;
  initial: PlanDraft;
  drills: DrillOpt[];
  hasExisting: boolean;
}) {
  const [plan, setPlan] = useState<PlanDraft>(initial);
  const [filter, setFilter] = useState<"focus" | "mine" | "all">("focus");

  const set = <K extends keyof PlanDraft>(k: K, v: PlanDraft[K]) => setPlan((p) => ({ ...p, [k]: v }));
  const setGoal = (i: number, patch: Partial<GoalDraft>) => set("goals", plan.goals.map((g, j) => (j === i ? { ...g, ...patch } : g)));

  function regenerate() {
    const s = suggestPlan(scores, position, drills, firstName);
    setPlan((p) => ({
      ...p,
      title: s.title,
      primaryFocus: s.primaryFocus,
      goals: s.goals.map((g) => ({ ...g, current: g.baseline })),
      drills: s.drillIds.map((drillId) => ({ drillId, perWeek: 3, coachNote: "" })),
    }));
  }

  function toggleDrill(id: string) {
    const exists = plan.drills.find((d) => d.drillId === id);
    set("drills", exists ? plan.drills.filter((d) => d.drillId !== id) : [...plan.drills, { drillId: id, perWeek: 3, coachNote: "" }]);
  }

  const focusSkills = new Set(plan.goals.map((g) => g.skill));
  const shownDrills =
    filter === "focus" ? drills.filter((d) => focusSkills.has(d.skill)) : filter === "mine" ? drills.filter((d) => d.mine) : drills;

  return (
    <form action={savePlan.bind(null, playerId)} className="space-y-5">
      <input type="hidden" name="payload" value={JSON.stringify(plan)} />

      <section className="panel space-y-4 p-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-lg font-bold">Plan overview</h2>
          <button type="button" onClick={regenerate} className="btn btn-ghost"><RefreshCw size={14} /> Re-suggest from scores</button>
        </div>
        <div className="grid gap-4 md:grid-cols-[1fr_auto_auto]">
          <label><span className="label">Title</span><input value={plan.title} onChange={(e) => set("title", e.target.value)} required maxLength={80} className="field" /></label>
          <label><span className="label">Start</span><input type="date" value={plan.startDate} onChange={(e) => set("startDate", e.target.value)} required className="field" /></label>
          <label><span className="label">Review date</span><input type="date" value={plan.endDate} onChange={(e) => set("endDate", e.target.value)} required className="field" /></label>
        </div>
        <label className="block">
          <span className="label">Primary focus (what the family will read first)</span>
          <textarea value={plan.primaryFocus} onChange={(e) => set("primaryFocus", e.target.value)} required rows={3} className="field" />
        </label>
      </section>

      <section className="panel p-5">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-lg font-bold">Measurable goals</h2>
          <button
            type="button"
            onClick={() => {
              const unused = SKILLS.filter((s) => !focusSkills.has(s.key)).sort((a, b) => scores[a.key] - scores[b.key])[0];
              if (unused) set("goals", [...plan.goals, { ...suggestGoal(unused.key, scores[unused.key]), current: suggestGoal(unused.key, scores[unused.key]).baseline }]);
            }}
            className="btn btn-ghost"
          >
            <Plus size={14} /> Add goal
          </button>
        </div>
        <div className="space-y-3">
          {plan.goals.map((g, i) => (
            <div key={i} className="panel-flat space-y-3 p-4">
              <div className="flex flex-wrap items-end gap-3">
                <label className="min-w-48 flex-1">
                  <span className="label">Skill · current score {scores[g.skill] ?? "–"}/10</span>
                  <select
                    value={g.skill}
                    onChange={(e) => {
                      const sg = suggestGoal(e.target.value, scores[e.target.value] ?? 5);
                      setGoal(i, { ...sg, current: sg.baseline });
                    }}
                    className="field"
                  >
                    {CATEGORIES.map((c) => (
                      <optgroup key={c.key} label={c.label}>
                        {SKILLS.filter((s) => s.category === c.key).map((s) => (
                          <option key={s.key} value={s.key}>{s.label} ({scores[s.key]})</option>
                        ))}
                      </optgroup>
                    ))}
                  </select>
                </label>
                <button type="button" onClick={() => set("goals", plan.goals.filter((_, j) => j !== i))} className="btn btn-ghost !px-3" aria-label="Remove goal">
                  <Trash2 size={14} />
                </button>
              </div>
              <label className="block"><span className="label">Goal for the player</span><input value={g.description} onChange={(e) => setGoal(i, { description: e.target.value })} className="field" /></label>
              <div className="grid gap-3 sm:grid-cols-[2fr_1fr_1fr_1fr_0.7fr]">
                <label><span className="label">How we measure it</span><input value={g.metric} onChange={(e) => setGoal(i, { metric: e.target.value })} className="field" /></label>
                <label><span className="label">Baseline</span><input type="number" step="any" value={g.baseline} onChange={(e) => setGoal(i, { baseline: Number(e.target.value) })} className="field" /></label>
                <label><span className="label">Target</span><input type="number" step="any" value={g.target} onChange={(e) => setGoal(i, { target: Number(e.target.value) })} className="field" /></label>
                <label><span className="label">Current</span><input type="number" step="any" value={g.current} onChange={(e) => setGoal(i, { current: Number(e.target.value) })} className="field" /></label>
                <label><span className="label">Unit</span><input value={g.unit} onChange={(e) => setGoal(i, { unit: e.target.value })} className="field" /></label>
              </div>
              <label className="block"><span className="label">Weekly target</span><input value={g.weeklyTarget} onChange={(e) => setGoal(i, { weeklyTarget: e.target.value })} className="field" /></label>
            </div>
          ))}
          {plan.goals.length === 0 && <p className="text-sm text-mute">Add at least one goal.</p>}
        </div>
      </section>

      <section className="panel p-5">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-lg font-bold">Drills <span className="text-volt">{plan.drills.length}</span></h2>
          <div className="flex rounded-full border border-line-strong p-0.5 text-xs font-bold uppercase tracking-wider">
            {(["focus", "mine", "all"] as const).map((f) => (
              <button key={f} type="button" onClick={() => setFilter(f)} className={clsx("rounded-full px-3 py-1.5", filter === f ? "bg-royal text-white" : "text-mute")}>
                {f === "focus" ? "Goal skills" : f === "mine" ? "My drills" : "All drills"}
              </button>
            ))}
          </div>
        </div>
        <div className="grid gap-2 md:grid-cols-2">
          {shownDrills.map((d) => {
            const sel = plan.drills.find((x) => x.drillId === d.id);
            return (
              <div key={d.id} className={clsx("panel-flat p-3 transition", sel && "!border-volt/50 bg-volt/[0.06]")}>
                <button type="button" onClick={() => toggleDrill(d.id)} className="flex w-full items-start gap-3 text-left">
                  <span className={clsx("mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-md border", sel ? "border-volt bg-volt text-night" : "border-line-strong")}>
                    {sel && <Check size={13} strokeWidth={3} />}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex flex-wrap items-center gap-1.5 font-semibold">
                      {d.name}
                      {d.atHome && <Home size={13} className="text-royal-soft" aria-label="Can be done at home" />}
                      {d.hasVideo && <PlayCircle size={13} className="text-volt" aria-label="Has a video" />}
                      {d.coachMade && <span className="rounded bg-volt/15 px-1.5 text-[0.6rem] font-bold uppercase tracking-wider text-volt-soft">{d.mine ? "Mine" : "Club"}</span>}
                    </span>
                    <span className="block text-xs text-mute">{SKILL_BY_KEY[d.skill]?.label} · {d.minutes} min · {d.difficulty}</span>
                    <span className="mt-1 block text-xs text-dim">{d.summary}</span>
                  </span>
                </button>
                {sel && (
                  <div className="mt-3 grid grid-cols-[auto_1fr] gap-2 pl-8">
                    <select
                      value={sel.perWeek}
                      onChange={(e) => set("drills", plan.drills.map((x) => (x.drillId === d.id ? { ...x, perWeek: Number(e.target.value) } : x)))}
                      className="field !py-1.5 text-sm"
                      aria-label="Times per week"
                    >
                      {[1, 2, 3, 4, 5, 6, 7].map((n) => <option key={n} value={n}>{n}x / week</option>)}
                    </select>
                    <input
                      value={sel.coachNote}
                      onChange={(e) => set("drills", plan.drills.map((x) => (x.drillId === d.id ? { ...x, coachNote: e.target.value } : x)))}
                      placeholder="Note for the player (optional)"
                      className="field !py-1.5 text-sm"
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      <div className="sticky bottom-20 z-10 flex justify-end gap-2 lg:bottom-4">
        <div className="panel flex items-center gap-3 !rounded-full px-3 py-2 shadow-2xl">
          <span className="hidden pl-2 text-sm text-mute sm:inline">{plan.goals.length} goals · {plan.drills.length} drills</span>
          <button disabled={plan.goals.length === 0} className="btn btn-primary disabled:opacity-50">{hasExisting ? "Save changes" : "Publish plan"}</button>
        </div>
      </div>
    </form>
  );
}
