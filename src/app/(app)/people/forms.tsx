"use client";

import { useActionState, useState } from "react";
import { createClub, createStaff, resetUserPassword, type PeopleState, type ResetState } from "./actions";

export function ResetPasswordButton({ userId, name }: { userId: string; name: string }) {
  const [state, action, pending] = useActionState<ResetState, FormData>(resetUserPassword.bind(null, userId), {});
  const [confirming, setConfirming] = useState(false);
  const [copied, setCopied] = useState(false);

  if (state.tempPassword) {
    return (
      <div className="rounded-lg bg-warn/10 p-2 text-xs" role="status">
        <p>New temporary password for {name} (shown once):</p>
        <div className="mt-1 flex items-center gap-2">
          <code className="rounded bg-night/60 px-1.5 py-0.5 font-bold">{state.tempPassword}</code>
          <button
            type="button"
            onClick={() => navigator.clipboard.writeText(state.tempPassword!).then(() => setCopied(true))}
            className="font-semibold text-royal-soft hover:underline"
          >
            {copied ? "Copied" : "Copy"}
          </button>
        </div>
        <p className="mt-1 text-mute">Share it privately. They&apos;re signed out and should change it on their Account page.</p>
      </div>
    );
  }

  if (!confirming) {
    return (
      <button type="button" onClick={() => setConfirming(true)} className="text-xs font-semibold text-royal-soft hover:underline">
        Reset password
      </button>
    );
  }

  return (
    <form action={action} className="flex flex-wrap items-center gap-2 text-xs">
      <span>Reset {name}&apos;s password?</span>
      <button disabled={pending} className="rounded-md bg-royal px-2 py-1 font-semibold text-white disabled:opacity-60">
        {pending ? "Resetting…" : "Yes, reset"}
      </button>
      <button type="button" onClick={() => setConfirming(false)} className="font-semibold text-mute hover:text-ink">Cancel</button>
      {state.error && <span role="alert" className="w-full text-alert">{state.error}</span>}
    </form>
  );
}

export function CreateUserForm({ isAdmin, clubs }: { isAdmin: boolean; clubs: { id: string; name: string }[] }) {
  const [state, action, pending] = useActionState<PeopleState, FormData>(createStaff, {});
  return (
    <form action={action} className="space-y-3">
      <label className="block"><span className="label">Full name</span><input name="name" required maxLength={80} className="field" /></label>
      <label className="block"><span className="label">Email</span><input name="email" type="email" required className="field" /></label>
      <label className="block"><span className="label">Role</span>
        <select name="role" className="field">
          <option value="COACH">Coach</option>
          <option value="CLUB">Club director</option>
          {isAdmin && <option value="ADMIN">Platform admin</option>}
        </select>
      </label>
      {isAdmin && (
        <label className="block"><span className="label">Club</span>
          <select name="clubId" className="field"><option value="">None (admins only)</option>{clubs.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select>
        </label>
      )}
      {state.error && <p className="text-sm text-alert">{state.error}</p>}
      {state.tempPassword && (
        <div className="rounded-xl border border-volt/40 bg-volt/10 p-3 text-sm">
          <p className="font-semibold">Account created for {state.email}.</p>
          <p className="mt-1 text-mute">Share this temporary password privately. It is shown only once:</p>
          <code className="mt-2 block rounded-lg bg-night/60 px-2 py-1.5 font-bold">{state.tempPassword}</code>
        </div>
      )}
      <button disabled={pending} className="btn btn-primary w-full">{pending ? "Creating…" : "Create account"}</button>
    </form>
  );
}

export function CreateClubForm() {
  const [state, action, pending] = useActionState<PeopleState, FormData>(createClub, {});
  return (
    <form action={action} className="space-y-3">
      <label className="block"><span className="label">Club name</span><input name="name" required maxLength={80} className="field" /></label>
      <div className="grid grid-cols-2 gap-3">
        <label><span className="label">Short name</span><input name="shortName" required maxLength={6} className="field" /></label>
        <label><span className="label">City</span><input name="city" required maxLength={60} className="field" /></label>
      </div>
      {state.error && <p className="text-sm text-alert">{state.error}</p>}
      {state.ok && <p className="text-sm text-royal-soft">Club created. Add a club director next.</p>}
      <button disabled={pending} className="btn btn-royal w-full">Create club</button>
    </form>
  );
}
