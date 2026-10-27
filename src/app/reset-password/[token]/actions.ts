"use server";

import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "@/lib/db";
import { audit } from "@/lib/audit";
import { findValidResetToken } from "@/lib/password-reset";

export type ResetState = { error?: string };

const schema = z
  .object({
    password: z.string().min(10, "Password must be at least 10 characters.").max(200),
    confirm: z.string(),
  })
  .refine((d) => d.password === d.confirm, { message: "The passwords don't match.", path: ["confirm"] });

export async function resetPassword(token: string, _: ResetState, form: FormData): Promise<ResetState> {
  const row = await findValidResetToken(token);
  if (!row) return { error: "This link has expired or was already used. Request a new one." };

  const parsed = schema.safeParse(Object.fromEntries(form));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Check the form." };

  await db.$transaction([
    db.user.update({
      where: { id: row.userId },
      // New password and a new session version: every existing sign-in is ended.
      data: { passwordHash: await bcrypt.hash(parsed.data.password, 12), sessionVersion: { increment: 1 } },
    }),
    db.passwordResetToken.update({ where: { id: row.id }, data: { usedAt: new Date() } }),
    db.passwordResetToken.deleteMany({ where: { userId: row.userId, usedAt: null } }),
  ]);
  await audit(row.userId, "PASSWORD_RESET_COMPLETED", `user:${row.userId}`);
  redirect("/login?reset=1");
}
