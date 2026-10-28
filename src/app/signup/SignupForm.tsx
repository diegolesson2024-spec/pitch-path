"use client";

import { PasswordInput } from "@/components/PasswordInput";
import { useActionState } from "react";
import { signup, type SignupState } from "./actions";

export function SignupForm() {
  const [state, action, pending] = useActionState<SignupState, FormData>(signup, {});
  const invalid = (f: string) => (state.field === f ? true : undefined);

  return (
    <form action={action} className="space-y-4" noValidate>
      {/* After an error React resets the form to these defaults, so typed details survive. */}
      <fieldset className="space-y-4">
        <legend className="eyebrow mb-1">About you</legend>
        <label className="block">
          <span className="label">Your name</span>
          <input name="name" defaultValue={state.values?.name} required maxLength={80} autoComplete="name" aria-invalid={invalid("name")} className="field" />
        </label>
        <label className="block">
          <span className="label">Email</span>
          <input name="email" type="email" defaultValue={state.values?.email} required autoComplete="email" aria-invalid={invalid("email")} className="field" />
        </label>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="label">Password</span>
            <PasswordInput name="password" required minLength={10} autoComplete="new-password" aria-describedby="pw-hint" aria-invalid={invalid("password")} className="field" />
          </label>
          <label className="block">
            <span className="label">Confirm password</span>
            <PasswordInput name="confirm" required minLength={10} autoComplete="new-password" aria-invalid={invalid("confirm")} className="field" />
          </label>
        </div>
        <p id="pw-hint" className="-mt-2 text-xs text-mute">At least 10 characters. A short phrase is easiest to remember.</p>
      </fieldset>

      <fieldset className="space-y-4 border-t border-line pt-4">
        <legend className="eyebrow mb-1 pt-4">Your club</legend>
        <div className="grid gap-4 sm:grid-cols-[1.4fr_1fr]">
          <label className="block">
            <span className="label">Club name</span>
            <input name="clubName" defaultValue={state.values?.clubName} required maxLength={80} placeholder="e.g. Westside United" autoComplete="organization" aria-invalid={invalid("clubName")} className="field" />
          </label>
          <label className="block">
            <span className="label">Town or city</span>
            <input name="city" defaultValue={state.values?.city} required maxLength={60} autoComplete="address-level2" aria-invalid={invalid("city")} className="field" />
          </label>
        </div>
      </fieldset>

      {/* Hidden from people; bots that fill every field are rejected. */}
      <div aria-hidden className="absolute -left-[9999px] h-px w-px overflow-hidden">
        <label>Website<input name="website" tabIndex={-1} autoComplete="off" /></label>
      </div>

      <label className="flex items-start gap-3 rounded-lg bg-panel-2 p-3 text-sm">
        <input type="checkbox" name="agree" defaultChecked={state.values?.agree} required aria-invalid={invalid("agree")} className="mt-0.5 h-4 w-4 shrink-0 accent-[#ff6a13]" />
        <span>
          I&apos;m authorised to set up this club, I&apos;ll get a parent or guardian&apos;s consent before adding any player&apos;s information, and I agree to the{" "}
          <a href="/terms" target="_blank" rel="noopener" className="font-semibold text-royal-soft underline">Terms</a> and{" "}
          <a href="/privacy" target="_blank" rel="noopener" className="font-semibold text-royal-soft underline">Privacy Policy</a>.
        </span>
      </label>

      {state.error && (
        <p role="alert" className="rounded-lg bg-alert/10 px-3 py-2 text-sm text-alert">{state.error}</p>
      )}

      <button type="submit" disabled={pending} className="btn btn-primary w-full !py-3 disabled:opacity-60">
        {pending ? "Creating your club…" : "Create account"}
      </button>
    </form>
  );
}
