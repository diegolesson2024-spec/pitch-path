import Link from "next/link";
import clsx from "clsx";
import { ArrowRight, ClipboardPen, Plus, Sparkles, Target } from "lucide-react";
import { db } from "@/lib/db";
import { requireUser, type CurrentUser } from "@/lib/auth";
import { playerScope, teamScope } from "@/lib/access";
import { playerSummaries, type PlayerSummary } from "@/lib/summaries";
import { rankedSkills, toScoreMap } from "@/lib/analytics";
import { getPractice, type Practice } from "@/lib/practice";
import { ROLE_LABEL, SKILL_BY_KEY } from "@/lib/skills";
import { fmtShort } from "@/lib/format";
import { Avatar, Badge, Bar, Card, Delta, Empty, PageHeader, Stat } from "@/components/ui";
import { PlayerRow } from "@/components/PlayerRow";
import { BadgeShelf, DrillChecklist, NewBadgeHint, ProgressRing, StreakBadge, WeekDots } from "@/components/practice";

export const metadata = { title: "Dashboard" };

function greeting() {
  const h = new Date().getHours();
  return h < 12 ? "Good morning" : h < 18 ? "Good afternoon" : "Good evening";
}

const todayIndex = () => (new Date().getDay() + 6) % 7;

export default async function DashboardPage() {
  const user = await requireUser();
  if (user.role === "PLAYER") return <PlayerHome user={user} />;
  if (user.role === "PARENT") return <ParentDashboard user={user} />;
  if (user.role === "ADMIN") return <AdminDashboard user={user} />;
  return <StaffDashboard user={user} />;
}

/* ---------- Coach & club ---------- */

