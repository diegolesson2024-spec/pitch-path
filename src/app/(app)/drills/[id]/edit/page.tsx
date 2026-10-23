import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { canEditDrill, getVisibleDrill } from "@/lib/drills";
import { PageHeader } from "@/components/ui";
import { DrillForm } from "../../DrillForm";

export const metadata = { title: "Edit drill" };

export default async function EditDrillPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await requireUser(["CLUB", "COACH", "ADMIN"]);
  const drill = await getVisibleDrill(user, id);
  if (!drill || !canEditDrill(user, drill)) notFound();
  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader eyebrow="Drill builder" title="Edit" accent={drill.name} />
      <DrillForm
        clubName={user.clubName ?? "your club"}
        initial={{
          id: drill.id,
          name: drill.name,
          skill: drill.skill,
          summary: drill.summary,
          instructions: drill.instructions,
          equipment: drill.equipment,
          minutes: drill.minutes,
          difficulty: drill.difficulty,
          atHome: drill.atHome,
          visibility: drill.visibility === "CLUB" ? "CLUB" : "PRIVATE",
          hasVideo: Boolean(drill.videoFile),
        }}
      />
    </div>
  );
}
