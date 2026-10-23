import Link from "next/link";
import {
  ArrowRight,
  ClipboardCheck,
  Target,
  TrendingUp,
  ShieldCheck,
  Lock,
  UserCheck,
  ScrollText,
  EyeOff,
  FileText,
  Home,
  Building2,
  Heart,
  Shirt,
  CheckCircle2,
} from "lucide-react";
import { Logo } from "@/components/Logo";
import { HeroPreview, ProgressPreview, StaticRadar } from "@/components/marketing/Previews";

const STEPS = [
  {
    n: "01",
    icon: ClipboardCheck,
    title: "Evaluate",
    body: "Score 20 skills across technical, tactical, physical and mental pillars in about ten minutes. Previous scores sit right beside the sliders.",
  },
  {
    n: "02",
    icon: Target,
    title: "Plan",
    body: "PitchPath suggests measurable goals and matching drills from the evaluation and the player's position. You review, tweak and publish.",
  },
  {
    n: "03",
    icon: TrendingUp,
    title: "Improve",
    body: "Players get home drills with clear instructions and weekly targets. Families check in, coaches track progress, and the charts show the growth.",
  },
];

const ROLES = [
  {
    icon: ClipboardCheck,
    who: "Coaches",
    line: "Less admin, better conversations.",
    points: ["Fast slider evaluations with history", "Auto-suggested plans you can edit", "Match stats and attendance in a tap", "One-click PDF reports"],
  },
  {
    icon: Building2,
    who: "Clubs",
    line: "One standard across every team.",
    points: ["Teams, coaches and permissions", "Evaluation coverage at a glance", "Top improvers and players at risk", "Audit log for safeguarding"],
  },
  {
    icon: Heart,
    who: "Parents",
    line: "Finally know how to help.",
    points: ["Plain-English feedback from the coach", "Progress you can actually see", "Drills to do together at home", "Secure, invite-only access"],
  },
  {
    icon: Shirt,
    who: "Players",
    line: "Know exactly what to work on.",
    points: ["Your strengths and your next step", "Goals with real numbers to beat", "Weekly check-ins with your coach", "Watch your Performance DNA grow"],
  },
];

const SAFE = [
  { icon: Lock, title: "Role-based access", body: "Coaches only see their teams. Clubs only see their club. Families only see their own child." },
  { icon: UserCheck, title: "Guardian consent", body: "Consent is recorded before a player gets their own login or data is shared beyond staff." },
  { icon: ShieldCheck, title: "Invite-only families", body: "Parents join through one-time links that expire after seven days. There's no public sign-up." },
  { icon: EyeOff, title: "Staff-only notes", body: "Sensitive notes stay with coaches. Families see published feedback only." },
  { icon: ScrollText, title: "Full audit trail", body: "Every invite, report download, evaluation and access change is logged." },
  { icon: FileText, title: "Private reports", body: "PDF reports are generated on request for signed-in, authorised users only. No public links." },
];

export const metadata = { alternates: { canonical: "/" } };

