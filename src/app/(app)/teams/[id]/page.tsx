import Link from "next/link";
import { notFound } from "next/navigation";
import { Plus } from "lucide-react";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { teamScope } from "@/lib/access";
import { playerSummaries } from "@/lib/summaries";
import { categoryAverages, dnaAxes, round1, toScoreMap } from "@/lib/analytics";
import { CATEGORIES } from "@/lib/skills";
import { fmtShort } from "@/lib/format";
import { Badge, Bar, Card, PageHeader, Stat } from "@/components/ui";
import { PlayerRow } from "@/components/PlayerRow";
import { DnaRadar } from "@/components/charts";
import { assignCoach, recordSession } from "../actions";

export const metadata = { title: "Team" };

export default async function TeamPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await requireUser(["ADMIN", "CLUB", "COACH"]);
  const team = await db.team.findFirst({
    where: { AND: [{ id }, teamScope(user)] },
    include: {
      club: true,
      coaches: { include: { user: { select: { id: true, name: true } } } },
      sessions: { include: { attendance: true }, orderBy: { date: "desc" }, take: 8 },
    },
  });
  if (!team) notFound();

  const [players, latestEvals, clubCoaches] = await Promise.all([
    playerSummaries({ teamId: team.id }),
    db.evaluation.findMany({
      where: { player: { teamId: team.id } },
      orderBy: { date: "desc" },
      distinct: ["playerId"],
      include: { scores: true },
    }),
    user.role !== "COACH" ? db.user.findMany({ where: { clubId: team.clubId, role: "COACH" }, orderBy: { name: "asc" } }) : Promise.resolve([]),
  ]);

  // Team average across each player's latest evaluation.
  const maps = latestEvals.map((e) => toScoreMap(e.scores));
  const avgMap: Record<string, number> = {};
  if (maps.length) for (const k of Object.keys(maps[0])) avgMap[k] = round1(maps.reduce((a, m) => a + (m[k] ?? 0), 0) / maps.length);
  const cats = categoryAverages(avgMap);
  const att = players.filter((p) => p.attendance != null);

  return (
    <div className="mx-auto max-w-7xl">
      <PageHeader eyebrow={`${team.club.name} · ${team.season}`} title={team.name}>
        <Link href="/players/new" className="btn btn-ghost"><Plus size={15} /> Add player</Link>
      </PageHeader>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="Squad" value={players.length} />
        <Stat label="Team overall" value={maps.length ? round1(Object.values(avgMap).reduce((a, b) => a + b, 0) / Object.values(avgMap).length).toFixed(1) : "–"} tone="orange" />
        <Stat label="Attendance" value={`${att.length ? Math.round(att.reduce((a, p) => a + (p.attendance ?? 0), 0) / att.length) : 0}%`} />
        <Stat label="Plans active" value={`${players.filter((p) => p.plan).length}/${players.length}`} tone="royal" />
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-[1.4fr_1fr]">
        <Card title="Squad" action={<span className="text-xs text-mute">Latest overall · change</span>}>
          <div className="grid gap-x-4 md:grid-cols-2">{players.map((p) => <PlayerRow key={p.id} p={p} />)}</div>
        </Card>
        <div className="space-y-5">
          <Card title="Team DNA" tone="orange">
            {maps.length ? <DnaRadar data={dnaAxes(avgMap)} height={240} /> : <p className="text-sm text-mute">No evaluations yet.</p>}
            <div className="mt-3 space-y-2.5">
              {CATEGORIES.map((c) => (
                <div key={c.key}>
                  <div className="mb-1 flex justify-between text-xs"><span className="font-semibold">{c.label}</span><span className="num">{cats[c.key].toFixed(1)}</span></div>
                  <Bar value={cats[c.key]} max={10} />
                </div>
              ))}
            </div>
          </Card>
          <Card title="Coaches" tone="royal">
            <ul className="flex flex-wrap gap-2">{team.coaches.map((c) => <li key={c.user.id}><Badge tone="royal">{c.user.name}</Badge></li>)}</ul>
            {clubCoaches.length > 0 && (
              <form action={assignCoach.bind(null, team.id)} className="mt-4 flex gap-2">
                <select name="userId" className="field !py-1.5 text-sm" aria-label="Coach to assign">
                  {clubCoaches.filter((c) => !team.coaches.some((tc) => tc.user.id === c.id)).map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
                <button className="btn btn-ghost">Assign</button>
              </form>
            )}
          </Card>
        </div>
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-[1.4fr_1fr]">
        <Card title="Take attendance" tone="orange">
          <form action={recordSession.bind(null, team.id)} className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-3">
              <label><span className="label">Date</span><input name="date" type="date" defaultValue={new Date().toLocaleDateString("en-CA")} required className="field" /></label>
              <label><span className="label">Type</span><select name="kind" className="field"><option value="TRAINING">Training</option><option value="MATCH">Match</option></select></label>
              <label><span className="label">Title</span><input name="title" defaultValue="Training session" required maxLength={80} className="field" /></label>
            </div>
            <div className="divide-y divide-line rounded-xl border border-line">
              {players.map((p) => (
                <fieldset key={p.id} className="flex flex-wrap items-center justify-between gap-2 px-3 py-2">
                  <legend className="sr-only">{p.firstName} {p.lastName}</legend>
                  <span className="text-sm font-semibold">{p.firstName} {p.lastName}</span>
                  <span className="flex gap-1">
                    {(["PRESENT", "LATE", "ABSENT", "EXCUSED"] as const).map((s) => (
                      <label key={s} className="cursor-pointer">
                        <input type="radio" name={`att_${p.id}`} value={s} defaultChecked={s === "PRESENT"} className="peer sr-only" />
                        <span className="block rounded-lg border border-line px-2 py-1 text-[0.65rem] font-bold uppercase tracking-wider text-mute peer-checked:border-royal peer-checked:bg-royal peer-checked:text-white peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-volt">
                          {s[0] + s.slice(1).toLowerCase()}
                        </span>
                      </label>
                    ))}
                  </span>
                </fieldset>
              ))}
            </div>
            <div className="flex justify-end"><button className="btn btn-primary">Save attendance</button></div>
          </form>
        </Card>
        <Card title="Recent sessions" tone="royal">
          <ul className="space-y-2">
            {team.sessions.map((s) => {
              const present = s.attendance.filter((a) => a.status === "PRESENT" || a.status === "LATE").length;
              return (
                <li key={s.id} className="panel-flat flex items-center justify-between gap-3 p-3">
                  <div>
                    <p className="text-sm font-semibold">{s.title}</p>
                    <p className="text-xs text-mute">{fmtShort(s.date)} · {s.kind === "MATCH" ? "Match" : "Training"}</p>
                  </div>
                  <p className="num text-sm"><span className="font-bold">{present}</span><span className="text-mute">/{s.attendance.length}</span></p>
                </li>
              );
            })}
          </ul>
        </Card>
      </div>
    </div>
  );
}
