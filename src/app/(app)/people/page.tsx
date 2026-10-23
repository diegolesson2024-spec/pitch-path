import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { ROLE_LABEL, type Role } from "@/lib/skills";
import { fmtShort } from "@/lib/format";
import { Badge, Card, PageHeader } from "@/components/ui";
import { CreateClubForm, CreateUserForm } from "./forms";

export const metadata = { title: "People" };

export default async function PeoplePage() {
  const user = await requireUser(["ADMIN", "CLUB"]);
  const where = user.role === "ADMIN" ? {} : { clubId: user.clubId ?? "__none__" };
  const [users, clubs] = await Promise.all([
    db.user.findMany({ where, include: { club: { select: { shortName: true } } }, orderBy: [{ role: "asc" }, { name: "asc" }] }),
    user.role === "ADMIN" ? db.club.findMany({ orderBy: { name: "asc" } }) : Promise.resolve([]),
  ]);

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader eyebrow={user.clubName ?? "Platform"} title="People" accent={String(users.length)} />
      <div className="grid gap-5 lg:grid-cols-[1.4fr_1fr]">
        <Card title="Accounts">
          <div className="overflow-x-auto" tabIndex={0} role="region" aria-label="Scrollable table">
            <table className="w-full min-w-[520px] text-sm">
              <thead className="text-left text-[0.65rem] uppercase tracking-wider text-mute">
                <tr className="border-b border-line"><th className="py-2 pr-3">Name</th><th className="pr-3">Role</th>{user.role === "ADMIN" && <th className="pr-3">Club</th>}<th>Last sign-in</th></tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} className="border-b border-line/60">
                    <td className="py-2.5 pr-3"><p className="font-semibold">{u.name}</p><p className="text-xs text-dim">{u.email}</p></td>
                    <td className="pr-3"><Badge tone={u.role === "COACH" ? "royal" : u.role === "CLUB" || u.role === "ADMIN" ? "orange" : "mute"}>{ROLE_LABEL[u.role as Role]}</Badge></td>
                    {user.role === "ADMIN" && <td className="pr-3 text-mute">{u.club?.shortName ?? "–"}</td>}
                    <td className="text-xs text-mute">{u.lastLoginAt ? fmtShort(u.lastLoginAt) : "Never"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-4 text-xs text-dim">Parents and players join through one-time invite links sent from a player&apos;s profile.</p>
        </Card>
        <div className="space-y-5">
          <Card title="Add staff account" tone="orange">
            <CreateUserForm isAdmin={user.role === "ADMIN"} clubs={clubs.map((c) => ({ id: c.id, name: c.name }))} />
          </Card>
          {user.role === "ADMIN" && (
            <Card title="Add club" tone="royal">
              <CreateClubForm />
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
