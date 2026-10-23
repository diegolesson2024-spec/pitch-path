"use server";

import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "@/lib/db";
import { endSession, requireUser, startSession } from "@/lib/auth";
import { audit } from "@/lib/audit";
import { rateLimit } from "@/lib/rate-limit";

export type PasswordState = { ok?: string; error?: string };

const schema = z
  .object({
    current: z.string().min(1, "Enter your current password."),
    next: z.string().min(10, "New password must be at least 10 characters.").max(200),
    confirm: z.string(),
  })
  .refine((d) => d.next === d.confirm, { message: "The new passwords don't match.", path: ["confirm"] })
  .refine((d) => d.next !== d.current, { message: "Choose a password you haven't used here.", path: ["next"] });

export async function changePassword(_: PasswordState, form: FormData): Promise<PasswordState> {
  const me = await requireUser();
  const limit = rateLimit(`password:${me.id}`, 5);
  if (!limit.ok) return { error: `Too many attempts. Try again in ${limit.retryInMin} minutes.` };

  const parsed = schema.safeParse(Object.fromEntries(form));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Check the form." };

  const user = await db.user.findUniqueOrThrow({ where: { id: me.id } });
  if (!(await bcrypt.compare(parsed.data.current, user.passwordHash))) return { error: "Your current password isn't right." };

  // New hash + bumped session version signs out every other device; this one gets a fresh session.
  const updated = await db.user.update({
    where: { id: user.id },
    data: { passwordHash: await bcrypt.hash(parsed.data.next, 12), sessionVersion: { increment: 1 } },
  });
  await startSession(updated);
  await audit(user.id, "PASSWORD_CHANGED", `user:${user.id}`);
  return { ok: "Password changed. You've been signed out on your other devices." };
}

export async function signOutEverywhere() {
  const me = await requireUser();
  await db.user.update({ where: { id: me.id }, data: { sessionVersion: { increment: 1 } } });
  await audit(me.id, "SIGNED_OUT_EVERYWHERE", `user:${me.id}`);
  await endSession();
  redirect("/login");
}
