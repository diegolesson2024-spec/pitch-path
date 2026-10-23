import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { audit } from "@/lib/audit";
import { canEditDrill, getVisibleDrill } from "@/lib/drills";
import { categoryFor, deleteVideo, drillFields, saveVideo, UploadError } from "@/lib/drill-upload";
import { isSameOrigin } from "@/lib/origin";

export const runtime = "nodejs";

async function editable(req: Request, id: string) {
  if (!isSameOrigin(req)) return { error: Response.json({ error: "Forbidden" }, { status: 403 }) };
  const user = await getCurrentUser();
  if (!user) return { error: Response.json({ error: "Please sign in again." }, { status: 401 }) };
  const drill = await getVisibleDrill(user, id);
  if (!drill) return { error: Response.json({ error: "Drill not found." }, { status: 404 }) };
  if (!canEditDrill(user, drill)) return { error: Response.json({ error: "You can't edit this drill." }, { status: 403 }) };
  return { user, drill };
}

// Update a drill; replaces the video when a new one is sent, removes it when asked.
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const r = await editable(req, id);
  if ("error" in r) return r.error;

  let video: Awaited<ReturnType<typeof saveVideo>> | null = null;
  try {
    const form = await req.formData();
    const parsed = drillFields.safeParse(Object.fromEntries([...form.entries()].filter(([, v]) => typeof v === "string")));
    if (!parsed.success) return Response.json({ error: parsed.error.issues[0]?.message ?? "Check the drill details." }, { status: 400 });

    const file = form.get("video");
    if (file instanceof File && file.size > 0) video = await saveVideo(file);
    const removeVideo = form.get("removeVideo") === "true";

    await db.drill.update({
      where: { id },
      data: {
        ...parsed.data,
        category: categoryFor(parsed.data.skill),
        ...(video ?? (removeVideo ? { videoFile: null, videoMime: null, videoSize: null } : {})),
      },
    });
    if (video || removeVideo) await deleteVideo(r.drill.videoFile);
    await audit(r.user.id, "DRILL_UPDATED", `drill:${id}`, parsed.data.name);
    return Response.json({ id });
  } catch (e) {
    await deleteVideo(video?.videoFile);
    if (e instanceof UploadError) return Response.json({ error: e.message }, { status: 400 });
    console.error(e);
    return Response.json({ error: "Upload failed. Please try again." }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const r = await editable(req, id);
  if ("error" in r) return r.error;
  await db.$transaction([db.planDrill.deleteMany({ where: { drillId: id } }), db.drill.delete({ where: { id } })]);
  await deleteVideo(r.drill.videoFile);
  await audit(r.user.id, "DRILL_DELETED", `drill:${id}`, r.drill.name);
  return Response.json({ ok: true });
}