export default function LandingPage() {
  return (
    <div className="overflow-x-clip">
      <a href="#main" className="sr-only z-50 rounded-lg bg-volt px-4 py-2 font-semibold text-night focus:not-sr-only focus:fixed focus:left-4 focus:top-4">
        Skip to main content
      </a>
      {/* Nav */}
      <header className="sticky top-0 z-30 border-b border-line bg-night/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 md:px-8">
          <Link href="/" aria-label="PitchPath home"><Logo /></Link>
          <nav className="hidden items-center gap-7 text-sm font-semibold text-mute md:flex">
            <a href="#how" className="hover:text-ink">How it works</a>
            <a href="#roles" className="hover:text-ink">Who it&apos;s for</a>
            <a href="#safeguarding" className="hover:text-ink">Safeguarding</a>
          </nav>
          <div className="flex items-center gap-2">
            <Link href="/login" className="btn btn-ghost hidden sm:inline-flex">Sign in</Link>
            <Link href="/login" className="btn btn-primary">Live demo</Link>
          </div>
        </div>
      </header>

      <main id="main">
      {/* Hero */}
      <section className="pitch-grid relative">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(50%_60%_at_15%_20%,rgba(47,91,255,0.28),transparent),radial-gradient(35%_45%_at_85%_70%,rgba(255,106,19,0.14),transparent)]" />
        <div className="relative mx-auto grid max-w-7xl items-center gap-16 px-4 pb-24 pt-14 md:px-8 lg:grid-cols-[1fr_1.05fr] lg:pb-32 lg:pt-20">
          <div>
            <p className="mb-5 inline-flex items-center gap-2 rounded-full border border-volt/40 bg-volt/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.14em] text-volt-soft">
              <span className="dot bg-volt" /> Player development platform
            </p>
            <h1 className="display text-[3.4rem] sm:text-7xl xl:text-[5.6rem]">
              Every player <br />deserves a <span className="text-volt">plan.</span>
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-mute md:text-xl">
              PitchPath turns coach evaluations into clear feedback, measurable goals and home drills. Every young player knows <span className="text-ink">what they&apos;re good at, what to improve, and how to improve it.</span>
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/login" className="btn btn-primary !px-6 !py-3.5 !text-sm">Try the live demo <ArrowRight size={16} /></Link>
              <a href="#how" className="btn btn-ghost !px-6 !py-3.5 !text-sm">See how it works</a>
            </div>
            <dl className="mt-10 grid max-w-lg grid-cols-4 gap-4 border-t border-line pt-6">
              {[["20", "skills scored"], ["4", "pillars"], ["34", "drills"], ["1", "click PDF reports"]].map(([n, l]) => (
                <div key={l}>
                  <dt className="display num text-3xl not-italic">{n}</dt>
                  <dd className="text-xs text-mute">{l}</dd>
                </div>
              ))}
            </dl>
          </div>
          <HeroPreview />
        </div>
      </section>

      {/* Promise strip */}
      <section className="border-y border-line bg-navy/60">
        <div className="mx-auto grid max-w-7xl gap-6 px-4 py-10 md:grid-cols-[1fr_auto_1fr] md:items-center md:px-8">
          <p className="text-lg text-mute md:text-right">Most young players hear <span className="text-ink">&ldquo;well done&rdquo;</span> or <span className="text-ink">&ldquo;work harder&rdquo;</span>.</p>
          <ArrowRight className="mx-auto hidden text-volt md:block" />
          <p className="text-lg font-semibold">PitchPath tells them <span className="text-volt">exactly what to work on next</span>, and shows them it&apos;s working.</p>
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="mx-auto max-w-7xl scroll-mt-20 px-4 py-24 md:px-8">
        <p className="eyebrow mb-3 !text-volt">How it works</p>
        <h2 className="display max-w-3xl text-5xl md:text-6xl">From evaluation to improvement in three steps</h2>
        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {STEPS.map((s) => (
            <article key={s.n} className="panel group relative overflow-hidden p-7">
              {/* Decorative watermark drawn with CSS content so it isn't page text. */}
              <span aria-hidden data-n={s.n} className="display absolute -right-2 -top-4 text-[7rem] text-white/[0.04] transition before:content-[attr(data-n)] group-hover:text-volt/10" />
              <span className="grid h-12 w-12 place-items-center rounded-2xl bg-royal text-white shadow-[0_12px_30px_-10px_#2f5bff]"><s.icon size={22} /></span>
              <h3 className="display mt-6 text-3xl">{s.title}</h3>
              <p className="mt-3 leading-relaxed text-mute">{s.body}</p>
            </article>
          ))}
        </div>
      </section>

      {/* Feature spotlight */}
      <section className="mx-auto max-w-7xl px-4 pb-24 md:px-8">
        <div className="grid gap-5 lg:grid-cols-3">
          <article className="panel p-7 lg:col-span-2">
            <div className="grid items-center gap-8 md:grid-cols-2">
              <div>
                <p className="eyebrow mb-3 !text-volt">Performance DNA</p>
                <h3 className="display text-4xl">See the whole player at a glance</h3>
                <p className="mt-3 text-mute">Pace, shooting, passing, dribbling, defending and physical, built from twenty coach-scored skills. The dashed line shows where they were last time.</p>
                <ul className="mt-5 space-y-2 text-sm">
                  {["Traffic lights flag strengths and focus areas", "Position-aware recommendations", "Side-by-side comparison with previous evaluations"].map((x) => (
                    <li key={x} className="flex gap-2"><CheckCircle2 size={17} className="shrink-0 text-royal-soft" /> {x}</li>
                  ))}
                </ul>
              </div>
              <div className="mx-auto aspect-square w-full max-w-[300px]"><StaticRadar size={260} /></div>
            </div>
          </article>
          <article className="panel flex flex-col p-7">
            <p className="eyebrow mb-3 !text-volt">Progress tracking</p>
            <h3 className="display text-4xl">Growth you can prove</h3>
            <p className="mt-3 text-mute">Every evaluation, match and session adds to the story.</p>
            <div className="mt-auto pt-6"><ProgressPreview /></div>
          </article>
          <article className="panel p-7">
            <span className="grid h-11 w-11 place-items-center rounded-xl bg-volt/15 text-volt"><Home size={20} /></span>
            <h3 className="display mt-5 text-3xl">Drills they&apos;ll actually do</h3>
            <p className="mt-2 text-mute">Short, clear, equipment-light drills matched to each goal, with weekly targets and check-ins.</p>
          </article>
          <article className="panel p-7">
            <span className="grid h-11 w-11 place-items-center rounded-xl bg-royal/20 text-royal-soft"><FileText size={20} /></span>
            <h3 className="display mt-5 text-3xl">Reports parents keep</h3>
            <p className="mt-2 text-mute">Branded PDF report cards with scores, charts, coach comments and the full development plan.</p>
          </article>
          <article className="panel p-7">
            <span className="grid h-11 w-11 place-items-center rounded-xl bg-white/10"><TrendingUp size={20} /></span>
            <h3 className="display mt-5 text-3xl">Match stats & attendance</h3>
            <p className="mt-2 text-mute">Log goals, passes, tackles and attendance from the touchline on any phone or tablet.</p>
          </article>
        </div>
      </section>

      {/* Roles */}
      <section id="roles" className="scroll-mt-20 border-y border-line bg-navy/50">
        <div className="mx-auto max-w-7xl px-4 py-24 md:px-8">
          <p className="eyebrow mb-3 !text-volt">Who it&apos;s for</p>
          <h2 className="display max-w-3xl text-5xl md:text-6xl">One platform, four points of view</h2>
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {ROLES.map((r) => (
              <article key={r.who} className="panel flex flex-col p-6">
                <r.icon size={26} className="text-volt" />
                <h3 className="display mt-5 text-3xl">{r.who}</h3>
                <p className="mt-1 font-semibold text-royal-soft">{r.line}</p>
                <ul className="mt-5 space-y-2.5 text-sm text-mute">
                  {r.points.map((p) => <li key={p} className="flex gap-2"><span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-volt" />{p}</li>)}
                </ul>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Safeguarding */}
      <section id="safeguarding" className="mx-auto max-w-7xl scroll-mt-20 px-4 py-24 md:px-8">
        <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <p className="eyebrow mb-3 !text-volt">Safeguarding first</p>
            <h2 className="display text-5xl md:text-6xl">Built for <span className="text-volt">minors&apos;</span> data</h2>
            <p className="mt-5 text-lg text-mute">Youth player data deserves more care than a shared spreadsheet. PitchPath is designed so the right people see the right profile, and nobody else.</p>
            <Link href="/login" className="btn btn-royal mt-8">Explore the permissions in the demo <ArrowRight size={15} /></Link>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {SAFE.map((s) => (
              <div key={s.title} className="panel-flat p-5">
                <s.icon size={20} className="text-royal-soft" />
                <p className="mt-3 font-bold">{s.title}</p>
                <p className="mt-1 text-sm text-mute">{s.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="px-4 pb-24 md:px-8">
        <div className="relative mx-auto max-w-7xl overflow-hidden rounded-[2rem] bg-royal px-6 py-16 text-center md:py-20">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_80%_at_80%_100%,rgba(255,106,19,0.55),transparent),radial-gradient(40%_60%_at_10%_0%,rgba(255,255,255,0.18),transparent)]" />
          <div className="relative">
            <h2 className="display text-5xl md:text-7xl">Give every player <br className="hidden sm:block" />a path.</h2>
            <p className="mx-auto mt-4 max-w-xl text-lg text-white/80">Explore the full demo as a coach, club director, parent or player. No sign-up needed.</p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Link href="/login" className="btn !bg-white !px-6 !py-3.5 !text-sm !text-night hover:!bg-ink">Try the live demo <ArrowRight size={16} /></Link>
              <a href="#how" className="btn border border-white/40 !px-6 !py-3.5 !text-sm text-white hover:bg-white/10">How it works</a>
            </div>
          </div>
        </div>
      </section>

      </main>

      <footer className="border-t border-line">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 py-8 text-sm text-mute md:flex-row md:px-8">
          <Logo size={26} />
          <p>Demo data only. All players, clubs and people shown are fictional.</p>
          <p>© {new Date().getFullYear()} PitchPath</p>
        </div>
      </footer>
    </div>
  );
}
