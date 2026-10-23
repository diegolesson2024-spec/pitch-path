"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import { LayoutDashboard, Users, Shield, Dumbbell, UserCog, ScrollText } from "lucide-react";

const ICONS = { dashboard: LayoutDashboard, players: Users, teams: Shield, drills: Dumbbell, people: UserCog, audit: ScrollText };
export type NavItem = { href: string; label: string; icon: keyof typeof ICONS };

export function NavLinks({ items, variant }: { items: NavItem[]; variant: "side" | "bottom" }) {
  const path = usePathname();
  return (
    <>
      {items.map((item) => {
        const Icon = ICONS[item.icon];
        const active = path === item.href || (item.href !== "/dashboard" && path.startsWith(item.href));
        return variant === "side" ? (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={clsx(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition",
              active ? "bg-white/[0.07] text-ink" : "text-mute hover:bg-white/[0.04] hover:text-ink",
            )}
          >
            <Icon size={17} className={active ? "text-volt" : undefined} />
            {item.label}
          </Link>
        ) : (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={clsx("flex min-w-16 flex-1 flex-col items-center gap-1 py-2 text-[0.68rem] font-medium", active ? "text-volt" : "text-mute")}
          >
            <Icon size={20} />
            {item.label}
          </Link>
        );
      })}
    </>
  );
}
