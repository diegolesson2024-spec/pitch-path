"use client";

import { useState } from "react";
import { Minus, Plus, Crosshair, Repeat, ShieldHalf } from "lucide-react";
import { saveMatchStats } from "./actions";

const GROUPS = [
  {
    title: "Attack & shooting",
    icon: Crosshair,
    tone: "text-volt",
    fields: [
      { key: "goals", label: "Goals" },
      { key: "assists", label: "Assists" },
      { key: "shots", label: "Shots total" },
      { key: "shotsOnTarget", label: "On target" },
      { key: "keyPasses", label: "Key passes" },
    ],
  },
  {
    title: "Possession & passing",
    icon: Repeat,
    tone: "text-royal-soft",
    fields: [
      { key: "passesCompleted", label: "Passes OK" },
      { key: "passesAttempted", label: "Passes total" },
      { key: "dribblesWon", label: "Dribbles won" },
    ],
  },
  {
    title: "Defense & duels",
    icon: ShieldHalf,
    tone: "text-alert",
    fields: [
      { key: "tackles", label: "Tackles" },
      { key: "interceptions", label: "Interceptions" },
    ],
  },
] as const;

export function StatLogger({ playerId, today }: { playerId: string; today: string }) {
  const [v, setV] = useState<Record<string, number>>({});
  const bump = (k: string, d: number) => setV((x) => ({ ...x, [k]: Math.max(0, (x[k] ?? 0) + d) }));

  return (
    <form action={saveMatchStats.bind(null, playerId)} className="space-y-5">
      <section className="panel grid gap-4 p-5 sm:grid-cols-2 lg:grid-cols-5">
        <label className="lg:col-span-2"><span className="label">Opponent</span><input name="opponent" required maxLength={80} className="field" placeholder="e.g. Harbourside FC" /></label>
        <label><span className="label">Date</span><input name="date" type="date" defaultValue={today} required className="field" /></label>
        <label><span className="label">Competition</span><select name="competition" className="field"><option>League</option><option>Cup</option><option>Friendly</option><option>Tournament</option></select></label>
        <label><span className="label">Minutes</span><input name="minutes" type="number" min={0} max={130} defaultValue={60} required className="field" /></label>
      </section>

      {GROUPS.map((g) => (
        <section key={g.title} className="panel p-5">
          <h2 className="mb-4 flex items-center gap-2 font-bold"><g.icon size={15} className={g.tone} /> {g.title}</h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {g.fields.map((f) => (
              <div key={f.key} className="panel-flat p-3">
                <p className="eyebrow !text-[0.6rem]">{f.label}</p>
                <input type="hidden" name={f.key} value={v[f.key] ?? 0} />
                <div className="mt-2 flex items-center justify-between">
                  <button type="button" onClick={() => bump(f.key, -1)} className="grid h-9 w-9 place-items-center rounded-lg border border-line-strong text-mute hover:text-ink" aria-label={`Decrease ${f.label}`}><Minus size={16} /></button>
                  <span className="num text-2xl font-bold" aria-live="polite">{v[f.key] ?? 0}</span>
                  <button type="button" onClick={() => bump(f.key, 1)} className="grid h-9 w-9 place-items-center rounded-lg bg-royal text-white hover:bg-royal-soft" aria-label={`Increase ${f.label}`}><Plus size={16} /></button>
                </div>
              </div>
            ))}
          </div>
        </section>
      ))}

      <section className="panel flex flex-col gap-4 p-5 sm:flex-row sm:items-end sm:justify-between">
        <label className="sm:w-48"><span className="label">Coach rating (1–10)</span><input name="rating" type="number" min={1} max={10} step={0.1} className="field" placeholder="7.0" /></label>
        <button className="btn btn-primary">Save match</button>
      </section>
    </form>
  );
}
