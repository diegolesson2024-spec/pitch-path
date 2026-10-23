"use client";

import { useFormStatus } from "react-dom";
import clsx from "clsx";

export function SubmitButton({ className, children, title }: { className?: string; children: React.ReactNode; title?: string }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} title={title} className={clsx(className, pending && "opacity-60")} aria-busy={pending}>
      {children}
    </button>
  );
}
