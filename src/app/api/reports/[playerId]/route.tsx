import { renderToBuffer } from "@react-pdf/renderer";
import { getCurrentUser } from "@/lib/auth";
import { loadPlayerReport } from "@/lib/player-data";
import { audit } from "@/lib/audit";
import { ReportDocument } from "@/lib/pdf/ReportDocument";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(_: Request, { params }: { params: Promise<{ playerId: string }> }) {
  const user = await getCurrentUser();
  if (!user) return new Response("Unauthorized", { status: 401 });
  const { playerId } = await params;

  // loadPlayerReport applies the same access rules as the report page (404 if not allowed).
  const report = await loadPlayerReport(user, playerId);
  const pdf = await renderToBuffer(<ReportDocument r={report} generatedBy={user.name} />);
  await audit(user.id, "REPORT_DOWNLOADED", `player:${playerId}`, `${report.player.firstName} ${report.player.lastName}`);

  const filename = `${report.player.firstName}-${report.player.lastName}-report.pdf`.replace(/[^a-zA-Z0-9.-]/g, "_");
  return new Response(new Uint8Array(pdf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="${filename}"`,
      "Cache-Control": "private, no-store",
    },
  });
}
