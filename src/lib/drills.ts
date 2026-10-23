// Who can see and change which drills.
// Library drills (no creator) are visible to everyone. Coach-made drills are private
// to their creator unless shared with the club; club directors oversee all drills made
// at their club; families see a coach drill only once it is in their child's plan.
import "server-only";
import path from "node:path";
import type { Prisma } from "@prisma/client";
import { db } from "./db";
import type { CurrentUser } from "./auth";

// UPLOAD_DIR points at persistent storage in production (e.g. a Render disk); defaults to ./uploads.
export const VIDEO_DIR = path.join(process.env.UPLOAD_DIR || path.join(process.cwd(), "uploads"), "drill-videos");
export const MAX_VIDEO_BYTES = 200 * 1024 * 1024;
export const MAX_VIDEO_SECONDS = 120;
export const VIDEO_TYPES: Record<string, string> = {
  "video/mp4": ".mp4",
  "video/quicktime": ".mov",
  "video/webm": ".webm",
};

const LIBRARY: Prisma.DrillWhereInput = { createdById: null, clubId: null };

export function drillScope(user: CurrentUser): Prisma.DrillWhereInput {
  switch (user.role) {
    case "ADMIN":
      return {};
    case "CLUB":
      return { OR: [LIBRARY, { clubId: user.clubId ?? "__none__" }] };
    case "COACH":
      return {
        OR: [LIBRARY, { createdById: user.id }, { clubId: user.clubId ?? "__none__", visibility: "CLUB" }],
      };
    case "PARENT":
    case "PLAYER":
      return {
        OR: [
          LIBRARY,
          { planDrills: { some: { plan: { status: "ACTIVE", player: { access: { some: { userId: user.id } } } } } } },
        ],
      };
    default:
      return { id: "__none__" };
  }
}

export function canEditDrill(user: CurrentUser, drill: { createdById: string | null; clubId: string | null }) {
  if (user.role === "ADMIN") return true;
  if (!drill.createdById && !drill.clubId) return false; // library drills are read-only
  if (drill.createdById === user.id) return true;
  return user.role === "CLUB" && drill.clubId != null && drill.clubId === user.clubId;
}

export async function getVisibleDrill(user: CurrentUser, id: string) {
  return db.drill.findFirst({ where: { AND: [{ id }, drillScope(user)] }, include: { createdBy: { select: { name: true } } } });
}

// Check the file's first bytes so a renamed non-video can't be stored as one.
export function looksLikeVideo(head: Uint8Array, mime: string) {
  if (mime === "video/webm") return head[0] === 0x1a && head[1] === 0x45 && head[2] === 0xdf && head[3] === 0xa3;
  return head[4] === 0x66 && head[5] === 0x74 && head[6] === 0x79 && head[7] === 0x70; // "ftyp" (mp4/mov)
}
