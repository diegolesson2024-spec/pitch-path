// Makes sure the built-in PitchPath drill library exists in the database.
// Runs at server start (see src/instrumentation.ts), so a fresh production database gets
// the library without running the demo seed. Only adds drills that are missing by name;
// it never changes or deletes anything.
import { db } from "./db";
import { DRILLS } from "./drills-data";

export async function ensureLibraryDrills() {
  const existing = await db.drill.findMany({ where: { createdById: null, clubId: null }, select: { name: true } });
  const have = new Set(existing.map((d) => d.name));
  const missing = DRILLS.filter((d) => !have.has(d.name));
  if (missing.length === 0) return 0;
  await db.drill.createMany({ data: missing.map((x) => ({ ...x, atHome: x.atHome ?? true })) });
  return missing.length;
}
