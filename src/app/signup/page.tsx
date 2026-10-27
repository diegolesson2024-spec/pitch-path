import Link from "next/link";
import { redirect } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import { Logo } from "@/components/Logo";
import { getCurrentUser } from "@/lib/auth";
import { SignupForm } from "./SignupForm";

export const metadata = {
  title: "Create account",
  description: "Create a free PitchPath account for your club and start evaluating players, building development plans and tracking progress.",
  alternates: { canonical: "/signup" },
};

const PERKS = [
  "Your own private club space",
  "Add teams, coaches and players",
  "Evaluations, plans and PDF reports",
  "Invite parents when you're ready",
];

export default async function SignupPage() {
  if (await getCurrentUser()) redirect("/dashboard");

  return (
    <main className="pitch-grid relative grid min-h-screen lg:grid-cols-[1fr_1.1fr]">
      <section className="relative flex flex-col justify-between p-6 md:p-12">
        <Link href="/" aria-label="PitchPath home"><Logo /></Link>
        <div className="my-12 max-w-md">
          <p className="eyebrow mb-4 !text-volt">For clubs and coaches</p>
          <h1 className="display text-5xl md:text-6xl">
            Give every player <span className="text-volt">a path.</span>
          </h1>
          <ul className="mt-8 space-y-3">
            {PERKS.map((p) => (
              <li key={p} className="flex items-center gap-3 text-mute">
                <CheckCircle2 size={18} className="shrink-0 text-good" aria-hidden /> {p}
              </li>
            ))}
          </ul>
        </div>
        <p className="text-xs text-dim">Parents and players join through an invite from their coach.</p>
      </section>

      <section className="relative flex items-center justify-center p-4 md:p-12">
        <div className="panel w-full max-w-lg p-6 md:p-8">
          <h2 className="display text-3xl">Create your account</h2>
          <p className="mb-6 mt-1 text-sm text-mute">
            Set up your club in a minute. You&apos;ll be its administrator and can add coaches afterwards.
          </p>
          <SignupForm />
          <p className="mt-6 text-center text-sm text-mute">
            Already have an account?{" "}
            <Link href="/login" className="font-semibold text-royal-soft hover:underline">Sign in</Link>
          </p>
        </div>
      </section>
    </main>
  );
}
