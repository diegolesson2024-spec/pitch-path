import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { PageHeader } from "@/components/ui";
import { createTeam } from "../actions";

export const metadata = { title: "New team" };

export default async function NewTeamPage() {
  const user = await requireUser(["ADMIN", "CLUB"]);
  const clubs = user.role === "ADMIN" ? await db.club.findMany({ orderBy: { name: "asc" } }) : [];
  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader eyebrow={user.clubName ?? "Platform"} title="New" accent="team" />
      <form action={createTeam} className="panel grid gap-4 p-6 sm:grid-cols-2">
        {user.role === "ADMIN" && (
          <label className="sm:col-span-2"><span className="label">Club</span>
            <select name="clubId" required className="field">{clubs.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select>
          </label>
        )}
        <label className="sm:col-span-2"><span className="label">Team name</span><input name="name" required placeholder="U15 Panthers" className="field" /></label>
        <label><span className="label">Age group</span><input name="ageGroup" required placeholder="U15" className="field" /></label>
        <label><span className="label">Season</span><input name="season" required defaultValue="2026/27" className="field" /></label>
        <div className="flex justify-end sm:col-span-2"><button className="btn btn-primary">Create team</button></div>
      </form>
    </div>
  );
}
