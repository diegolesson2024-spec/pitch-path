"use client";

import { useActionState, useState } from "react";
import { Printer, Link2, Check, Download, Upload } from "lucide-react";
import { createInvite, type InviteState } from "./actions";
import { uploadStats, type UploadState } from "./import-actions";

export function UploadStatsForm({ playerId }: { playerId: string }) {
  const [state, action, pending] = useActionState<UploadState, FormData>(uploadStats.bind(null, playerId), {});
  return (
    <div className="space-y-3">
      <form action={action} className="grid gap-3 sm:grid-cols-2">
        <label className="block">
          <span className="label">Where are the stats from?</span>
          <select name="source" className="field" defaultValue="Veo">
            <option>Veo</option>
            <option>Hudl</option>
            <option>Spreadsheet</option>
            <option>Other</option>
          </select>
        </label>
        <label className="block">
          <span className="label">Date format in the file</span>
          <select name="dateOrder" className="field" defaultValue="DMY">
            <option value="DMY">Day/Month/Year (17/10/2026)</option>
            <option value="MDY">Month/Day/Year (10/17/2026)</option>
          </select>
        </label>
        <label className="block sm:col-span-2">
          <span className="label">CSV file</span>
          <input name="file" type="file" accept=".csv,text/csv" required className="field file:mr-3 file:rounded-md file:border-0 file:bg-white/10 file:px-3 file:py-1 file:text-ink" />
        </label>
        <div className="flex flex-wrap items-center justify-between gap-3 sm:col-span-2">
          <a href="/match-stats-template.csv" download className="flex items-center gap-1.5 text-sm font-semibold text-royal-soft hover:underline">
            <Download size={14} /> Download template
          </a>
          <button disabled={pending} className="btn btn-royal disabled:opacity-60"><Upload size={15} /> {pending ? "Reading file…" : "Send to coach"}</button>
        </div>
      </form>
      {state.error && <p role="alert" className="rounded-lg bg-alert/10 px-3 py-2 text-sm text-alert">{state.error}</p>}
      {state.ok && <p role="status" className="rounded-lg bg-good/10 px-3 py-2 text-sm text-good">{state.ok}</p>}
      {state.skipped && state.skipped.length > 0 && (
        <details className="text-sm text-mute">
          <summary className="cursor-pointer">{state.skipped.length} row{state.skipped.length > 1 ? "s" : ""} couldn&apos;t be read</summary>
          <ul className="mt-2 space-y-1 text-xs">
            {state.skipped.slice(0, 20).map((s) => <li key={s.line}>Row {s.line}: {s.reason}</li>)}
          </ul>
        </details>
      )}
    </div>
  );
}

export function PrintButton() {
  return (
    <button onClick={() => window.print()} className="btn btn-ghost">
      <Printer size={15} /> Print
    </button>
  );
}

export function InviteForm({ playerId }: { playerId: string }) {
  const [state, action, pending] = useActionState<InviteState, FormData>(createInvite.bind(null, playerId), {});
  const [copied, setCopied] = useState(false);
  const full = state.link && typeof window !== "undefined" ? `${window.location.origin}${state.link}` : state.link;

  return (
    <div className="space-y-3">
      <form action={action} className="grid gap-2 sm:grid-cols-[1fr_auto_auto]">
        <input name="email" type="email" required placeholder="parent@example.com" className="field" aria-label="Email to invite" />
        <select name="relation" className="field sm:w-36" aria-label="Relationship">
          <option value="PARENT">Parent</option>
          <option value="SELF">Player</option>
        </select>
        <button disabled={pending} className="btn btn-royal">{pending ? "Creating…" : "Create invite"}</button>
      </form>
      {state.error && <p className="text-sm text-alert">{state.error}</p>}
      {full && (
        <div className="rounded-xl border border-royal/40 bg-royal/10 p-3">
          <p className="mb-2 text-xs text-mute">Send this one-time link to the family. It expires in 7 days.</p>
          <div className="flex items-center gap-2">
            <code className="min-w-0 flex-1 truncate rounded-lg bg-night/60 px-2 py-1.5 text-xs">{full}</code>
            <button
              type="button"
              onClick={() => navigator.clipboard.writeText(full).then(() => setCopied(true))}
              className="btn btn-ghost !px-3 !py-1.5"
            >
              {copied ? <Check size={14} /> : <Link2 size={14} />} {copied ? "Copied" : "Copy"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
