import fs from "node:fs";
import path from "node:path";
import { Readable } from "node:stream";
import { getCurrentUser } from "@/lib/auth";
import { VIDEO_DIR, getVisibleDrill } from "@/lib/drills";

export const runtime = "nodejs";

// Streams a drill video to users allowed to see the drill. Supports Range requests
// so players can seek and so Safari/iOS will play it.
export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return new Response("Unauthorized", { status: 401 });
  const { id } = await params;
  const drill = await getVisibleDrill(user, id);
  if (!drill?.videoFile || !drill.videoMime) return new Response("Not found", { status: 404 });

  const file = path.join(VIDEO_DIR, path.basename(drill.videoFile));
  const stat = await fs.promises.stat(file).catch(() => null);
  if (!stat) return new Response("Not found", { status: 404 });

  const headers: Record<string, string> = {
    "Content-Type": drill.videoMime,
    "Accept-Ranges": "bytes",
    "Cache-Control": "private, max-age=3600",
    "Content-Disposition": "inline",
    "X-Content-Type-Options": "nosniff",
  };

  const range = /bytes=(\d*)-(\d*)/.exec(req.headers.get("range") ?? "");
  if (range) {
    const start = range[1] ? Number(range[1]) : stat.size - Number(range[2]);
    const end = range[1] && range[2] ? Math.min(Number(range[2]), stat.size - 1) : stat.size - 1;
    if (Number.isNaN(start) || start < 0 || start > end) {
      return new Response(null, { status: 416, headers: { "Content-Range": `bytes */${stat.size}` } });
    }
    const stream = Readable.toWeb(fs.createReadStream(file, { start, end })) as ReadableStream;
    return new Response(stream, {
      status: 206,
      headers: { ...headers, "Content-Range": `bytes ${start}-${end}/${stat.size}`, "Content-Length": String(end - start + 1) },
    });
  }

  const stream = Readable.toWeb(fs.createReadStream(file)) as ReadableStream;
  return new Response(stream, { headers: { ...headers, "Content-Length": String(stat.size) } });
}
