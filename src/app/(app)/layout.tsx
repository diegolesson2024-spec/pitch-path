import type { Metadata } from "next";
import Link from "next/link";
import { Bell, LogOut, UserRound } from "lucide-react";
import { Logo } from "@/components/Logo";
import { NavLinks, type NavItem } from "@/components/NavLinks";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { ensureWeeklyReminders } from "@/lib/reminders";
import { ROLE_LABEL } from "@/lib/skills";
import { logout } from "../login/actions";

export const dynamic = "force-dynamic";

// Signed-in pages are private: never index them.
export const metadata: Metadata = { robots: { index: false, follow: false } };

function BellLink({ unread }: { unread: number }) {
  return (
    <Link
      href="/notifications"
      className="relative grid h-9 w-9 place-items-center rounded-lg text-mute transition hover:bg-white/5 hover:text-ink"
      aria-label={unread ? `Notifications, ${unread} unread` : "Notifications"}
    >
      <Bell size={18} />
      {unread > 0 && (
        <span className="num absolute -right-0.5 -top-0.5 grid h-4 min-w-4 place-items-center rounded-full bg-volt px-1 text-[0.6rem] font-bold text-night">
          {unread > 9 ? "9+" : unread}
        </span>
      )}
    </Link>
  );
}

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();
  const staff = user.role === "ADMIN" || user.role === "CLUB" || user.role === "COACH";
  await ensureWeeklyReminders(user);
  const unread = await db.notification.count({ where: { userId: user.id, readAt: null } });

  const items: NavItem[] = [
    { href: "/dashboard", label: user.role === "PLAYER" ? "Home" : "Dashboard", icon: "dashboard" },
    ...(staff
      ? ([
          { href: "/players", label: "Players", icon: "players" },
          { href: "/teams", label: "Teams", icon: "teams" },
        ] as NavItem[])
      : []),
    { href: "/drills", label: "Drills", icon: "drills" },
    ...(user.role === "ADMIN" || user.role === "CLUB" ? ([{ href: "/people", label: "People", icon: "people" }] as NavItem[]) : []),
    ...(user.role === "ADMIN" || user.role === "CLUB" ? ([{ href: "/audit", label: "Audit", icon: "audit" }] as NavItem[]) : []),
  ];

  return (
    <div className="min-h-screen bg-night lg:grid lg:grid-cols-[232px_1fr]">
      <a href="#main" className="sr-only z-50 rounded-lg bg-volt px-4 py-2 font-semibold text-night focus:not-sr-only focus:fixed focus:left-4 focus:top-4">
        Skip to main content
      </a>
      <aside className="no-print sticky top-0 hidden h-screen flex-col border-r border-line bg-navy p-4 lg:flex">
        <div className="mb-8 flex items-center justify-between px-1 pt-1">
          <Link href="/dashboard"><Logo size={28} /></Link>
          <BellLink unread={unread} />
        </div>
        <nav className="flex flex-col gap-0.5"><NavLinks items={items} variant="side" /></nav>
        <div className="mt-auto border-t border-line px-1 pt-4">
          <p className="truncate text-sm font-semibold">{user.name}</p>
          <p className="truncate text-xs text-mute">{ROLE_LABEL[user.role]}{user.clubName ? ` · ${user.clubName}` : ""}</p>
          <div className="mt-3 flex items-center gap-4">
            <Link href="/account" className="flex items-center gap-2 text-xs font-semibold text-mute hover:text-ink">
              <UserRound size={14} /> Account
            </Link>
            <form action={logout}>
              <button className="flex items-center gap-2 text-xs font-semibold text-mute hover:text-ink">
                <LogOut size={14} /> Sign out
              </button>
            </form>
          </div>
        </div>
      </aside>

      <header className="no-print sticky top-0 z-20 flex items-center justify-between border-b border-line bg-night/95 px-4 py-2.5 backdrop-blur lg:hidden">
        <Link href="/dashboard"><Logo size={26} /></Link>
        <div className="flex items-center gap-1">
          <BellLink unread={unread} />
          <Link href="/account" className="grid h-9 w-9 place-items-center rounded-lg text-mute hover:text-ink" aria-label="Account">
            <UserRound size={18} />
          </Link>
          <form action={logout}>
            <button className="grid h-9 w-9 place-items-center rounded-lg text-mute hover:text-ink" aria-label="Sign out">
              <LogOut size={17} />
            </button>
          </form>
        </div>
      </header>

      <main id="main" tabIndex={-1} className="min-w-0 px-4 pb-28 pt-6 outline-none md:px-8 lg:pb-12 lg:pt-10">{children}</main>

      <nav className="no-print fixed inset-x-0 bottom-0 z-20 flex border-t border-line bg-navy/95 px-1 backdrop-blur lg:hidden">
        <NavLinks items={items} variant="bottom" />
      </nav>
    </div>
  );
}
