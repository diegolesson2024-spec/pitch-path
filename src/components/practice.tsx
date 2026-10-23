import Link from "next/link";
import clsx from "clsx";
import { Award, Check, Flame, Footprints, Lock, PlayCircle, Star, Target, Trophy, Zap } from "lucide-react";
import type { BadgeKey, Practice } from "@/lib/practice";
import { logDrill, undoDrill } from "@/app/(app)/practice/actions";
import { SubmitButton } from "./SubmitButton";

const BADGE_ICON: Record<BadgeKey, React.ComponentType<{ size?: number; className?: string }>> = {
  first: Footprints,
  streak3: Flame,
  streak7: Zap,
  week: Check,
  ten: Star,
  fifty: Trophy,
  goal: Target,
};

export function ProgressRing({ done, target, size = 120 }: { done: number; target: number; size?: number }) {
  const r = size / 2 - 9;
  const c = 2 * Math.PI * r;
  const pct = target ? Math.min(1, done / target) : 0;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img" aria-label={`${done} of ${target} drills done this week`}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="10" />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke={pct >= 1 ? "#34d399" : "#ff6a13"}
        strokeWidth="10"
        strokeLinecap="round"
        strokeDasharray={`${c * pct} ${c}`}
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
      />
      <text x="50%" y="48%" textAnchor="middle" fontSize={size * 0.24} fontWeight="800" fill="#eef1f8">{done}</text>
      <text x="50%" y="66%" textAnchor="middle" fontSize={size * 0.11} fill="#a3acc2">of {target}</text>
    </svg>
  );
}

export function WeekDots({ active, todayIndex }: { active: boolean[]; todayIndex: number }) {
  const labels = ["M", "T", "W", "T", "F", "S", "S"];
  return (
    <ol className="flex gap-1.5" aria-label="Days practised this week">
      {labels.map((l, i) => (
        <li key={i} className="flex flex-col items-center gap-1">
          <span
            className={clsx(
              "grid h-7 w-7 place-items-center rounded-full text-[0.65rem] font-bold",
              active[i] ? "bg-volt text-night" : "bg-white/[0.06] text-dim",
              i === todayIndex && !active[i] && "ring-1 ring-volt/60",
            )}
          >
            <span aria-hidden>{active[i] ? <Check size={13} strokeWidth={3} /> : l}</span>
            <span className="sr-only">{`${["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"][i]}: ${active[i] ? "practised" : "not yet"}`}</span>
          </span>
        </li>
      ))}
    </ol>
  );
}

export function StreakBadge({ streak, best }: { streak: number; best: number }) {
  return (
    <div className="flex items-center gap-3">
      <span className={clsx("grid h-11 w-11 place-items-center rounded-xl", streak ? "bg-volt/15 text-volt" : "bg-white/[0.06] text-dim")}>
        <Flame size={22} />
      </span>
      <div>
        <p className="num text-xl font-bold leading-tight">{streak} day{streak === 1 ? "" : "s"}</p>
        <p className="text-xs text-mute">streak · best {best}</p>
      </div>
    </div>
  );
}

export function BadgeShelf({ badges, size = "md" }: { badges: Practice["badges"]; size?: "sm" | "md" }) {
  return (
    <ul className={clsx("grid gap-3", size === "md" ? "grid-cols-3 sm:grid-cols-4 lg:grid-cols-7" : "grid-cols-4 sm:grid-cols-7")}>
      {badges.map((b) => {
        const Icon = BADGE_ICON[b.key];
        return (
          <li key={b.key} className="flex flex-col items-center gap-1.5 text-center" title={b.hint}>
            <span
              className={clsx(
                "relative grid place-items-center rounded-2xl",
                size === "md" ? "h-14 w-14" : "h-10 w-10",
                b.earned ? "bg-good/15 text-good" : "bg-white/[0.04] text-dim",
              )}
            >
              <Icon size={size === "md" ? 24 : 18} />
              {!b.earned && <Lock size={11} className="absolute -bottom-0.5 -right-0.5 text-dim" aria-hidden />}
            </span>
            <span className={clsx("text-[0.7rem] leading-tight", b.earned ? "font-semibold text-ink" : "text-dim")}>{b.label}</span>
            <span className="sr-only">{b.earned ? "Earned" : `Locked: ${b.hint}`}</span>
          </li>
        );
      })}
    </ul>
  );
}

// The week's drills with how many times each has been done and a button to log today.
export function DrillChecklist({ playerId, practice, kid = false }: { playerId: string; practice: Practice; kid?: boolean }) {
  if (practice.drills.length === 0) return <p className="text-sm text-mute">No drills in the plan yet.</p>;
  return (
    <ul className={clsx(kid ? "grid gap-3 sm:grid-cols-2" : "divide-y divide-line")}>
      {practice.drills.map((d) => {
        const weekDone = d.doneThisWeek >= d.perWeek;
        return (
          <li key={d.drillId} className={clsx(kid ? "panel-flat flex flex-col gap-3 p-4" : "flex items-center gap-3 py-3 first:pt-0 last:pb-0")}>
            <div className="flex min-w-0 flex-1 items-start gap-3">
              <div className="min-w-0 flex-1">
                <Link href={`/drills/${d.drillId}`} className={clsx("flex items-center gap-1.5 font-semibold hover:text-royal-soft", kid ? "text-base" : "text-sm")}>
                  <span className="truncate">{d.name}</span>
                  {d.hasVideo && <PlayCircle size={14} className="shrink-0 text-royal-soft" aria-label="Has video" />}
                </Link>
                <p className="mt-0.5 text-xs text-mute">{d.minutes} min · {d.doneThisWeek}/{d.perWeek} this week</p>
                <div className="mt-1.5 flex gap-1" aria-hidden>
                  {Array.from({ length: d.perWeek }, (_, i) => (
                    <span key={i} className={clsx("h-1.5 w-5 rounded-full", i < d.doneThisWeek ? "bg-good" : "bg-white/[0.08]")} />
                  ))}
                </div>
              </div>
            </div>
            <form action={d.doneToday ? undoDrill : logDrill} className="shrink-0">
              <input type="hidden" name="playerId" value={playerId} />
              <input type="hidden" name="drillId" value={d.drillId} />
              {d.doneToday ? (
                <SubmitButton className={clsx("flex items-center gap-1.5 rounded-full bg-good/15 font-semibold text-good", kid ? "w-full justify-center px-4 py-2.5 text-sm" : "px-3 py-1.5 text-xs")} title="Tap to undo">
                  <Check size={15} strokeWidth={3} /> Done today
                </SubmitButton>
              ) : (
                <SubmitButton className={clsx("btn", weekDone ? "btn-ghost" : "btn-primary", kid ? "w-full !py-2.5 !text-sm" : "!px-3 !py-1.5")}>
                  {kid ? (weekDone ? "Do it again" : "I did it!") : "Mark done"}
                </SubmitButton>
              )}
            </form>
          </li>
        );
      })}
    </ul>
  );
}

export function NewBadgeHint({ practice }: { practice: Practice }) {
  const next = practice.badges.find((b) => !b.earned);
  if (!next) return <p className="flex items-center gap-2 text-sm text-good"><Award size={16} /> Every badge earned. Legend!</p>;
  return <p className="text-sm text-mute">Next badge: <span className="font-semibold text-ink">{next.label}</span>. {next.hint}.</p>;
}
