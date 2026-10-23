import Link from "next/link";
import { Logo } from "@/components/Logo";

export default function NotFound() {
  return (
    <main className="pitch-grid grid min-h-screen place-items-center p-6 text-center">
      <div>
        <Logo className="mb-8 justify-center" />
        <p className="display text-8xl text-volt">404</p>
        <h1 className="display mt-2 text-3xl">Off the pitch</h1>
        <p className="mx-auto mt-3 max-w-sm text-mute">This page doesn&apos;t exist, or you don&apos;t have access to it.</p>
        <Link href="/dashboard" className="btn btn-primary mt-8">Back to dashboard</Link>
      </div>
    </main>
  );
}
