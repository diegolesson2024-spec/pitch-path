import Link from "next/link";
import { Logo } from "@/components/Logo";
import { emailConfigured } from "@/lib/email";
import { ForgotForm } from "./ForgotForm";

export const metadata = { title: "Forgot password", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default function ForgotPasswordPage() {
  const canEmail = emailConfigured() || process.env.NODE_ENV !== "production";
  return (
    <main className="pitch-grid grid min-h-screen place-items-center p-4">
      <div className="panel w-full max-w-md p-6 md:p-8">
        <Link href="/" className="mb-6 inline-block" aria-label="PitchPath home"><Logo /></Link>
        <h1 className="display text-3xl">Forgot your password?</h1>
        {canEmail ? (
          <>
            <p className="mb-6 mt-2 text-sm text-mute">Enter the email you sign in with and we&apos;ll send you a link to choose a new one.</p>
            <ForgotForm />
          </>
        ) : (
          <p className="mt-3 text-sm text-mute">
            Ask your club director or coach to reset it for you. They can give you a new temporary password from their People page. Then sign in and change it on your Account page.
          </p>
        )}
        <p className="mt-6 text-center text-sm text-mute">
          Remembered it? <Link href="/login" className="font-semibold text-royal-soft hover:underline">Back to sign in</Link>
        </p>
      </div>
    </main>
  );
}
