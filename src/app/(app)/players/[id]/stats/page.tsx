import { requireUser } from "@/lib/auth";
import { getManageablePlayer } from "@/lib/access";
import { PageHeader } from "@/components/ui";
import { StatLogger } from "./StatLogger";

export const metadata = { title: "Log match" };

export default async function StatsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await requireUser(["ADMIN", "CLUB", "COACH"]);
  const player = await getManageablePlayer(user, id);
  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader eyebrow={`${player.team?.name ?? ""} · ${player.position}`} title={`Match stats ·`} accent={`${player.firstName} ${player.lastName}`} />
      <StatLogger playerId={player.id} today={new Date().toLocaleDateString("en-CA")} />
    </div>
  );
}
