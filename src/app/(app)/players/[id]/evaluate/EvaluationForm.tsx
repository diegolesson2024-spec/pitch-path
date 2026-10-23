"use client";

import { useMemo, useState } from "react";
import clsx from "clsx";
import { Sparkles } from "lucide-react";
import { CATEGORIES, SKILLS } from "@/lib/skills";
import { categoryAverages, overallScore, rankedSkills } from "@/lib/analytics";
import { saveEvaluation } from "./actions";

export function EvaluationForm({
  playerId,
  firstName,
  previous,
  previousLabel,
  defaultLabel,
  defaultDate,
}: {
  playerId: string;
  firstName: string;
  previous: Record<string, number> | null;
  previousLabel: string | null;
  defaultLabel: string;
  defaultDate: string;
}) {
  const [scores, setScores] = useState<Record<string, number>>(() =>
    Object.fromEntries(SKILLS.map((s) => [s.key, previous?.[s.key] ?? 5])),
  );
  const [strengths, setStrengths] = useState("");
  const [improvements, setImprovements] = useState("");
  const [comment, setComment] = useState("");

  const cats = useMemo(() => categoryAverages(scores), [scores]);
  const overall = overallScore(scores);

  function draftFeedback() {
    const ranked = rankedSkills(scores);
    const top = ranked.slice(0, 3).map((s) => s.label.toLowerCase());
    const low = ranked.slice(-3).reverse().map((s) => s.label.toLowerCase());
    setStrengths(`${firstName}'s ${top[0]} stands out, backed up by good ${top[1]} and ${top[2]}.`);
    setImprovements(`The biggest gains will come from ${low[0]}, followed by ${low[1]} and ${low[2]}.`);
    setComment(
      `${firstName} is making progress. Keep using your strengths in ${top[0]} and commit to the home drills for ${low[0]}. We'll check in on these at the next review.`,
    );
  }

  return (
    <form action={saveEvaluation.bind(null, playerId)} className="space-y-5">
      <div className="panel grid gap-4 p-5 sm:grid-cols-[1fr_auto_auto] sm:items-end">
        <label>
          <span className="label">Evaluation name</span>
          <input name="label" defaultValue={defaultLabel} required maxLength={80} className="field" />
        </label>
        <label>
          <span className="label">Date</span>
          <input name="date" type="date" defaultValue={defaultDate} required className="field" />
        </label>
        <div className="text-right">
          <p className="eyebrow">Overall</p>
          <p className="display num text-5xl not-italic text-volt">{overall.toFixed(1)}</p>
        </div>
      </div>

      {previousLabel && (
        <p className="text-sm text-mute">
          Sliders start from <span className="text-ink">{previousLabel}</span>. Grey marks show the previous score.
        </p>
      )}

      <div className="grid gap-5 lg:grid-cols-2">
        {CATEGORIES.map((c) => (
          <section key={c.key} className="panel p-5">
            <header className="mb-4 flex items-baseline justify-between">
              <div>
                <h2 className="text-lg font-bold">{c.label}</h2>
                <p className="text-xs text-mute">{c.blurb}</p>
              </div>
              <p className="num text-2xl font-bold">{cats[c.key].toFixed(1)}</p>
            </header>
            <div className="space-y-4">
              {SKILLS.filter((s) => s.category === c.key).map((s) => {
                const v = scores[s.key];
                const prev = previous?.[s.key];
                const delta = prev != null ? v - prev : 0;
                return (
                  <div key={s.key}>
                    <div className="mb-1.5 flex items-baseline justify-between gap-2">
                      <label htmlFor={s.key} className="text-sm font-semibold" title={s.hint}>{s.label}</label>
                      <span className="flex items-baseline gap-2">
                        {delta !== 0 && (
                          <span className={clsx("num text-xs font-bold", delta > 0 ? "text-royal-soft" : "text-alert")}>
                            {delta > 0 ? "+" : ""}{delta}
                          </span>
                        )}
                        <span className="num w-6 text-right font-display text-xl font-bold">{v}</span>
                      </span>
                    </div>
                    <div className="relative">
                      <input
                        id={s.key}
                        name={`score_${s.key}`}
                        type="range"
                        min={1}
                        max={10}
                        step={1}
                        value={v}
                        onChange={(e) => setScores((x) => ({ ...x, [s.key]: Number(e.target.value) }))}
                        className="score w-full"
                        style={{ ["--fill" as string]: `${((v - 1) / 9) * 100}%` }}
                        aria-describedby={`${s.key}-hint`}
                      />
                      {prev != null && (
                        <span
                          className="pointer-events-none absolute -bottom-1.5 h-1.5 w-0.5 rounded bg-mute"
                          style={{ left: `calc(${((prev - 1) / 9) * 100}% - 1px)` }}
                          aria-hidden
                        />
                      )}
                    </div>
                    <p id={`${s.key}-hint`} className="mt-1 text-[0.7rem] text-dim">{s.hint}</p>
                  </div>
                );
              })}
            </div>
          </section>
        ))}
      </div>

      <section className="panel space-y-4 p-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-lg font-bold">Feedback for {firstName}</h2>
          <button type="button" onClick={draftFeedback} className="btn btn-ghost">
            <Sparkles size={15} /> Draft from scores
          </button>
        </div>
        <label className="block">
          <span className="label">What they&apos;re doing well</span>
          <textarea name="strengths" value={strengths} onChange={(e) => setStrengths(e.target.value)} required rows={2} className="field" />
        </label>
        <label className="block">
          <span className="label">What to improve</span>
          <textarea name="improvements" value={improvements} onChange={(e) => setImprovements(e.target.value)} required rows={2} className="field" />
        </label>
        <label className="block">
          <span className="label">Coach comment (shown to player and parents)</span>
          <textarea name="comment" value={comment} onChange={(e) => setComment(e.target.value)} required rows={4} className="field" />
        </label>
        <div className="flex flex-col gap-3 border-t border-line pt-4 sm:flex-row sm:items-center sm:justify-between">
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" name="published" defaultChecked className="h-4 w-4 accent-[#ff6a13]" />
            Publish to the family portal now
          </label>
          <div className="flex gap-2">
            <button name="next" value="report" className="btn btn-ghost">Save evaluation</button>
            <button name="next" value="plan" className="btn btn-primary">Save & build plan</button>
          </div>
        </div>
      </section>
    </form>
  );
}
