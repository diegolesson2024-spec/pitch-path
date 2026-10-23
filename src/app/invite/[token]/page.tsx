import Link from "next/link";
import { db } from "@/lib/db";
import { Logo } from "@/components/Logo";
import { AcceptForm } from "./AcceptForm";

export const metadata = { title: "Accept invite", robots: { index: false, follow: false } };

export default async function InvitePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const invite = await db.invite.findUnique({ where: { token }, include: { player: { include: { club: true } } } });
  const valid = invite && !invite.usedAt && invite.expiresAt > new Date();
  const existing = valid ? await db.user.findUnique({ where: { email: invite.email } }) : null;

  return (
    <main className="pitch-grid grid min-h-screen place-items-center p-4">
      <div className="panel w-full max-w-md p-6 md:p-8">
        <Link href="/" className="mb-6 inline-block"><Logo /></Link>
        {!valid ? (
          <>
            <h1 className="display text-3xl">Invite expired</h1>
            <p className="mt-2 text-sm text-mute">This link has already been used or has expired. Ask your coach to send a new one.</p>
          </>
        ) : (
          <>
            <p className="eyebrow mb-2">{invite.player.club.name}</p>
            <h1 className="display text-3xl">
              Follow <span className="text-volt">{invite.player.firstName}&apos;s</span> progress
            </h1>
            <p className="mb-6 mt-2 text-sm text-mute">
              You&apos;ve been invited as {invite.relation === "PARENT" ? "a parent" : "the player"}. {existing ? "Sign in with your existing password to link the profile." : "Create your account to see evaluations, development plans and home drills."}
            </p>
            <AcceptForm token={token} email={invite.email} existing={Boolean(existing)} />
          </>
        )}
      </div>
    </main>
  );
}
