import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { audit } from "@/lib/audit";
import { categoryFor, deleteVideo, drillFields, saveVideo, UploadError } from "@/lib/drill-upload";
import { isSameOrigin } from "@/lib/origin";

export const runtime = "nodejs";

// Create a coach drill. Multipart form so the video can come with it.
// Not behind middleware (it would buffer large bodies), so auth is checked here.
export async function POST(req: Request) {
  if (!isSameOrigin(req)) return Response.json({ error: "Forbidden" }, { status: 403 });
  const user = await getCurrentUser();
  if (!user) return Response.json({ error: "Please sign in again." }, { status: 401 });
  if (!["ADMIN", "CLUB", "COACH"].includes(user.role) || !user.clubId) {
    return Response.json({ error: "Only club staff can create drills." }, { status: 403 });
  }

  let video: Awaited<ReturnType<typeof saveVideo>> | null = null;
  try {
    const form = await req.formData();
    const parsed = drillFields.safeParse(Object.fromEntries([...form.entries()].filter(([, v]) => typeof v === "string")));
    if (!parsed.success) return Response.json({ error: parsed.error.issues[0]?.message ?? "Check the drill details." }, { status: 400 });

    const file = form.get("video");
    if (file instanceof File && file.size > 0) video = await saveVideo(file);

    const drill = await db.drill.create({
      data: {
        ...parsed.data,
        category: categoryFor(parsed.data.skill),
        createdById: user.id,
        clubId: user.clubId,
        ...(video ?? {}),
      },
    });
    await audit(user.id, "DRILL_CREATED", `drill:${drill.id}`, `${drill.name}${video ? " (with video)" : ""}`);
    return Response.json({ id: drill.id });
  } catch (e) {
    await deleteVideo(video?.videoFile);
    if (e instanceof UploadError) return Response.json({ error: e.message }, { status: 400 });
    console.error(e);
    return Response.json({ error: "Upload failed. Please try again." }, { status: 500 });
  }
}
