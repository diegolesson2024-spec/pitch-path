import Link from "next/link";
import { Logo } from "@/components/Logo";
import { findValidResetToken } from "@/lib/password-reset";
import { ResetForm } from "./ResetForm";

export const metadata = { title: "Choose a new password", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function ResetPasswordPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const valid = await findValidResetToken(token);

  return (
    <main className="pitch-grid grid min-h-screen place-items-center p-4">
      <div className="panel w-full max-w-md p-6 md:p-8">
        <Link href="/" className="mb-6 inline-block" aria-label="PitchPath home"><Logo /></Link>
        {valid ? (
          <>
            <h1 className="display text-3xl">Choose a new password</h1>
            <p className="mb-6 mt-2 text-sm text-mute">You&apos;ll be signed out on other devices, then you can sign in with the new password.</p>
            <ResetForm token={token} />
          </>
        ) : (
          <>
            <h1 className="display text-3xl">Link expired</h1>
            <p className="mt-2 text-sm text-mute">This reset link has expired or was already used.</p>
            <Link href="/forgot-password" className="btn btn-primary mt-6">Request a new link</Link>
          </>
        )}
      </div>
    </main>
  );
}
