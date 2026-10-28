import Link from "next/link";
import { Logo } from "@/components/Logo";
import { SiteFooter } from "@/components/SiteFooter";

// Shared layout for the Privacy Policy and Terms pages.
export function LegalPage({ title, updated, children }: { title: string; updated: string; children: React.ReactNode }) {
  return (
    <div className="min-h-screen">
      <header className="border-b border-line">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-4">
          <Link href="/" aria-label="PitchPath home"><Logo size={28} /></Link>
          <Link href="/login" className="text-sm font-semibold text-royal-soft hover:underline">Sign in</Link>
        </div>
      </header>
      <main className="mx-auto max-w-3xl px-4 py-10">
        <h1 className="display text-4xl md:text-5xl">{title}</h1>
        <p className="mt-2 text-sm text-mute">Last updated {updated}</p>
        <div className="mt-8 space-y-4 text-[0.95rem] leading-relaxed text-ink/90 [&_a]:font-semibold [&_a]:text-royal-soft [&_a:hover]:underline [&_h2]:pt-4 [&_h2]:text-xl [&_h2]:font-bold [&_li]:ml-5 [&_li]:list-disc [&_ul]:space-y-1.5">
          {children}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
