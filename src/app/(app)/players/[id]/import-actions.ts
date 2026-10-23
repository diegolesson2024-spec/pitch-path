"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { getManageablePlayer, getViewablePlayer } from "@/lib/access";
import { audit } from "@/lib/audit";
import { notifyUser } from "@/lib/notify";
import { rateLimit } from "@/lib/rate-limit";
import { readStatsCsv, type ImportRow } from "@/lib/stat-import";

const MAX_FILE_BYTES = 512 * 1024;

// Coach switch: may this player's parents upload match stats?
export async function setParentImports(playerId: string, form: FormData) {
  const user = await requireUser(["ADMIN", "CLUB", "COACH"]);
  await getManageablePlayer(user, playerId);
  const allow = form.get("allow") === "true";
  await db.player.update({ where: { id: playerId }, data: { allowParentImports: allow } });
  await audit(user.id, allow ? "PARENT_IMPORTS_ENABLED" : "PARENT_IMPORTS_DISABLED", `player:${playerId}`);
  revalidatePath(`/players/${playerId}`);
}

export type UploadState = { ok?: string; error?: string; skipped?: { line: number; reason: string }[] };

export async function uploadStats(playerId: string, _: UploadState, form: FormData): Promise<UploadState> {
  const user = await requireUser(["PARENT"]);
  const limit = rateLimit(`stats-upload:${user.id}`, 10, 60 * 60 * 1000);
  if (!limit.ok) return { error: `Too many uploads. Try again in ${limit.retryInMin} minutes.` };
  const player = await getViewablePlayer(user, playerId);
  if (!player.allowParentImports) return { error: "Your coach hasn't turned on stat imports for this player." };

  const parsed = z
    .object({ source: z.enum(["Veo", "Hudl", "Spreadsheet", "Other"]), dateOrder: z.enum(["DMY", "MDY"]) })
    .safeParse({ source: form.get("source"), dateOrder: form.get("dateOrder") });
  if (!parsed.success) return { error: "Choose where the stats came from and the date format." };

  const file = form.get("file");
  if (!(file instanceof File) || file.size === 0) return { error: "Choose a CSV file to upload." };
  if (file.size > MAX_FILE_BYTES) return { error: "That file is too large. Stats files should be under 512 KB." };
  if (!/\.(csv|txt)$/i.test(file.name)) return { error: "Upload a .csv file. In Excel or Google Sheets use File → Save as / Download → CSV." };

  const { rows, skipped, error } = readStatsCsv(await file.text(), { dateOrder: parsed.data.dateOrder });
  if (error && rows.length === 0) return { error, skipped };

  const pending = await db.statImport.count({ where: { playerId, uploadedById: user.id, status: "PENDING" } });
  if (pending >= 5) return { error: "You have 5 imports waiting for review. Please wait for your coach to check them." };

  const imp = await db.statImport.create({
    data: {
      playerId,
      uploadedById: user.id,
      fileName: file.name.slice(0, 120),
      source: parsed.data.source,
      rows: JSON.stringify(rows),
      skipped: JSON.stringify(skipped),
    },
  });
  await audit(user.id, "STATS_IMPORT_SUBMITTED", `player:${playerId}`, `${rows.length} matches from ${parsed.data.source}`);

  // Let the player's coaches know there's something to review.
  const coaches = await db.coachTeam.findMany({ where: { teamId: player.teamId ?? "__none__" } });
  for (const c of coaches) {
    await notifyUser(c.userId, {
      kind: "NOTE",
      title: `Match stats to review for ${player.firstName} ${player.lastName}`,
      body: `${user.name} imported ${rows.length} match${rows.length === 1 ? "" : "es"} from ${parsed.data.source}.`,
      href: `/players/${playerId}#imports`,
      dedupeKey: `import:${imp.id}`,
    });
  }
  revalidatePath(`/players/${playerId}`);
  return { ok: `Sent ${rows.length} match${rows.length === 1 ? "" : "es"} to your coach for review.`, skipped };
}

export async function reviewImport(playerId: string, form: FormData) {
  const user = await requireUser(["ADMIN", "CLUB", "COACH"]);
  const player = await getManageablePlayer(user, playerId);
  const data = z
    .object({ importId: z.string(), decision: z.enum(["APPROVE", "REJECT"]), note: z.string().trim().max(500).default("") })
    .parse({ importId: form.get("importId"), decision: form.get("decision"), note: form.get("note") ?? "" });

  const imp = await db.statImport.findFirst({ where: { id: data.importId, playerId, status: "PENDING" } });
  if (!imp) return;

  let added = 0;
  if (data.decision === "APPROVE") {
    const rows = JSON.parse(imp.rows) as ImportRow[];
    // Don't double count a match the coach already logged on the same day.
    const existing = new Set(
      (await db.matchStat.findMany({ where: { playerId }, select: { date: true } })).map((m) => m.date.toISOString().slice(0, 10)),
    );
    const fresh = rows.filter((r) => !existing.has(r.date));
    added = fresh.length;
    await db.$transaction([
      db.matchStat.createMany({
        data: fresh.map((r) => ({ ...r, playerId, date: new Date(`${r.date}T12:00:00Z`), importId: imp.id })),
      }),
      db.statImport.update({ where: { id: imp.id }, data: { status: "APPROVED", reviewedById: user.id, reviewedAt: new Date(), reviewNote: data.note } }),
    ]);
  } else {
    await db.statImport.update({ where: { id: imp.id }, data: { status: "REJECTED", reviewedById: user.id, reviewedAt: new Date(), reviewNote: data.note } });
  }

  await audit(user.id, data.decision === "APPROVE" ? "STATS_IMPORT_APPROVED" : "STATS_IMPORT_REJECTED", `player:${playerId}`, `${imp.fileName}${added ? `, ${added} added` : ""}`);
  await notifyUser(imp.uploadedById, {
    kind: "NOTE",
    title: data.decision === "APPROVE" ? `${user.name} approved ${player.firstName}'s imported stats` : `${user.name} didn't accept ${player.firstName}'s imported stats`,
    body: data.note || (data.decision === "APPROVE" ? `${added} match${added === 1 ? "" : "es"} added to the season stats.` : "Open the report card to see the details."),
    href: `/players/${playerId}`,
  });
  revalidatePath(`/players/${playerId}`);
}
