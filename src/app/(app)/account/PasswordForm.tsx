"use client";

import { PasswordInput } from "@/components/PasswordInput";
import { useActionState } from "react";
import { changePassword, type PasswordState } from "./actions";

export function PasswordForm() {
  const [state, action, pending] = useActionState<PasswordState, FormData>(changePassword, {});
  return (
    <form action={action} className="space-y-4">
      <label className="block">
        <span className="label">Current password</span>
        <PasswordInput name="current" autoComplete="current-password" required className="field" />
      </label>
      <label className="block">
        <span className="label">New password</span>
        <PasswordInput name="next" autoComplete="new-password" required minLength={10} aria-describedby="pw-hint" className="field" />
        <span id="pw-hint" className="mt-1 block text-xs text-mute">At least 10 characters. A short phrase is easiest to remember.</span>
      </label>
      <label className="block">
        <span className="label">Confirm new password</span>
        <PasswordInput name="confirm" autoComplete="new-password" required minLength={10} className="field" />
      </label>
      {state.error && <p role="alert" className="rounded-lg bg-alert/10 px-3 py-2 text-sm text-alert">{state.error}</p>}
      {state.ok && <p role="status" className="rounded-lg bg-good/10 px-3 py-2 text-sm text-good">{state.ok}</p>}
      <button disabled={pending} className="btn btn-primary disabled:opacity-60">{pending ? "Saving…" : "Change password"}</button>
    </form>
  );
}