async function StaffDashboard({ user }: { user: CurrentUser }) {
  const [players, teams, recentCheckIns, pendingImports] = await Promise.all([
    playerSummaries(playerScope(user)),
    db.team.findMany({
      where: teamScope(user),
      include: { coaches: { include: { user: { select: { name: true } } } }, _count: { select: { players: true } } },
      orderBy: { name: "asc" },
    }),
    db.checkIn.findMany({
      where: { plan: { player: playerScope(user) }, author: { role: { in: ["PARENT", "PLAYER"] } } },
      include: { author: { select: { name: true } }, plan: { select: { player: { select: { id: true, firstName: true, lastName: true } } } } },
      orderBy: { date: "desc" },
      take: 5,
    }),
    db.statImport.findMany({
      where: { status: "PENDING", player: playerScope(user) },
      include: { player: { select: { id: true, firstName: true, lastName: true } } },
      orderBy: { createdAt: "asc" },
    }),
  ]);

  const due = players.filter((p) => p.evalDue);
  const withPlan = players.filter((p) => p.plan).length;
  const att = players.filter((p) => p.attendance != null);
  const avgAtt = att.length ? Math.round(att.reduce((a, p) => a + (p.attendance ?? 0), 0) / att.length) : 0;
  const improvers = [...players].filter((p) => p.delta != null).sort((a, b) => (b.delta ?? 0) - (a.delta ?? 0)).slice(0, 5);
  const attention = players.filter((p) => !p.plan || (p.delta != null && p.delta < 0)).slice(0, 6);

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <PageHeader eyebrow={`${ROLE_LABEL[user.role]} · ${user.clubName ?? ""}`} title={`${greeting()},`} accent={user.name.split(" ")[0]}>
        <Link href="/players/new" className="btn btn-ghost"><Plus size={15} /> Add player</Link>
        <Link href="/players" className="btn btn-primary"><ClipboardPen size={15} /> Evaluate</Link>
      </PageHeader>

      {user.role === "CLUB" && teams.length === 0 && (
        <section className="rounded-xl bg-volt/[0.08] p-5">
          <h2 className="text-lg font-bold">Welcome to PitchPath{user.clubName ? `, ${user.clubName}` : ""}!</h2>
          <p className="mt-1 text-sm text-mute">Three steps to get going:</p>
          <ol className="mt-3 grid gap-2 text-sm sm:grid-cols-3">
            <li><Link href="/teams/new" className="font-semibold text-royal-soft hover:underline">1. Create your first team</Link></li>
            <li><Link href="/people" className="font-semibold text-royal-soft hover:underline">2. Add your coaches</Link></li>
            <li><Link href="/players/new" className="font-semibold text-royal-soft hover:underline">3. Add players</Link></li>
          </ol>
        </section>
      )}

      {pendingImports.length > 0 && (
        <div className="rounded-lg bg-royal/10 px-4 py-3 text-sm">
          <span className="font-semibold">Imported stats to review:</span>{" "}
          {pendingImports.map((i, n) => (
            <span key={i.id}>
              {n > 0 && ", "}
              <Link href={`/players/${i.player.id}#imports`} className="font-semibold text-royal-soft hover:underline">{i.player.firstName} {i.player.lastName}</Link>
            </span>
          ))}
        </div>
      )}

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="Players" value={players.length} sub={`${teams.length} teams`} />
        <Stat label="Evaluations due" value={due.length} tone={due.length ? "warn" : undefined} sub="Not evaluated in 60+ days" />
        <Stat label="Active plans" value={`${withPlan}/${players.length}`} sub="Players with a plan" />
        <Stat label="Attendance" value={att.length ? `${avgAtt}%` : "–"} sub="Season average" />
      </div>

      <div className="grid gap-6 [&>*]:min-w-0 lg:grid-cols-2">
        <Card title="Teams" action={user.role === "CLUB" && <Link href="/teams/new" className="font-semibold text-royal-soft hover:underline">New team</Link>}>
          {teams.length === 0 ? (
            <p className="text-sm text-mute">No teams assigned yet.</p>
          ) : (
            <ul className="divide-y divide-line">
              {teams.map((t) => {
                const tp = players.filter((p) => p.team?.id === t.id && p.overall != null);
                const avg = tp.length ? tp.reduce((a, p) => a + (p.overall ?? 0), 0) / tp.length : null;
                return (
                  <li key={t.id}>
                    <Link href={`/teams/${t.id}`} className="flex items-center justify-between gap-3 py-3 first:pt-0 hover:text-royal-soft">
                      <div className="min-w-0">
                        <p className="font-semibold">{t.name}</p>
                        <p className="truncate text-xs text-mute">{t._count.players} players · {t.coaches.map((c) => c.user.name).join(", ") || "No coach"}</p>
                      </div>
                      <div className="text-right">
                        <p className="num text-lg font-bold">{avg?.toFixed(1) ?? "–"}</p>
                        <p className="text-xs text-dim">avg overall</p>
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </Card>

        <Card title="Top improvers" action="Since last evaluation">
          {improvers.length ? improvers.map((p) => <PlayerRow key={p.id} p={p} showTeam />) : <p className="text-sm text-mute">Improvement shows once players have two evaluations.</p>}
        </Card>

        <Card title="Needs attention" action="No plan or dipping scores">
          {attention.length ? attention.map((p) => <PlayerRow key={p.id} p={p} showTeam />) : <p className="text-sm text-mute">Everyone is on track.</p>}
          {due.length > 0 && (
            <p className="mt-3 rounded-lg bg-warn/[0.08] px-3 py-2 text-sm">
              <span className="font-semibold text-warn">{due.length} evaluation{due.length > 1 ? "s" : ""} due:</span>{" "}
              {due.slice(0, 6).map((p) => `${p.firstName} ${p.lastName}`).join(", ")}{due.length > 6 ? "…" : ""}
            </p>
          )}
        </Card>

        <Card title="Latest from families">
          {recentCheckIns.length ? (
            <ul className="divide-y divide-line">
              {recentCheckIns.map((c) => (
                <li key={c.id}>
                  <Link href={`/players/${c.plan.player.id}`} className="block py-3 first:pt-0 hover:text-royal-soft">
                    <p className="flex justify-between gap-3 text-xs text-mute">
                      <span>{c.author.name} for <span className="text-ink">{c.plan.player.firstName} {c.plan.player.lastName}</span></span>
                      <span>{fmtShort(c.date)}</span>
                    </p>
                    <p className="mt-1 text-sm text-ink">{c.note}</p>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-mute">Weekly check-ins from players and parents will appear here.</p>
          )}
        </Card>
      </div>
    </div>
  );
}

/* ---------- Platform admin ---------- */

async function AdminDashboard({ user }: { user: CurrentUser }) {
  const [clubs, roleCounts, playerCount, evalCount, audit] = await Promise.all([
    db.club.findMany({ include: { _count: { select: { teams: true, players: true, users: true } } }, orderBy: { name: "asc" } }),
    db.user.groupBy({ by: ["role"], _count: true }),
    db.player.count(),
    db.evaluation.count(),
    db.auditLog.findMany({ include: { user: { select: { name: true } } }, orderBy: { createdAt: "desc" }, take: 8 }),
  ]);
  const count = (r: string) => roleCounts.find((x) => x.role === r)?._count ?? 0;

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <PageHeader eyebrow="Platform admin" title={`${greeting()},`} accent={user.name.split(" ")[0]}>
        <Link href="/people" className="btn btn-primary"><Plus size={15} /> Add club or user</Link>
      </PageHeader>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
        <Stat label="Clubs" value={clubs.length} />
        <Stat label="Players" value={playerCount} />
        <Stat label="Coaches" value={count("COACH")} sub={`${count("CLUB")} club directors`} />
        <Stat label="Families" value={count("PARENT") + count("PLAYER")} sub={`${count("PARENT")} parents · ${count("PLAYER")} players`} />
        <Stat label="Evaluations" value={evalCount} />
      </div>
      <div className="grid gap-6 [&>*]:min-w-0 lg:grid-cols-[1.3fr_1fr]">
        <Card title="Clubs">
          <ul className="divide-y divide-line">
            {clubs.map((c) => (
              <li key={c.id} className="flex items-center justify-between gap-3 py-3 first:pt-0">
                <div>
                  <p className="font-semibold">{c.name}</p>
                  <p className="text-xs text-mute">{c.city}</p>
                </div>
                <p className="num text-right text-xs text-mute">{c._count.teams} teams · {c._count.players} players · {c._count.users} users</p>
              </li>
            ))}
          </ul>
        </Card>
        <Card title="Recent activity" action={<Link href="/audit" className="font-semibold text-royal-soft hover:underline">Audit log</Link>}>
          <ul className="space-y-2.5 text-sm">
            {audit.map((a) => (
              <li key={a.id} className="flex items-start justify-between gap-3">
                <span><span className="font-semibold">{a.user?.name ?? "System"}</span> <span className="text-mute">{a.action.toLowerCase().replaceAll("_", " ")}</span></span>
                <span className="shrink-0 text-xs text-dim">{fmtShort(a.createdAt)}</span>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </div>
  );
}

/* ---------- Parent ---------- */

async function ParentDashboard({ user }: { user: CurrentUser }) {
  const players = await playerSummaries(playerScope(user), { familyView: true });
  const practice = await Promise.all(players.map((p) => getPractice(p.id)));

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <PageHeader eyebrow="Family portal" title={`${greeting()},`} accent={user.name.split(" ")[0]} />
      {players.length === 0 && (
        <Empty title="No player profiles linked yet">Ask your coach to send you an invite link. Once accepted, the profile appears here.</Empty>
      )}
      {players.map((p, i) => (
        <ParentPlayerCard key={p.id} p={p} practice={practice[i]} />
      ))}
    </div>
  );
}

function ParentPlayerCard({ p, practice }: { p: PlayerSummary; practice: Practice }) {
  const strongest = p.lights.find((l) => l.level === "STRONGEST");
  const focus = p.lights.find((l) => l.level === "NEEDS_FOCUS");
  return (
    <section className="panel overflow-hidden">
      <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center md:p-6">
        <div className="flex flex-1 items-center gap-4">
          <Avatar first={p.firstName} last={p.lastName} hue={p.avatarHue} size={52} />
          <div className="min-w-0">
            <h2 className="text-xl font-bold">{p.firstName} {p.lastName}</h2>
            <p className="text-sm text-mute">{p.team?.name} · {p.position}{p.lastEval ? ` · evaluated ${fmtShort(p.lastEval.date)}` : ""}</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {strongest && <Badge tone="good">Strongest: {strongest.label}</Badge>}
              {focus && <Badge tone="red">Focus: {focus.label}</Badge>}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <div>
            <p className="text-xs text-mute">Overall</p>
            <p className="num text-3xl font-bold text-volt">{p.overall?.toFixed(1) ?? "–"}</p>
            {p.delta != null && <Delta value={p.delta} />}
          </div>
          <div>
            <p className="text-xs text-mute">Attendance</p>
            <p className="num text-3xl font-bold">{p.attendance != null ? `${p.attendance}%` : "–"}</p>
          </div>
        </div>
      </div>

      {practice.drills.length > 0 && (
        <div className="grid gap-6 border-t border-line p-5 [&>*]:min-w-0 md:p-6 lg:grid-cols-[1fr_1.4fr]">
          <div className="space-y-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-mute">This week</p>
              <p className="mt-1 text-sm">
                <span className="num font-semibold">{practice.weekDone} of {practice.weekTarget}</span> drills done
                {practice.weekLeft === 0 ? <span className="text-good"> · all done!</span> : ""}
              </p>
              <Bar value={practice.weekDone} max={practice.weekTarget || 1} tone={practice.weekLeft === 0 ? "good" : "orange"} className="mt-2 !h-2" />
            </div>
            <WeekDots active={practice.activeDays} todayIndex={todayIndex()} />
            <StreakBadge streak={practice.streak} best={practice.bestStreak} />
            {practice.primaryFocus && <p className="text-sm text-mute">{practice.primaryFocus}</p>}
          </div>
          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-mute">Drills to practise</p>
            <DrillChecklist playerId={p.id} practice={practice} />
          </div>
        </div>
      )}

      <div className="flex flex-col gap-4 border-t border-line p-5 sm:flex-row sm:items-center sm:justify-between md:px-6">
        <div className="min-w-0 flex-1">
          <BadgeShelf badges={practice.badges} size="sm" />
        </div>
        <Link href={`/players/${p.id}`} className="btn btn-ghost shrink-0">Full report card <ArrowRight size={15} /></Link>
      </div>
    </section>
  );
}

/* ---------- Player (designed for younger players) ---------- */

async function PlayerHome({ user }: { user: CurrentUser }) {
  const [p] = await playerSummaries(playerScope(user), { familyView: true });
  if (!p) {
    return <Empty title="Your profile isn't linked yet">Ask your coach to send you an invite.</Empty>;
  }
  const [practice, latest] = await Promise.all([
    getPractice(p.id),
    db.evaluation.findFirst({ where: { playerId: p.id, published: true }, orderBy: { date: "desc" }, include: { scores: true } }),
  ]);
  const ranked = latest ? rankedSkills(toScoreMap(latest.scores)) : [];
  const superpowers = ranked.slice(0, 3);
  const nextSkill = ranked.at(-1);
  const left = practice.weekLeft;

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <header>
        <h1 className="display text-5xl md:text-6xl">Hey <span className="text-volt">{p.firstName}!</span></h1>
        <p className="mt-2 text-lg text-mute">
          {practice.drills.length === 0
            ? "Your coach is getting your training ready."
            : left === 0
              ? "You've done every drill this week. Amazing work!"
              : `${left} drill${left > 1 ? "s" : ""} to go this week. Let's do one today!`}
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2">
        <section className="panel flex flex-col items-center gap-4 p-5 text-center min-[420px]:flex-row min-[420px]:text-left sm:flex-col sm:text-center lg:flex-row lg:text-left">
          <ProgressRing done={practice.weekDone} target={practice.weekTarget} size={112} />
          <div className="space-y-3">
            <p className="font-bold">This week</p>
            <WeekDots active={practice.activeDays} todayIndex={todayIndex()} />
          </div>
        </section>
        <section className="panel flex flex-col justify-center gap-3 p-5">
          <StreakBadge streak={practice.streak} best={practice.bestStreak} />
          <p className="text-sm text-mute">
            {practice.streak === 0
              ? "Do a drill today to start a streak."
              : practice.activeDays[todayIndex()]
                ? "You practised today. Come back tomorrow to keep it going!"
                : "Practise today to keep your streak alive."}
          </p>
        </section>
      </div>

      <section>
        <h2 className="mb-3 text-xl font-bold">Your drills</h2>
        <DrillChecklist playerId={p.id} practice={practice} kid />
      </section>

      <div className="grid gap-4 sm:grid-cols-2">
        {superpowers.length > 0 && (
          <section className="panel p-5">
            <h2 className="flex items-center gap-2 font-bold"><Sparkles size={18} className="text-good" /> Your superpowers</h2>
            <ul className="mt-3 space-y-2">
              {superpowers.map((s) => (
                <li key={s.key} className="flex items-center justify-between rounded-lg bg-good/[0.08] px-3 py-2">
                  <span className="font-semibold">{s.label}</span>
                  <span className="text-xs text-good">{s.hint.split(".")[0]}</span>
                </li>
              ))}
            </ul>
          </section>
        )}
        {nextSkill && (
          <section className="panel p-5">
            <h2 className="flex items-center gap-2 font-bold"><Target size={18} className="text-volt" /> Next challenge</h2>
            <p className="mt-3 text-2xl font-bold">{SKILL_BY_KEY[nextSkill.key]?.label}</p>
            <p className="mt-1 text-sm text-mute">{nextSkill.hint}</p>
            {practice.planTitle && <p className="mt-3 text-sm">Your plan: <span className="font-semibold">{practice.planTitle}</span></p>}
          </section>
        )}
      </div>

      <section className="panel p-5">
        <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="font-bold">Badges <span className="num text-mute">{practice.badges.filter((b) => b.earned).length}/{practice.badges.length}</span></h2>
          <NewBadgeHint practice={practice} />
        </div>
        <BadgeShelf badges={practice.badges} />
      </section>

      <p className="text-center">
        <Link href={`/players/${p.id}`} className={clsx("text-sm font-semibold text-royal-soft hover:underline")}>See my full report card</Link>
      </p>
    </div>
  );
}
