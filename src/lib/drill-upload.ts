import "server-only";
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { Readable } from "node:stream";
import { pipeline } from "node:stream/promises";
import { z } from "zod";
import { SKILL_BY_KEY } from "./skills";
import { MAX_VIDEO_BYTES, VIDEO_DIR, VIDEO_TYPES, looksLikeVideo } from "./drills";

export const drillFields = z.object({
  name: z.string().trim().min(2).max(80),
  skill: z.string().refine((s) => Boolean(SKILL_BY_KEY[s]), "Choose a skill"),
  summary: z.string().trim().min(2).max(200),
  instructions: z.string().trim().min(10).max(4000),
  equipment: z.string().trim().max(200).default(""),
  minutes: z.coerce.number().int().min(1).max(120),
  difficulty: z.enum(["Foundation", "Developing", "Advanced"]),
  atHome: z.preprocess((v) => v === "on" || v === "true", z.boolean()),
  visibility: z.enum(["PRIVATE", "CLUB"]),
});

export class UploadError extends Error {}

// Validates and stores an uploaded video, returning its stored metadata.
export async function saveVideo(file: File) {
  const ext = VIDEO_TYPES[file.type];
  if (!ext) throw new UploadError("Upload an MP4, MOV or WebM video.");
  if (file.size > MAX_VIDEO_BYTES) throw new UploadError("Videos must be 200 MB or smaller.");
  if (file.size < 1024) throw new UploadError("That video file looks empty.");
  const head = new Uint8Array(await file.slice(0, 12).arrayBuffer());
  if (!looksLikeVideo(head, file.type)) throw new UploadError("That file isn't a valid video.");

  await fs.promises.mkdir(VIDEO_DIR, { recursive: true });
  const name = `${crypto.randomUUID()}${ext}`;
  const dest = path.join(VIDEO_DIR, name);
  const tmp = `${dest}.part`;
  await pipeline(Readable.fromWeb(file.stream() as never), fs.createWriteStream(tmp));
  await fs.promises.rename(tmp, dest);
  return { videoFile: name, videoMime: file.type, videoSize: file.size };
}

export async function deleteVideo(name: string | null | undefined) {
  if (!name) return;
  // Stored names are UUIDs we generated; basename() guards against path tricks anyway.
  await fs.promises.rm(path.join(VIDEO_DIR, path.basename(name)), { force: true });
}

export function categoryFor(skill: string) {
  return SKILL_BY_KEY[skill].category;
}
