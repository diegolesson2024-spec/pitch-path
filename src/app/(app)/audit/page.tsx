import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { fmtDate } from "@/lib/format";
import { Card, PageHeader } from "@/components/ui";

export const metadata = { title: "Audit log" };

export default async function AuditPage() {
  const user = await requireUser(["ADMIN", "CLUB"]);
  const logs = await db.auditLog.findMany({
    where: user.role === "ADMIN" ? {} : { user: { clubId: user.clubId ?? "__none__" } },
    include: { user: { select: { name: true, role: true } } },
    orderBy: { createdAt: "desc" },
    take: 200,
  });
  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader eyebrow="Safeguarding" title="Audit" accent="log" />
      <Card title="Who did what, and when" action={<span className="text-xs text-mute">Last {logs.length} events</span>}>
        {logs.length === 0 ? (
          <p className="text-sm text-mute">No activity recorded yet.</p>
        ) : (
          <div className="overflow-x-auto" tabIndex={0} role="region" aria-label="Scrollable table">
            <table className="w-full min-w-[560px] text-sm">
              <thead className="text-left text-[0.65rem] uppercase tracking-wider text-mute">
                <tr className="border-b border-line"><th className="py-2 pr-3">When</th><th className="pr-3">Who</th><th className="pr-3">Action</th><th>Detail</th></tr>
              </thead>
              <tbody>
                {logs.map((l) => (
                  <tr key={l.id} className="border-b border-line/60 align-top">
                    <td className="num py-2 pr-3 text-xs text-mute">{fmtDate(l.createdAt)} {l.createdAt.toISOString().slice(11, 16)}</td>
                    <td className="pr-3">{l.user?.name ?? "System"}</td>
                    <td className="pr-3 font-semibold">{l.action.toLowerCase().replaceAll("_", " ")}</td>
                    <td className="text-xs text-mute">{l.detail || l.target}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
