import Link from "next/link";
import { Plus, Search } from "lucide-react";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { playerScope, teamScope } from "@/lib/access";
import { playerSummaries } from "@/lib/summaries";
import { POSITIONS } from "@/lib/skills";
import { Card, Empty, PageHeader } from "@/components/ui";
import { PlayerRow } from "@/components/PlayerRow";

export const metadata = { title: "Players" };

export default async function PlayersPage({ searchParams }: { searchParams: Promise<{ q?: string; team?: string; pos?: string }> }) {
  const user = await requireUser(["ADMIN", "CLUB", "COACH"]);
  const { q = "", team = "", pos = "" } = await searchParams;
  const teams = await db.team.findMany({ where: teamScope(user), orderBy: { name: "asc" } });

  const players = await playerSummaries({
    AND: [
      playerScope(user),
      team ? { teamId: team } : {},
      pos ? { position: pos } : {},
      q ? { OR: [{ firstName: { contains: q } }, { lastName: { contains: q } }] } : {},
    ],
  });

  const byTeam = teams
    .map((t) => ({ team: t, players: players.filter((p) => p.team?.id === t.id) }))
    .filter((g) => g.players.length);
  const unassigned = players.filter((p) => !p.team);

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader eyebrow={user.clubName ?? "All clubs"} title="Players" accent={String(players.length)}>
        <Link href="/players/new" className="btn btn-primary"><Plus size={15} /> Add player</Link>
      </PageHeader>

      <form className="panel mb-5 grid gap-2 p-3 sm:grid-cols-[1fr_auto_auto_auto]">
        <label className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-dim" />
          <input name="q" defaultValue={q} placeholder="Search by name" className="field !pl-9" aria-label="Search players" />
        </label>
        <select name="team" defaultValue={team} className="field sm:w-44" aria-label="Team">
          <option value="">All teams</option>
          {teams.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
        </select>
        <select name="pos" defaultValue={pos} className="field sm:w-40" aria-label="Position">
          <option value="">All positions</option>
          {POSITIONS.map((p) => <option key={p.key} value={p.key}>{p.label}</option>)}
        </select>
        <button className="btn btn-royal">Filter</button>
      </form>

      {players.length === 0 ? (
        <Empty title="No players found" href="/players/new" cta="Add a player">Try a different search, or register your first player.</Empty>
      ) : (
        <div className="space-y-5">
          {byTeam.map((g) => (
            <Card key={g.team.id} title={g.team.name} action={<Link href={`/teams/${g.team.id}`} className="text-xs font-bold uppercase tracking-wider text-volt">Team view →</Link>}>
              <div className="grid gap-x-6 md:grid-cols-2">
                {g.players.map((p) => <PlayerRow key={p.id} p={p} />)}
              </div>
            </Card>
          ))}
          {unassigned.length > 0 && (
            <Card title="No team" tone="mute">
              <div className="grid gap-x-6 md:grid-cols-2">{unassigned.map((p) => <PlayerRow key={p.id} p={p} />)}</div>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
