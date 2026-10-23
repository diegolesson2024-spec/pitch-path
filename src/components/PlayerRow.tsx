import Link from "next/link";
import { ChevronRight } from "lucide-react";
import type { PlayerSummary } from "@/lib/summaries";
import { Avatar, Badge, Delta } from "./ui";

export function PlayerRow({ p, showTeam = false }: { p: PlayerSummary; showTeam?: boolean }) {
  const focus = p.lights.find((l) => l.level === "NEEDS_FOCUS");
  return (
    <Link
      href={`/players/${p.id}`}
      className="group -mx-2 flex items-center gap-3 rounded-lg px-2 py-2 transition hover:bg-white/[0.03]"
    >
      <Avatar first={p.firstName} last={p.lastName} hue={p.avatarHue} size={34} />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold">
          {p.firstName} {p.lastName}
        </p>
        <p className="truncate text-xs text-mute">
          {p.position}
          {showTeam && p.team ? ` · ${p.team.name}` : ""}
          {focus ? ` · focus: ${focus.label.toLowerCase()}` : ""}
        </p>
      </div>
      {p.evalDue && <Badge tone="warn">Eval due</Badge>}
      <div className="w-12 text-right">
        <p className="num text-base font-bold">{p.overall?.toFixed(1) ?? "–"}</p>
        {p.delta != null && <Delta value={p.delta} />}
      </div>
      <ChevronRight size={15} className="text-dim transition group-hover:text-ink" />
    </Link>
  );
}
