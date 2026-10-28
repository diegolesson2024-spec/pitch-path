import Link from "next/link";
import { Logo } from "@/components/Logo";
import { CONTACT_EMAIL } from "@/lib/site";

export function SiteFooter({ note }: { note?: string }) {
  return (
    <footer className="border-t border-line">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 py-8 text-sm text-mute md:flex-row md:px-8">
        <Logo size={26} />
        <nav aria-label="Footer" className="flex flex-wrap justify-center gap-x-5 gap-y-2">
          <Link href="/privacy" className="hover:text-ink">Privacy</Link>
          <Link href="/terms" className="hover:text-ink">Terms</Link>
          <a href={`mailto:${CONTACT_EMAIL}`} className="hover:text-ink">Contact: {CONTACT_EMAIL}</a>
        </nav>
        <p>© {new Date().getFullYear()} PitchPath</p>
      </div>
      {note && <p className="px-4 pb-6 text-center text-xs text-dim">{note}</p>}
    </footer>
  );
}
