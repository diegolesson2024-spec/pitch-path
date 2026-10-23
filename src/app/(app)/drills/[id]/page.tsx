import Link from "next/link";
import { notFound } from "next/navigation";
import { Clock, Home, Users, Lock, Pencil, Package, type LucideIcon } from "lucide-react";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { canEditDrill, getVisibleDrill } from "@/lib/drills";
import { SKILL_BY_KEY } from "@/lib/skills";
import { fmtDate } from "@/lib/format";
import { Badge, Card } from "@/components/ui";
import { DeleteDrillButton } from "./DeleteDrillButton";

export const metadata = { title: "Drill" };

export default async function DrillPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await requireUser();
  const drill = await getVisibleDrill(user, id);
  if (!drill) notFound();
  const editable = canEditDrill(user, drill);
  const usedIn = editable ? await db.planDrill.count({ where: { drillId: id, plan: { status: "ACTIVE" } } }) : 0;
  const coachMade = Boolean(drill.createdById || drill.clubId);

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="eyebrow mb-2">{SKILL_BY_KEY[drill.skill]?.label} · {drill.difficulty}</p>
          <h1 className="display text-4xl md:text-5xl">{drill.name}</h1>
          <div className="mt-3 flex flex-wrap gap-2">
            {coachMade ? (
              <Badge tone="orange">By {drill.createdBy?.name ?? "a coach"}</Badge>
            ) : (
              <Badge tone="royal">PitchPath library</Badge>
            )}
            {coachMade && (drill.visibility === "CLUB" ? <Badge tone="royal">Shared with club</Badge> : <Badge>Private</Badge>)}
          </div>
        </div>
        {editable && (
          <div className="flex gap-2">
            <Link href={`/drills/${drill.id}/edit`} className="btn btn-royal"><Pencil size={15} /> Edit</Link>
            <DeleteDrillButton id={drill.id} usedIn={usedIn} />
          </div>
        )}
      </div>

      <div className="grid gap-5 lg:grid-cols-[1.4fr_1fr]">
        <div className="space-y-5">
          {drill.videoFile ? (
            <video
              src={`/api/drill-videos/${drill.id}`}
              controls
              playsInline
              preload="metadata"
              controlsList="nodownload"
              className="aspect-video w-full rounded-[var(--radius-card)] border border-line bg-black"
            />
          ) : (
            coachMade && editable && (
              <Link href={`/drills/${drill.id}/edit`} className="panel-flat flex aspect-video items-center justify-center text-sm text-mute hover:text-volt">
                No video yet. Add one so players can see the drill.
              </Link>
            )
          )}
          <Card title="How to do it" tone="orange">
            <p className="mb-3 text-mute">{drill.summary}</p>
            <p className="whitespace-pre-line leading-relaxed">{drill.instructions}</p>
          </Card>
        </div>
        <Card title="At a glance" tone="royal" className="h-fit">
          <dl className="space-y-3 text-sm">
            <Row icon={Clock} label="Time" value={`${drill.minutes} minutes`} />
            <Row icon={drill.atHome ? Home : Users} label="Where" value={drill.atHome ? "At home or with the team" : "With the team"} />
            <Row icon={Package} label="Equipment" value={drill.equipment || "None"} />
            {coachMade && <Row icon={drill.visibility === "CLUB" ? Users : Lock} label="Visibility" value={drill.visibility === "CLUB" ? "Coaches at your club" : "Only the creator (and players it's assigned to)"} />}
            {coachMade && <Row icon={Pencil} label="Updated" value={fmtDate(drill.updatedAt)} />}
          </dl>
          {editable && usedIn > 0 && <p className="mt-4 text-xs text-mute">In {usedIn} active development plan{usedIn > 1 ? "s" : ""}.</p>}
        </Card>
      </div>
    </div>
  );
}

function Row({ icon: Icon, label, value }: { icon: LucideIcon; label: string; value: string }) {
  return (
    <div>
      <dt className="flex items-center gap-2 text-xs text-mute">
        <Icon size={14} className="shrink-0 text-royal-soft" aria-hidden />
        {label}
      </dt>
      <dd className="mt-0.5 pl-6">{value}</dd>
    </div>
  );
}
