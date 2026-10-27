"use client";

import { useActionState } from "react";
import { requestReset, type ForgotState } from "./actions";

export function ForgotForm() {
  const [state, action, pending] = useActionState<ForgotState, FormData>(requestReset, {});

  if (state.sent) {
    return (
      <p role="status" className="rounded-lg bg-good/10 px-4 py-3 text-sm text-good">
        If an account exists for that email, we&apos;ve sent a link to reset your password. It expires in 1 hour. Check your spam folder if it hasn&apos;t arrived in a few minutes.
      </p>
    );
  }

  return (
    <form action={action} className="space-y-4">
      <label className="block">
        <span className="label">Email</span>
        <input name="email" type="email" required autoComplete="email" className="field" />
      </label>
      {state.error && <p role="alert" className="rounded-lg bg-alert/10 px-3 py-2 text-sm text-alert">{state.error}</p>}
      <button disabled={pending} className="btn btn-primary w-full !py-3 disabled:opacity-60">
        {pending ? "Sending…" : "Email me a reset link"}
      </button>
    </form>
  );
}
