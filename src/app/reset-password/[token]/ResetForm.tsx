"use client";

import { useActionState } from "react";
import { PasswordInput } from "@/components/PasswordInput";
import { resetPassword, type ResetState } from "./actions";

export function ResetForm({ token }: { token: string }) {
  const [state, action, pending] = useActionState<ResetState, FormData>(resetPassword.bind(null, token), {});
  return (
    <form action={action} className="space-y-4">
      <label className="block">
        <span className="label">New password</span>
        <PasswordInput name="password" required minLength={10} autoComplete="new-password" aria-describedby="reset-hint" className="field" />
        <span id="reset-hint" className="mt-1 block text-xs text-mute">At least 10 characters. A short phrase is easiest to remember.</span>
      </label>
      <label className="block">
        <span className="label">Confirm new password</span>
        <PasswordInput name="confirm" required minLength={10} autoComplete="new-password" className="field" />
      </label>
      {state.error && <p role="alert" className="rounded-lg bg-alert/10 px-3 py-2 text-sm text-alert">{state.error}</p>}
      <button disabled={pending} className="btn btn-primary w-full !py-3 disabled:opacity-60">{pending ? "Saving…" : "Set new password"}</button>
    </form>
  );
}
