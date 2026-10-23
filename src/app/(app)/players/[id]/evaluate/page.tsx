import { requireUser } from "@/lib/auth";
import { getManageablePlayer } from "@/lib/access";
import { db } from "@/lib/db";
import { toScoreMap } from "@/lib/analytics";
import { PageHeader } from "@/components/ui";
import { EvaluationForm } from "./EvaluationForm";

export const metadata = { title: "New evaluation" };

export default async function EvaluatePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await requireUser(["ADMIN", "CLUB", "COACH"]);
  const player = await getManageablePlayer(user, id);
  const last = await db.evaluation.findFirst({ where: { playerId: id }, orderBy: { date: "desc" }, include: { scores: true } });

  const today = new Date();
  const month = today.toLocaleDateString("en-GB", { month: "long" });

  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader eyebrow={`${player.team?.name ?? ""} · ${player.position}`} title={`Evaluate ${player.firstName}`} accent={player.lastName} />
      <EvaluationForm
        playerId={player.id}
        firstName={player.firstName}
        previous={last ? toScoreMap(last.scores) : null}
        previousLabel={last?.label ?? null}
        defaultLabel={`${month} review ${today.getFullYear()}`}
        defaultDate={today.toLocaleDateString("en-CA")}
      />
    </div>
  );
}
