import { requireUser } from "@/lib/auth";
import { PageHeader } from "@/components/ui";
import { DrillForm } from "../DrillForm";

export const metadata = { title: "Create drill" };

export default async function NewDrillPage() {
  const user = await requireUser(["CLUB", "COACH", "ADMIN"]);
  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader eyebrow="Drill builder" title="Design your" accent="drill" />
      <DrillForm clubName={user.clubName ?? "your club"} />
    </div>
  );
}
