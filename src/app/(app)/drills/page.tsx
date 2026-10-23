import Link from "next/link";
import clsx from "clsx";
import type { Prisma } from "@prisma/client";
import { Home, Users, Clock, Plus, PlayCircle, Lock } from "lucide-react";
import { db } from "@/lib/db";
import { isStaff, requireUser } from "@/lib/auth";
import { drillScope } from "@/lib/drills";
import { CATEGORIES, SKILL_BY_KEY } from "@/lib/skills";
import { Badge, Empty, PageHeader } from "@/components/ui";

export const metadata = { title: "Drill library" };

type Params = { cat?: string; home?: string; src?: string };

export default async function DrillsPage({ searchParams }: { searchParams: Promise<Params> }) {
  const user = await requireUser();
  const sp = await searchParams;
  const { cat = "", home = "", src = "" } = sp;
  const staff = isStaff(user);

  const source: Prisma.DrillWhereInput =
    src === "mine" ? { createdById: user.id } : src === "club" ? { clubId: user.clubId ?? "__none__" } : src === "library" ? { createdById: null, clubId: null } : {};

  const drills = await db.drill.findMany({
    where: { AND: [drillScope(user), source, cat ? { category: cat } : {}, home ? { atHome: true } : {}] },
    include: { createdBy: { select: { name: true } } },
    orderBy: [{ createdAt: "desc" }, { category: "asc" }, { name: "asc" }],
  });

  const chip = (active: boolean) =>
    clsx("rounded-full border px-3 py-1.5 text-xs font-bold uppercase tracking-wider transition", active ? "border-volt bg-volt text-night" : "border-line-strong text-mute hover:text-ink");
  const href = (patch: Partial<Params>) => {
    const next = { ...sp, ...patch };
    const q = new URLSearchParams(Object.entries(next).filter(([, v]) => v) as [string, string][]);
    return `/drills${q.size ? `?${q}` : ""}`;
  };

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader eyebrow={`${drills.length} drills`} title="Drill" accent="library">
        {staff && user.clubId && <Link href="/drills/new" className="btn btn-primary"><Plus size={15} /> Create drill</Link>}
      </PageHeader>

      {staff && (
        <div className="mb-3 flex flex-wrap gap-2">
          {[["", "All"], ["mine", "My drills"], ["club", user.role === "CLUB" ? "Club drills" : "Shared at club"], ["library", "PitchPath library"]].map(([v, l]) => (
            <Link key={v} href={href({ src: v })} className={chip(src === v)}>{l}</Link>
          ))}
        </div>
      )}
      <div className="mb-5 flex flex-wrap gap-2">
        <Link href={href({ cat: "" })} className={clsx(chip(!cat), "!border-line")}>All skills</Link>
        {CATEGORIES.map((c) => <Link key={c.key} href={href({ cat: c.key })} className={chip(cat === c.key)}>{c.label}</Link>)}
        <Link href={href({ home: home ? "" : "1" })} className={clsx(chip(Boolean(home)), "ml-auto flex items-center gap-1.5")}><Home size={13} /> At home</Link>
      </div>

      {drills.length === 0 ? (
        <Empty title={src === "mine" ? "You haven't made a drill yet" : "No drills match"} href={staff && user.clubId ? "/drills/new" : undefined} cta="Create a drill">
          {staff ? "Design your own drill, film it on your phone, and add it to any player's plan." : "Try a different filter."}
        </Empty>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {drills.map((d) => {
            const coachMade = Boolean(d.createdById || d.clubId);
            return (
              <Link key={d.id} href={`/drills/${d.id}`} className="panel group flex flex-col p-5 transition hover:border-royal-soft">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-royal-soft">{SKILL_BY_KEY[d.skill]?.label}</p>
                    <h2 className="mt-0.5 text-lg font-bold">{d.name}</h2>
                  </div>
                  <Badge tone={d.difficulty === "Advanced" ? "red" : d.difficulty === "Developing" ? "orange" : "royal"}>{d.difficulty}</Badge>
                </div>
                <p className="mt-2 line-clamp-2 text-sm text-mute">{d.summary}</p>
                <div className="mt-auto flex flex-wrap items-center gap-x-4 gap-y-2 pt-4 text-xs text-mute">
                  {d.videoFile && <span className="flex items-center gap-1.5 font-bold text-volt"><PlayCircle size={14} /> Video</span>}
                  <span className="flex items-center gap-1.5"><Clock size={13} /> {d.minutes} min</span>
                  <span className="flex items-center gap-1.5">{d.atHome ? <Home size={13} /> : <Users size={13} />} {d.atHome ? "At home" : "With team"}</span>
                  {coachMade && (
                    <span className="ml-auto flex items-center gap-1.5 text-dim">
                      {d.visibility === "CLUB" ? <Users size={12} /> : <Lock size={12} />} {d.createdBy?.name ?? "Coach"}
                    </span>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
