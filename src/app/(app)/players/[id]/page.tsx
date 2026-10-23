import Link from "next/link";
import clsx from "clsx";
import { Download, ClipboardPen, Target, Activity, Home, Dumbbell, ShieldCheck, X, PlayCircle, Clock } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { loadPlayerReport } from "@/lib/player-data";
import { goalProgress } from "@/lib/analytics";
import { CATEGORIES, POSITION_BY_KEY, SKILLS, SKILL_BY_KEY } from "@/lib/skills";
import { PILLAR, TONE_BG, TONE_TEXT, scoreTone } from "@/lib/colors";
import { fmtDate, fmtHeight, fmtShort } from "@/lib/format";
import { Avatar, Badge, Bar, Card, Delta, Empty } from "@/components/ui";
import { DnaRadar, ProgressLines } from "@/components/charts";
import { Pitch } from "@/components/Pitch";
import { InviteForm, PrintButton, UploadStatsForm } from "./client-bits";
import { addCheckIn, addNote, recordConsent, revokeAccess, updateGoalProgress } from "./actions";
import { reviewImport, setParentImports } from "./import-actions";

export const metadata = { title: "Report card" };

const round1 = (n: number) => Math.round(n * 10) / 10;

export default async function PlayerReportPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await requireUser();
  const r = await loadPlayerReport(user, id);
  const { player, plan, latestEval } = r;
  const pos = POSITION_BY_KEY[player.position];
  const strongest = r.lights.find((l) => l.level === "STRONGEST");
  const focus = r.lights.find((l) => l.level === "NEEDS_FOCUS");

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      {/* Header: who, and the main actions */}
      <header className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-4">
          <Avatar first={player.firstName} last={player.lastName} hue={player.avatarHue} size={60} />
          <div className="min-w-0">
            <h1 className="display text-4xl md:text-5xl">
              {player.firstName} <span className="text-volt">{player.lastName}</span>
            </h1>
            <p className="mt-1 text-sm text-mute">
              {player.team?.name ?? "No team"} · {player.club.name} · {pos?.label ?? player.position}
              {player.shirtNumber ? ` · #${player.shirtNumber}` : ""}
            </p>
          </div>
        </div>
        <div className="no-print flex flex-wrap gap-2">
          {r.staff && (
            <>
              <Link href={`/players/${player.id}/evaluate`} className="btn btn-primary"><ClipboardPen size={15} /> New evaluation</Link>
              <Link href={`/players/${player.id}/plan`} className="btn btn-ghost"><Target size={15} /> {plan ? "Edit plan" : "Create plan"}</Link>
              <Link href={`/players/${player.id}/stats`} className="btn btn-ghost"><Activity size={15} /> Log match</Link>
            </>
          )}
          <a href={`/api/reports/${player.id}`} className="btn btn-ghost" aria-label="Download PDF report"><Download size={15} /> PDF</a>
          <PrintButton />
        </div>
      </header>

      {!latestEval ? (
        <Empty title="No evaluation yet" href={r.staff ? `/players/${player.id}/evaluate` : undefined} cta="Start first evaluation">
          {r.staff ? "Complete a first evaluation to unlock the report card, charts and a suggested development plan." : "Your coach hasn't published an evaluation yet. You'll see it here as soon as they do."}
        </Empty>
      ) : (
        <>
          {/* Snapshot: the numbers that matter most */}
          <section className="panel p-5 md:p-6" aria-label="Snapshot">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <p className="text-sm text-mute">
                {latestEval.label} · {fmtDate(latestEval.date)} · {latestEval.coach.name}
              </p>
              <div className="flex flex-wrap gap-2">
                {strongest && <Badge tone="good">Strongest: {strongest.label}</Badge>}
                {focus && <Badge tone="red">Focus: {focus.label}</Badge>}
              </div>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-x-6 gap-y-5 sm:grid-cols-3 lg:grid-cols-5">
              <div className="col-span-2 sm:col-span-1">
                <p className="text-xs text-mute">Overall</p>
                <p className="num mt-1 text-5xl font-bold leading-none text-volt">{r.overall.toFixed(1)}</p>
                {r.previousOverall != null && (
                  <p className="mt-1.5 text-xs text-mute"><Delta value={round1(r.overall - r.previousOverall)} /> since {r.prevEval?.label}</p>
                )}
              </div>
              {CATEGORIES.map((c) => {
                const v = r.categories[c.key];
                const tone = scoreTone(v);
                return (
                  <div key={c.key}>
                    <p className="flex items-center gap-1.5 text-xs text-mute">
                      <span className={clsx("h-2 w-2 rounded-full", PILLAR[c.key].bg)} aria-hidden /> {c.label}
                    </p>
                    <p className="num mt-1 text-2xl font-bold">{v.toFixed(1)}</p>
                    <div className="mt-1.5 flex items-center gap-2">
                      <div className="h-1 flex-1 rounded-full bg-white/[0.07]"><div className={clsx("h-1 rounded-full", TONE_BG[tone])} style={{ width: `${v * 10}%` }} /></div>
                      {r.previousCategories && <Delta value={round1(v - r.previousCategories[c.key])} />}
                    </div>
                  </div>
                );
              })}
            </div>

            <dl className="mt-6 grid grid-cols-2 gap-x-6 gap-y-3 border-t border-line pt-5 text-sm sm:grid-cols-3 lg:grid-cols-6">
              <Info label="Age" value={`${r.age.years} yrs`} />
              <Info label="Height" value={fmtHeight(player.heightCm)} />
              <Info label="Weight" value={player.weightKg ? `${player.weightKg} kg` : "–"} />
              <Info label="Foot" value={player.dominantFoot} />
              <Info label="Attendance" value={r.attendance.total ? `${r.attendance.rate}%` : "–"} />
              <Info label="Season" value={`${r.totals.apps} apps · ${r.totals.goals} G · ${r.totals.assists} A`} />
            </dl>
          </section>

          {/* Skills and shape */}
          <div className="grid gap-6 [&>*]:min-w-0 lg:grid-cols-[1.35fr_1fr]">
            <Card title="Skills" action={r.prevEval ? `Change vs ${r.prevEval.label}` : undefined}>
              <div className="grid gap-x-8 gap-y-6 sm:grid-cols-2">
                {CATEGORIES.map((c) => (
                  <div key={c.key}>
                    <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-mute">
                      <span className={clsx("h-2 w-2 rounded-full", PILLAR[c.key].bg)} aria-hidden /> {c.label}
                    </p>
                    <ul className="space-y-2">
                      {SKILLS.filter((s) => s.category === c.key).map((s) => {
                        const v = r.latest[s.key];
                        const prev = r.previous?.[s.key];
                        const tone = scoreTone(v);
                        return (
                          <li key={s.key} className="grid grid-cols-[1fr_40px_20px_28px] items-center gap-2 text-sm sm:grid-cols-[1fr_64px_22px_28px]" title={s.hint}>
                            <span className="truncate">{s.label}</span>
                            <span className="h-1 rounded-full bg-white/[0.07]"><span className={clsx("block h-1 rounded-full", TONE_BG[tone])} style={{ width: `${v * 10}%` }} /></span>
                            <span className={clsx("num text-right font-semibold", TONE_TEXT[tone])}>{v}</span>
                            <span className="text-right">{prev != null && v !== prev ? <Delta value={v - prev} /> : null}</span>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                ))}
              </div>
              <p className="mt-5 flex flex-wrap gap-x-4 gap-y-1 text-xs text-mute">
                <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-good" /> 7+ strong</span>
                <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-warn" /> 5–6 developing</span>
                <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-alert" /> under 5 needs work</span>
              </p>
            </Card>

            <Card title="Performance DNA" action={r.prevEval ? "Dashed: previous" : undefined}>
              <DnaRadar data={r.dna} height={250} />
              <div className="mt-4 flex items-center gap-4 border-t border-line pt-4">
                <Pitch primary={player.position} secondary={player.secondaryPos} className="h-24 w-auto shrink-0" />
                <div className="text-sm">
                  <p className="text-xs text-mute">Position</p>
                  <p className="font-semibold">{pos?.label ?? player.position}</p>
                  {player.secondaryPos && <p className="text-mute">Also {POSITION_BY_KEY[player.secondaryPos]?.label}</p>}
                </div>
              </div>
            </Card>
          </div>

          {/* Development plan */}
          {plan ? (
            <Card title={`Development plan · ${plan.title}`} action={`${fmtShort(plan.startDate)} – ${fmtShort(plan.endDate)} · ${plan.coach.name}`}>
              <p className="rounded-lg bg-volt/[0.07] px-4 py-3 text-[0.95rem] leading-relaxed">{plan.primaryFocus}</p>
              <div className="mt-6 grid gap-8 lg:grid-cols-[1.2fr_1fr]">
                <div>
                  <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-mute">Goals</h3>
                  <ul className="divide-y divide-line">
                    {plan.goals.map((g) => {
                      const p = goalProgress(g);
                      const done = p >= 1;
                      return (
                        <li key={g.id} className="py-3 first:pt-0">
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <p className="font-semibold">{SKILL_BY_KEY[g.skill]?.label}</p>
                              <p className="text-sm text-mute">{g.metric}</p>
                            </div>
                            <Badge tone={done ? "good" : "mute"}>{done ? "Achieved" : `${Math.round(p * 100)}%`}</Badge>
                          </div>
                          <div className="mt-2 flex items-center gap-3 text-xs">
                            <span className="num w-10 text-mute">{g.baseline}{g.unit}</span>
                            <Bar value={p} tone={done ? "good" : "royal"} className="flex-1" />
                            <span className="num w-10 text-right font-semibold">{g.target}{g.unit}</span>
                          </div>
                          <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-xs text-mute">
                            <span>Now <span className="num font-semibold text-ink">{g.current}{g.unit}</span> · {g.weeklyTarget}</span>
                            {r.staff && (
                              <form action={updateGoalProgress.bind(null, player.id)} className="no-print flex items-center gap-1.5">
                                <input type="hidden" name="goalId" value={g.id} />
                                <input name="current" type="number" step="any" defaultValue={g.current} className="field !w-20 !py-1 text-xs" aria-label={`Current value for ${SKILL_BY_KEY[g.skill]?.label}`} />
                                <button className="rounded-md px-2 py-1 font-semibold text-royal-soft hover:bg-royal/10">Update</button>
                              </form>
                            )}
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                </div>
                <div>
                  <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-mute">Drills · {plan.drills.length}</h3>
                  <ul className="space-y-2">
                    {plan.drills.map((pd) => (
                      <li key={pd.id}>
                        <details className="group rounded-lg bg-panel-2">
                          <summary className="flex cursor-pointer list-none items-center gap-3 px-3 py-2.5">
                            {pd.drill.atHome ? <Home size={15} className="shrink-0 text-mute" aria-label="At home" /> : <Dumbbell size={15} className="shrink-0 text-mute" aria-label="With team" />}
                            <span className="min-w-0 flex-1">
                              <span className="flex items-center gap-2 text-sm font-semibold">
                                <span className="truncate">{pd.drill.name}</span>
                                {pd.drill.videoFile && <PlayCircle size={14} className="shrink-0 text-royal-soft" aria-label="Has video" />}
                              </span>
                              <span className="block text-xs text-mute">{SKILL_BY_KEY[pd.drill.skill]?.label} · {pd.drill.minutes} min · {pd.perWeek}× a week</span>
                            </span>
                            <span className="text-xs font-semibold text-royal-soft group-open:hidden">How to</span>
                            <span className="hidden text-xs font-semibold text-mute group-open:inline">Close</span>
                          </summary>
                          <div className="space-y-2 border-t border-line px-3 py-3 text-sm">
                            {pd.drill.videoFile && (
                              <video src={`/api/drill-videos/${pd.drill.id}`} controls playsInline preload="none" controlsList="nodownload" className="no-print aspect-video w-full rounded-md bg-black" />
                            )}
                            <p className="text-mute">{pd.drill.summary}</p>
                            <p className="whitespace-pre-line">{pd.drill.instructions}</p>
                            <p className="text-xs text-dim">Equipment: {pd.drill.equipment || "None"}</p>
                            {pd.coachNote && <p className="text-xs text-volt-soft">Coach: {pd.coachNote}</p>}
                          </div>
                        </details>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </Card>
          ) : (
            <Empty title="No active plan" href={r.staff ? `/players/${player.id}/plan` : undefined} cta="Build plan from evaluation">
              {r.staff ? "PitchPath will suggest goals and drills from the latest evaluation for you to review." : "Your coach will share a development plan soon."}
            </Empty>
          )}

          {/* Progress and feedback */}
          <div className="grid gap-6 [&>*]:min-w-0 lg:grid-cols-2 lg:items-start">
            <Card title="Progress over time" action={`${r.evaluations.length} evaluations`}>
              <ProgressLines data={r.history} height={260} />
            </Card>

            <Card title="Coach feedback">
              <dl className="space-y-4 text-sm">
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-wider text-good">Doing well</dt>
                  <dd className="mt-1">{latestEval.strengths}</dd>
                </div>
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-wider text-warn">To improve</dt>
                  <dd className="mt-1">{latestEval.improvements}</dd>
                </div>
              </dl>
              <blockquote className="mt-4 border-l-2 border-line-strong pl-4 text-sm leading-relaxed text-ink/90">{latestEval.comment}</blockquote>

              {(r.notes.length > 0 || r.staff) && (
                <div className="mt-5 border-t border-line pt-4">
                  <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-mute">Notes</h3>
                  <ul className="space-y-3">
                    {r.notes.map((n) => (
                      <li key={n.id} className="text-sm">
                        <p>{n.body}</p>
                        <p className="mt-0.5 flex items-center gap-2 text-xs text-dim">
                          {n.author.name} · {fmtShort(n.createdAt)} {n.visibility === "STAFF" && <Badge tone="orange">Staff only</Badge>}
                        </p>
                      </li>
                    ))}
                  </ul>
                  {r.staff && (
                    <form action={addNote.bind(null, player.id)} className="no-print mt-3 space-y-2">
                      <textarea name="body" required minLength={2} rows={2} placeholder="Add a note…" className="field text-sm" aria-label="Note" />
                      <div className="flex items-center justify-between gap-2">
                        <select name="visibility" className="field !w-auto !py-1.5 text-sm" aria-label="Who can see this note">
                          <option value="FAMILY">Visible to family</option>
                          <option value="STAFF">Staff only</option>
                        </select>
                        <button className="btn btn-ghost">Add note</button>
                      </div>
                    </form>
                  )}
                </div>
              )}
            </Card>
          </div>

          {/* Check-ins and matches */}
          <div className="grid gap-6 [&>*]:min-w-0 lg:grid-cols-[1fr_2fr]">
            <Card title="Weekly check-ins">
              {plan ? (
                <>
                  <form action={addCheckIn.bind(null, player.id)} className="no-print mb-4 space-y-2">
                    <input type="hidden" name="planId" value={plan.id} />
                    <textarea name="note" required minLength={2} rows={2} placeholder={r.staff ? "How did the week go?" : "What did you practise this week?"} className="field text-sm" aria-label="Check-in note" />
                    <div className="flex items-center justify-between gap-2">
                      <label className="flex items-center gap-2 text-sm text-mute">
                        Effort
                        <select name="effort" defaultValue="4" className="field !w-auto !py-1.5">
                          {[5, 4, 3, 2, 1].map((n) => <option key={n} value={n}>{n} / 5</option>)}
                        </select>
                      </label>
                      <button className="btn btn-royal">Check in</button>
                    </div>
                  </form>
                  <ol className="divide-y divide-line">
                    {plan.checkIns.map((c) => (
                      <li key={c.id} className="py-3 first:pt-0">
                        <div className="flex items-center justify-between text-xs text-dim">
                          <span>{c.author.name} · {fmtShort(c.date)}</span>
                          <span className="num">Effort {c.effort}/5</span>
                        </div>
                        <p className="mt-1 text-sm">{c.note}</p>
                      </li>
                    ))}
                  </ol>
                </>
              ) : (
                <p className="text-sm text-mute">Check-ins start once a development plan is active.</p>
              )}
            </Card>

            <Card title="Match performance" action="Season 2026/27">
              <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <MiniStat label="Minutes" value={r.totals.minutes} sub={`${r.totals.apps} apps`} />
                <MiniStat label="Goals · assists" value={`${r.totals.goals} · ${r.totals.assists}`} sub={`${r.totals.onTarget}/${r.totals.shots} on target`} />
                <MiniStat label="Pass completion" value={`${r.totals.passPct}%`} sub={`${r.totals.passC}/${r.totals.passA}`} />
                <MiniStat label="Tackles · interceptions" value={`${r.totals.tackles} · ${r.totals.interceptions}`} />
              </dl>
              {r.matches.length > 0 && (
                <div className="mt-5 overflow-x-auto" tabIndex={0} role="region" aria-label="Scrollable table">
                  <table className="w-full min-w-[520px] text-sm">
                    <thead className="text-left text-xs text-mute">
                      <tr className="border-b border-line">
                        <th className="py-2 pr-3 font-medium">Date</th>
                        <th className="pr-3 font-medium">Opponent</th>
                        <th className="pr-3 text-right font-medium">Min</th>
                        <th className="pr-3 text-right font-medium">G</th>
                        <th className="pr-3 text-right font-medium">A</th>
                        <th className="pr-3 text-right font-medium">Pass</th>
                        <th className="text-right font-medium">Rating</th>
                      </tr>
                    </thead>
                    <tbody className="num">
                      {[...r.matches].reverse().map((m) => (
                        <tr key={m.id} className="border-b border-line last:border-0">
                          <td className="py-2 pr-3 text-mute">{m.label}</td>
                          <td className="pr-3">
                            {m.opponent}
                            {m.competition !== "League" && <span className="ml-2 text-xs text-mute">{m.competition}</span>}
                            {m.importId && <span className="ml-2 text-xs text-royal-soft" title="Imported by a parent and approved by the coach">Imported</span>}
                          </td>
                          <td className="pr-3 text-right">{m.minutes}</td>
                          <td className={clsx("pr-3 text-right", m.goals ? "font-semibold text-ink" : "text-dim")}>{m.goals}</td>
                          <td className={clsx("pr-3 text-right", m.assists ? "font-semibold text-ink" : "text-dim")}>{m.assists}</td>
                          <td className="pr-3 text-right">{m.passPct}%</td>
                          <td className={clsx("text-right font-semibold", m.rating != null && TONE_TEXT[scoreTone(m.rating)])}>{m.rating?.toFixed(1) ?? "–"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </Card>
          </div>

          {/* History */}
          <Card title="Evaluation history">
            <div className="overflow-x-auto" tabIndex={0} role="region" aria-label="Scrollable table">
              <table className="w-full min-w-[520px] text-sm">
                <thead className="text-left text-xs text-mute">
                  <tr className="border-b border-line">
                    <th className="py-2 pr-3 font-medium">Evaluation</th>
                    <th className="pr-3 text-right font-medium">Overall</th>
                    {CATEGORIES.map((c) => (
                      <th key={c.key} className="pr-3 text-right font-medium last:pr-0">
                        <span className="inline-flex items-center gap-1.5"><span className={clsx("h-1.5 w-1.5 rounded-full", PILLAR[c.key].bg)} aria-hidden />{c.label}</span>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="num">
                  {[...r.evaluations].reverse().map((e, i) => {
                    const h = r.history[r.history.length - 1 - i];
                    return (
                      <tr key={e.id} className="border-b border-line last:border-0">
                        <td className="py-2 pr-3">
                          {e.label} <span className="text-xs text-dim">{fmtShort(e.date)}</span> {!e.published && <Badge tone="warn">Draft</Badge>}
                        </td>
                        <td className="pr-3 text-right font-semibold text-volt">{h.Overall.toFixed(1)}</td>
                        <td className="pr-3 text-right">{h.Technical.toFixed(1)}</td>
                        <td className="pr-3 text-right">{h.Tactical.toFixed(1)}</td>
                        <td className="pr-3 text-right">{h.Physical.toFixed(1)}</td>
                        <td className="text-right">{h.Mentality.toFixed(1)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        </>
      )}

      {/* Parent-imported match stats: coaches review, parents upload */}
      {r.staff && r.imports.length > 0 && (
        <Card title={`Imported stats to review · ${r.imports.length}`} className="scroll-mt-24" action="Only approved matches count">
          <div id="imports" className="space-y-6">
            {r.imports.map((imp) => (
              <div key={imp.id} className="rounded-lg bg-panel-2 p-4">
                <p className="text-sm">
                  <span className="font-semibold">{imp.uploadedBy.name}</span>
                  <span className="text-mute"> · {imp.source} · {imp.fileName} · {fmtShort(imp.createdAt)}</span>
                </p>
                <div className="mt-3 overflow-x-auto" tabIndex={0} role="region" aria-label="Scrollable table">
                  <table className="w-full min-w-[520px] text-sm">
                    <thead className="text-left text-xs text-mute">
                      <tr className="border-b border-line">
                        <th className="py-1.5 pr-3 font-medium">Date</th>
                        <th className="pr-3 font-medium">Opponent</th>
                        <th className="pr-3 text-right font-medium">Min</th>
                        <th className="pr-3 text-right font-medium">G</th>
                        <th className="pr-3 text-right font-medium">A</th>
                        <th className="pr-3 text-right font-medium">Shots</th>
                        <th className="pr-3 text-right font-medium">Pass</th>
                        <th className="text-right font-medium">Rating</th>
                      </tr>
                    </thead>
                    <tbody className="num">
                      {imp.rows.map((row, i) => {
                        const dup = r.loggedDates.has(row.date);
                        return (
                          <tr key={i} className={clsx("border-b border-line last:border-0", dup && "text-dim")}>
                            <td className="py-1.5 pr-3">{fmtShort(new Date(`${row.date}T12:00:00Z`))}</td>
                            <td className="pr-3">{row.opponent}{dup && <span className="ml-2 text-xs text-warn">Already logged, will be skipped</span>}</td>
                            <td className="pr-3 text-right">{row.minutes}</td>
                            <td className="pr-3 text-right">{row.goals}</td>
                            <td className="pr-3 text-right">{row.assists}</td>
                            <td className="pr-3 text-right">{row.shotsOnTarget}/{row.shots}</td>
                            <td className="pr-3 text-right">{row.passesCompleted}/{row.passesAttempted}</td>
                            <td className="text-right">{row.rating ?? "–"}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                {imp.skipped.length > 0 && <p className="mt-2 text-xs text-mute">{imp.skipped.length} row{imp.skipped.length > 1 ? "s" : ""} in the file couldn&apos;t be read and won&apos;t be imported.</p>}
                <form action={reviewImport.bind(null, player.id)} className="no-print mt-3 flex flex-col gap-2 sm:flex-row">
                  <input type="hidden" name="importId" value={imp.id} />
                  <input name="note" maxLength={500} placeholder="Note to the parent (optional)" className="field flex-1 text-sm" aria-label="Note to the parent" />
                  <div className="flex gap-2">
                    <button name="decision" value="APPROVE" className="btn btn-royal">Approve</button>
                    <button name="decision" value="REJECT" className="btn btn-ghost">Reject</button>
                  </div>
                </form>
              </div>
            ))}
          </div>
        </Card>
      )}

      {user.role === "PARENT" && player.allowParentImports && (
        <Card title="Import match stats" action="Your coach reviews every import">
          <p className="mb-4 text-sm text-mute">
            Upload a CSV of {player.firstName}&apos;s match stats from Veo, Hudl or your own spreadsheet. Your coach checks them before they appear in the season stats.
          </p>
          <UploadStatsForm playerId={player.id} />
          {r.imports.length > 0 && (
            <ul className="mt-5 divide-y divide-line border-t border-line">
              {r.imports.map((imp) => (
                <li key={imp.id} className="flex flex-wrap items-start justify-between gap-2 py-3 text-sm">
                  <div className="min-w-0">
                    <p className="truncate font-semibold">{imp.fileName}</p>
                    <p className="text-xs text-mute">{imp.rows.length} match{imp.rows.length === 1 ? "" : "es"} · {imp.source} · {fmtShort(imp.createdAt)}</p>
                    {imp.reviewNote && <p className="mt-1 text-xs">{imp.reviewedBy?.name}: {imp.reviewNote}</p>}
                  </div>
                  <Badge tone={imp.status === "APPROVED" ? "good" : imp.status === "REJECTED" ? "red" : "warn"}>
                    {imp.status === "APPROVED" ? "Approved" : imp.status === "REJECTED" ? "Not accepted" : "Waiting for coach"}
                  </Badge>
                </li>
              ))}
            </ul>
          )}
        </Card>
      )}

      {/* Staff only: who can see this profile */}
      {r.staff && (
        <Card title="Family access" className="no-print" action={<span className="flex items-center gap-1.5"><ShieldCheck size={14} /> Staff only</span>}>
          <div className="grid gap-8 lg:grid-cols-2">
            <div>
              <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-mute">Who can see this profile</h3>
              {r.access.length === 0 ? (
                <p className="text-sm text-mute">Only club staff and assigned coaches.</p>
              ) : (
                <ul className="divide-y divide-line">
                  {r.access.map((a) => (
                    <li key={a.userId} className="flex items-center justify-between gap-3 py-2.5 first:pt-0">
                      <div className="min-w-0 text-sm">
                        <p className="truncate font-semibold">{a.user.name} <span className="font-normal text-mute">· {a.relation === "SELF" ? "Player" : "Parent"}</span></p>
                        <p className="truncate text-xs text-dim">{a.user.email}</p>
                      </div>
                      <form action={revokeAccess.bind(null, player.id)}>
                        <input type="hidden" name="userId" value={a.userId} />
                        <button className="flex items-center gap-1 rounded-md px-2 py-1 text-xs font-semibold text-mute hover:bg-alert/10 hover:text-alert" aria-label={`Remove ${a.user.name}`}><X size={13} /> Remove</button>
                      </form>
                    </li>
                  ))}
                </ul>
              )}
              {r.invites.length > 0 && (
                <p className="mt-3 flex items-center gap-1.5 text-xs text-mute"><Clock size={12} /> Pending: {r.invites.map((i) => i.email).join(", ")}</p>
              )}
              <p className="mt-4 text-sm text-mute">
                Guardian consent: {player.consentAt ? <span className="text-good">recorded {fmtDate(player.consentAt)}</span> : <span className="text-alert">not recorded</span>}
              </p>
              {!player.consentAt && (
                <form action={recordConsent.bind(null, player.id)} className="mt-2"><button className="btn btn-ghost">Record consent</button></form>
              )}
              <form action={setParentImports.bind(null, player.id)} className="mt-4 flex items-center justify-between gap-3 rounded-lg bg-panel-2 px-3 py-2.5">
                <input type="hidden" name="allow" value={player.allowParentImports ? "false" : "true"} />
                <span className="text-sm">
                  <span className="font-semibold">Parents can import match stats</span>
                  <span className="block text-xs text-mute">{player.allowParentImports ? "On. You review every import before it counts." : "Off. Turn on to let this player's parents upload stats files."}</span>
                </span>
                <button
                  role="switch"
                  aria-checked={player.allowParentImports}
                  aria-label="Parents can import match stats"
                  className={clsx("relative h-6 w-11 shrink-0 rounded-full transition", player.allowParentImports ? "bg-royal" : "bg-white/15")}
                >
                  <span className={clsx("absolute top-0.5 h-5 w-5 rounded-full bg-white transition-all", player.allowParentImports ? "left-[22px]" : "left-0.5")} />
                </button>
              </form>
            </div>
            <div>
              <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-mute">Invite a parent or player</h3>
              <InviteForm playerId={player.id} />
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs text-mute">{label}</dt>
      <dd className="num mt-0.5 font-semibold">{value}</dd>
    </div>
  );
}

function MiniStat({ label, value, sub }: { label: string; value: React.ReactNode; sub?: string }) {
  return (
    <div className="rounded-lg bg-panel-2 px-3 py-2.5">
      <dt className="text-xs text-mute">{label}</dt>
      <dd className="num mt-0.5 text-xl font-bold">{value}</dd>
      {sub && <dd className="text-xs text-dim">{sub}</dd>}
    </div>
  );
}
