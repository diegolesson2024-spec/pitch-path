import Link from "next/link";
import { Plus } from "lucide-react";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { teamScope } from "@/lib/access";
import { Empty, PageHeader } from "@/components/ui";

export const metadata = { title: "Teams" };

export default async function TeamsPage() {
  const user = await requireUser(["ADMIN", "CLUB", "COACH"]);
  const teams = await db.team.findMany({
    where: teamScope(user),
    include: {
      club: true,
      coaches: { include: { user: { select: { name: true } } } },
      _count: { select: { players: true, sessions: true } },
    },
    orderBy: [{ club: { name: "asc" } }, { name: "asc" }],
  });

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader eyebrow={user.clubName ?? "All clubs"} title="Teams" accent={String(teams.length)}>
        {(user.role === "CLUB" || user.role === "ADMIN") && <Link href="/teams/new" className="btn btn-primary"><Plus size={15} /> New team</Link>}
      </PageHeader>
      {teams.length === 0 ? (
        <Empty title="No teams yet">{user.role === "COACH" ? "Your club director will assign you to a team." : "Create your first team to start adding players."}</Empty>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {teams.map((t) => (
            <Link key={t.id} href={`/teams/${t.id}`} className="panel group relative overflow-hidden p-5 transition hover:border-royal-soft">
              <p className="eyebrow">{t.club.name}</p>
              <p className="mt-1 text-2xl font-bold">{t.name}</p>
              <p className="mt-1 text-sm text-mute">{t.ageGroup} · {t.season}</p>
              <div className="mt-5 flex gap-6 text-sm">
                <div><p className="num text-2xl font-bold">{t._count.players}</p><p className="text-xs text-mute">players</p></div>
                <div><p className="num text-2xl font-bold">{t._count.sessions}</p><p className="text-xs text-mute">sessions</p></div>
              </div>
              <p className="mt-4 truncate text-xs text-dim">Coaches: {t.coaches.map((c) => c.user.name).join(", ") || "none assigned"}</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
