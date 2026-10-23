import clsx from "clsx";
import { Award, Bell, ClipboardCheck, MessageSquare, Target, AlarmClock } from "lucide-react";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { fmtShort } from "@/lib/format";
import { Empty, PageHeader } from "@/components/ui";
import { markAllRead, openNotification } from "./actions";

export const metadata = { title: "Notifications" };

const KIND = {
  EVALUATION: { icon: ClipboardCheck, color: "text-royal-soft bg-royal/15" },
  PLAN: { icon: Target, color: "text-volt bg-volt/15" },
  NOTE: { icon: MessageSquare, color: "text-royal-soft bg-royal/15" },
  REMINDER: { icon: AlarmClock, color: "text-warn bg-warn/15" },
  BADGE: { icon: Award, color: "text-good bg-good/15" },
} as const;

export default async function NotificationsPage() {
  const user = await requireUser();
  const items = await db.notification.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" }, take: 60 });
  const unread = items.filter((n) => !n.readAt).length;

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader eyebrow={unread ? `${unread} unread` : "All caught up"} title="Notifications">
        {unread > 0 && (
          <form action={markAllRead}>
            <button className="btn btn-ghost">Mark all read</button>
          </form>
        )}
      </PageHeader>

      {items.length === 0 ? (
        <Empty title="Nothing yet">You&apos;ll hear here when your coach publishes an evaluation, a plan or a note.</Empty>
      ) : (
        <ul className="panel divide-y divide-line overflow-hidden">
          {items.map((n) => {
            const k = KIND[n.kind as keyof typeof KIND] ?? { icon: Bell, color: "text-mute bg-white/5" };
            return (
              <li key={n.id}>
                <form action={openNotification}>
                  <input type="hidden" name="id" value={n.id} />
                  <button className={clsx("flex w-full items-start gap-4 px-5 py-4 text-left transition hover:bg-white/[0.03]", !n.readAt && "bg-royal/[0.05]")}>
                    <span className={clsx("grid h-9 w-9 shrink-0 place-items-center rounded-lg", k.color)}><k.icon size={17} /></span>
                    <span className="min-w-0 flex-1">
                      <span className={clsx("block text-sm", n.readAt ? "text-ink/80" : "font-semibold")}>{n.title}</span>
                      {n.body && <span className="mt-0.5 block text-sm text-mute">{n.body}</span>}
                    </span>
                    <span className="flex shrink-0 items-center gap-2 text-xs text-dim">
                      {fmtShort(n.createdAt)}
                      {!n.readAt && <span className="h-2 w-2 rounded-full bg-volt" aria-label="Unread" />}
                    </span>
                  </button>
                </form>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
