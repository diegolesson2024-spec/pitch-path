import { requireUser } from "@/lib/auth";
import { getManageablePlayer } from "@/lib/access";
import { db } from "@/lib/db";
import { toScoreMap } from "@/lib/analytics";
import { suggestPlan } from "@/lib/recommend";
import { drillScope } from "@/lib/drills";
import { Empty, PageHeader } from "@/components/ui";
import { PlanEditor, type PlanDraft } from "./PlanEditor";

export const metadata = { title: "Development plan" };

const iso = (d: Date) => d.toLocaleDateString("en-CA");

export default async function PlanPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ suggest?: string }> }) {
  const { id } = await params;
  const { suggest } = await searchParams;
  const user = await requireUser(["ADMIN", "CLUB", "COACH"]);
  const player = await getManageablePlayer(user, id);

  const [latest, existing, drills] = await Promise.all([
    db.evaluation.findFirst({ where: { playerId: id }, orderBy: { date: "desc" }, include: { scores: true } }),
    db.developmentPlan.findFirst({
      where: { playerId: id, status: "ACTIVE" },
      include: { goals: { orderBy: { sortOrder: "asc" } }, drills: true },
      orderBy: { createdAt: "desc" },
    }),
    // Drills this coach may use, plus any already in the plan (e.g. another coach's private drill).
    db.drill.findMany({
      where: { OR: [drillScope(user), { planDrills: { some: { plan: { playerId: id, status: "ACTIVE" } } } }] },
      orderBy: [{ createdAt: "desc" }, { category: "asc" }, { name: "asc" }],
    }),
  ]);

  if (!latest) {
    return (
      <div className="mx-auto max-w-3xl">
        <PageHeader title="Development" accent="plan" />
        <Empty title="Evaluate first" href={`/players/${id}/evaluate`} cta="Start evaluation">
          Plans are built from an evaluation so every goal is tied to a real score.
        </Empty>
      </div>
    );
  }

  const scores = toScoreMap(latest.scores);
  const start = new Date();
  const end = new Date(Date.now() + 8 * 7 * 86_400_000);
  const suggestion = suggestPlan(scores, player.position, drills, player.firstName);

  const draft: PlanDraft =
    existing && !suggest
      ? {
          title: existing.title,
          primaryFocus: existing.primaryFocus,
          startDate: iso(existing.startDate),
          endDate: iso(existing.endDate),
          goals: existing.goals.map((g) => ({ skill: g.skill, description: g.description, metric: g.metric, baseline: g.baseline, target: g.target, current: g.current, unit: g.unit, weeklyTarget: g.weeklyTarget })),
          drills: existing.drills.map((d) => ({ drillId: d.drillId, perWeek: d.perWeek, coachNote: d.coachNote })),
        }
      : {
          title: suggestion.title,
          primaryFocus: suggestion.primaryFocus,
          startDate: iso(start),
          endDate: iso(end),
          goals: suggestion.goals.map((g) => ({ ...g, current: g.baseline })),
          drills: suggestion.drillIds.map((drillId) => ({ drillId, perWeek: 3, coachNote: "" })),
        };

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader eyebrow={`Based on ${latest.label}`} title={`${player.firstName}'s`} accent="development plan" />
      {(!existing || suggest) && (
        <p className="mb-5 rounded-xl border border-royal/40 bg-royal/10 p-4 text-sm">
          <span className="font-semibold">Suggested from the latest evaluation.</span>{" "}
          <span className="text-mute">PitchPath picked the lowest-scoring skills that matter most for a {player.position}. Review and change anything before saving.</span>
        </p>
      )}
      <PlanEditor
        playerId={player.id}
        firstName={player.firstName}
        position={player.position}
        scores={scores}
        initial={draft}
        drills={drills.map((d) => ({
          id: d.id,
          name: d.name,
          skill: d.skill,
          category: d.category,
          minutes: d.minutes,
          atHome: d.atHome,
          difficulty: d.difficulty,
          summary: d.summary,
          hasVideo: Boolean(d.videoFile),
          mine: d.createdById === user.id,
          coachMade: Boolean(d.createdById || d.clubId),
        }))}
        hasExisting={Boolean(existing)}
      />
    </div>
  );
}
