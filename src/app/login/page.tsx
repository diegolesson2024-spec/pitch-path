import Link from "next/link";
import { redirect } from "next/navigation";
import { ClipboardCheck, Building2, Heart, ShieldCheck, Shirt } from "lucide-react";
import { Logo } from "@/components/Logo";
import { getCurrentUser } from "@/lib/auth";
import { LoginForm } from "./LoginForm";
import { demoLogin } from "./actions";

export const metadata = {
  title: "Sign in",
  description: "Sign in to PitchPath to see evaluations, development plans and progress for your players.",
  alternates: { canonical: "/login" },
};

const DEMO_ROLES = [
  { role: "COACH", label: "Coach", who: "Jordan Reyes · U14 & U12", icon: ClipboardCheck },
  { role: "PARENT", label: "Parent", who: "Claire Bennett · 2 children", icon: Heart },
  { role: "PLAYER", label: "Player", who: "Maya Bennett · age 12, U12 Lions", icon: Shirt },
  { role: "CLUB", label: "Club director", who: "Sam Okafor · Riverside Athletic", icon: Building2 },
  { role: "ADMIN", label: "Platform admin", who: "Morgan Ellis · all clubs", icon: ShieldCheck },
];

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  if (await getCurrentUser()) redirect("/dashboard");
  const { next } = await searchParams;
  const demo = process.env.DEMO_MODE === "true";

  return (
    <main className="pitch-grid relative grid min-h-screen lg:grid-cols-[1.1fr_1fr]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_50%_at_20%_10%,rgba(47,91,255,0.25),transparent),radial-gradient(40%_40%_at_90%_90%,rgba(255,106,19,0.12),transparent)]" />

      <section className="relative flex flex-col justify-between p-6 md:p-12">
        <Link href="/" aria-label="PitchPath home"><Logo /></Link>
        <div className="my-12 max-w-lg">
          <p className="eyebrow mb-4 !text-volt">Player development platform</p>
          <h1 className="display text-5xl md:text-7xl">
            Know what <br />to work on <span className="text-volt">next.</span>
          </h1>
          <p className="mt-5 max-w-md text-lg text-mute">
            Evaluations, personal development plans and progress tracking for coaches, clubs, players and parents.
          </p>
        </div>
        <p className="text-xs text-dim">Player data is private to the club, the coaches and the family it belongs to.</p>
      </section>

      <section className="relative flex items-center justify-center p-4 md:p-12">
        <div className="panel w-full max-w-md p-6 md:p-8">
          <h2 className="display text-3xl">Sign in</h2>
          <p className="mb-6 mt-1 text-sm text-mute">Use the account your club or coach set up for you.</p>
          <LoginForm next={next} />
          <p className="mt-5 text-center text-sm text-mute">
            New here?{" "}
            <Link href="/signup" className="font-semibold text-royal-soft hover:underline">Create an account</Link>
          </p>

          {demo && (
            <div className="mt-8 border-t border-line pt-6">
              <p className="eyebrow mb-3">Explore the demo as…</p>
              <div className="grid gap-2">
                {DEMO_ROLES.map(({ role, label, who, icon: Icon }) => (
                  <form key={role} action={demoLogin}>
                    <input type="hidden" name="role" value={role} />
                    <button className="group flex w-full items-center gap-3 rounded-xl border border-line bg-white/[0.02] px-3 py-2.5 text-left transition hover:border-royal-soft hover:bg-royal/10">
                      <span className="grid h-9 w-9 place-items-center rounded-lg bg-royal/15 text-royal-soft group-hover:bg-volt group-hover:text-night">
                        <Icon size={18} />
                      </span>
                      <span className="flex-1">
                        <span className="block text-sm font-bold">{label}</span>
                        <span className="block text-xs text-mute">{who}</span>
                      </span>
                      <span className="text-xs font-bold uppercase tracking-wider text-dim group-hover:text-volt">Enter →</span>
                    </button>
                  </form>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
