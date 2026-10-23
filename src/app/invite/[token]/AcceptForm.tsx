"use client";

import { useActionState } from "react";
import { acceptInvite, type AcceptState } from "./actions";

export function AcceptForm({ token, email, existing }: { token: string; email: string; existing: boolean }) {
  const [state, action, pending] = useActionState<AcceptState, FormData>(acceptInvite.bind(null, token), {});
  return (
    <form action={action} className="space-y-4">
      <div>
        <span className="label">Email</span>
        <p className="field !bg-transparent text-mute">{email}</p>
      </div>
      {!existing && (
        <label className="block"><span className="label">Your name</span><input name="name" required maxLength={80} autoComplete="name" className="field" /></label>
      )}
      <label className="block">
        <span className="label">{existing ? "Password" : "Choose a password (10+ characters)"}</span>
        <input name="password" type="password" required minLength={existing ? 1 : 10} autoComplete={existing ? "current-password" : "new-password"} className="field" />
      </label>
      {state.error && <p role="alert" className="text-sm text-alert">{state.error}</p>}
      <button disabled={pending} className="btn btn-primary w-full !py-3">{pending ? "Please wait…" : existing ? "Link profile" : "Create account"}</button>
    </form>
  );
}
