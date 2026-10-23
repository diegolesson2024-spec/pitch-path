"use client";

import Link from "next/link";
import { useEffect } from "react";
import { Logo } from "@/components/Logo";

// Shown when a page fails to render (e.g. the database is unreachable). Details stay in server logs.
export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="grid min-h-screen place-items-center p-6 text-center">
      <div className="max-w-md">
        <Logo className="mb-8 justify-center" />
        <h1 className="display text-4xl">Something went wrong</h1>
        <p className="mt-3 text-mute">
          We couldn&apos;t load this page. It&apos;s usually temporary, so please try again. If it keeps happening, contact your club.
        </p>
        {error.digest && <p className="mt-2 text-xs text-dim">Reference: {error.digest}</p>}
        <div className="mt-8 flex justify-center gap-3">
          <button onClick={reset} className="btn btn-primary">Try again</button>
          <Link href="/dashboard" className="btn btn-ghost">Dashboard</Link>
        </div>
      </div>
    </main>
  );
}
