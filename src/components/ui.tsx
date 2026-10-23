import clsx from "clsx";
import Link from "next/link";

// royal = interactive/info, orange = brand, good/warn/red = status, mute = neutral.
type Tone = "royal" | "orange" | "red" | "good" | "warn" | "mute";

export function Card({
  title,
  action,
  className,
  bodyClassName,
  children,
}: {
  title?: React.ReactNode;
  /** @deprecated Section titles are neutral; kept so existing callers compile. */
  tone?: Tone;
  action?: React.ReactNode;
  className?: string;
  bodyClassName?: string;
  children: React.ReactNode;
}) {
  return (
    <section className={clsx("panel p-5 md:p-6", className)}>
      {(title || action) && (
        <header className="mb-4 flex items-center justify-between gap-3">
          {title && <h2 className="text-[0.95rem] font-bold text-ink">{title}</h2>}
          {action && <div className="text-xs text-mute">{action}</div>}
        </header>
      )}
      <div className={bodyClassName}>{children}</div>
    </section>
  );
}

export function PageHeader({
  eyebrow,
  title,
  accent,
  children,
}: {
  eyebrow?: string;
  title: string;
  accent?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div>
        {eyebrow && <p className="eyebrow mb-2">{eyebrow}</p>}
        <h1 className="display text-4xl md:text-5xl">
          {title} {accent && <span className="text-volt">{accent}</span>}
        </h1>
      </div>
      {children && <div className="no-print flex flex-wrap gap-2">{children}</div>}
    </div>
  );
}

const BADGE: Record<Tone, string> = {
  royal: "bg-royal/15 text-royal-soft",
  orange: "bg-volt/15 text-volt-soft",
  red: "bg-alert/15 text-alert",
  good: "bg-good/15 text-good",
  warn: "bg-warn/15 text-warn",
  mute: "bg-white/[0.06] text-mute",
};

export function Badge({ tone = "mute", children }: { tone?: Tone; children: React.ReactNode }) {
  return (
    <span className={clsx("inline-flex items-center rounded-md px-2 py-0.5 text-[0.68rem] font-semibold", BADGE[tone])}>
      {children}
    </span>
  );
}

const TEXT: Partial<Record<Tone, string>> = { orange: "text-volt", royal: "text-royal-soft", good: "text-good", warn: "text-warn", red: "text-alert" };

export function Stat({ label, value, sub, tone }: { label: string; value: React.ReactNode; sub?: React.ReactNode; tone?: Tone }) {
  return (
    <div className="panel-flat px-4 py-3">
      <p className="text-xs text-mute">{label}</p>
      <p className={clsx("num mt-1 text-2xl font-bold", tone && TEXT[tone])}>{value}</p>
      {sub && <p className="mt-0.5 text-xs text-dim">{sub}</p>}
    </div>
  );
}

export function Avatar({ first, last, hue = 220, size = 40 }: { first: string; last: string; hue?: number; size?: number }) {
  return (
    <span
      className="inline-flex shrink-0 items-center justify-center rounded-xl font-display font-bold italic text-white"
      style={{ width: size, height: size, fontSize: size * 0.38, background: `hsl(${hue} 55% 33%)` }}
      aria-hidden
    >
      {first[0]}
      {last[0]}
    </span>
  );
}

const BAR: Record<Tone, string> = { royal: "bg-royal", orange: "bg-volt", red: "bg-alert", good: "bg-good", warn: "bg-warn", mute: "bg-dim" };

export function Bar({ value, max = 1, tone = "royal", className }: { value: number; max?: number; tone?: Tone; className?: string }) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  return (
    <div className={clsx("h-1.5 w-full overflow-hidden rounded-full bg-white/[0.07]", className)}>
      <div className={clsx("h-full rounded-full", BAR[tone])} style={{ width: `${pct}%` }} />
    </div>
  );
}

export function Delta({ value }: { value: number }) {
  if (value === 0) return <span className="num text-xs text-dim">±0</span>;
  return (
    <span className={clsx("num text-xs font-semibold", value > 0 ? "text-good" : "text-alert")}>
      {value > 0 ? "▲" : "▼"} {Math.abs(value).toFixed(Number.isInteger(value) ? 0 : 1)}
    </span>
  );
}

export function Empty({ title, children, href, cta }: { title: string; children?: React.ReactNode; href?: string; cta?: string }) {
  return (
    <div className="panel-flat flex flex-col items-center gap-2 px-6 py-10 text-center">
      <p className="font-semibold">{title}</p>
      {children && <p className="max-w-sm text-sm text-mute">{children}</p>}
      {href && cta && (
        <Link href={href} className="btn btn-royal mt-3">
          {cta}
        </Link>
      )}
    </div>
  );
}
