import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { teamScope } from "@/lib/access";
import { POSITIONS } from "@/lib/skills";
import { PageHeader } from "@/components/ui";
import { createPlayer } from "../actions";

export const metadata = { title: "Add player" };

export default async function NewPlayerPage() {
  const user = await requireUser(["ADMIN", "CLUB", "COACH"]);
  const teams = await db.team.findMany({ where: teamScope(user), include: { club: true }, orderBy: { name: "asc" } });

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader eyebrow="Register" title="Add a" accent="player" />
      <form action={createPlayer} className="panel space-y-5 p-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <F label="First name"><input name="firstName" required maxLength={60} className="field" /></F>
          <F label="Last name"><input name="lastName" required maxLength={60} className="field" /></F>
          <F label="Date of birth"><input name="dateOfBirth" type="date" required className="field" /></F>
          <F label="Team">
            <select name="teamId" required className="field">
              {teams.map((t) => <option key={t.id} value={t.id}>{t.name}{user.role === "ADMIN" ? ` · ${t.club.shortName}` : ""}</option>)}
            </select>
          </F>
          <F label="Primary position">
            <select name="position" required className="field">
              {POSITIONS.map((p) => <option key={p.key} value={p.key}>{p.label}</option>)}
            </select>
          </F>
          <F label="Secondary position">
            <select name="secondaryPos" className="field">
              <option value="">None</option>
              {POSITIONS.map((p) => <option key={p.key} value={p.key}>{p.label}</option>)}
            </select>
          </F>
          <F label="Dominant foot">
            <select name="dominantFoot" className="field"><option>Right</option><option>Left</option><option>Both</option></select>
          </F>
          <F label="Shirt number"><input name="shirtNumber" type="number" min={1} max={99} className="field" /></F>
          <F label="Height (cm)"><input name="heightCm" type="number" min={80} max={220} className="field" /></F>
          <F label="Weight (kg)"><input name="weightKg" type="number" min={15} max={140} className="field" /></F>
        </div>
        <label className="flex items-start gap-3 rounded-xl border border-line p-4 text-sm">
          <input type="checkbox" name="consent" className="mt-1 h-4 w-4 accent-[#ff6a13]" />
          <span>
            <span className="font-semibold">A parent or guardian has consented</span>
            <span className="block text-mute">to the club storing this player&apos;s development data and sharing it with their family through PitchPath.</span>
          </span>
        </label>
        <div className="flex justify-end gap-2">
          <button className="btn btn-primary">Create player</button>
        </div>
      </form>
    </div>
  );
}

function F({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="label">{label}</span>
      {children}
    </label>
  );
}
