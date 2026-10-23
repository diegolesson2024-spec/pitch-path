"use server";

import bcrypt from "bcryptjs";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { rateLimit } from "@/lib/rate-limit";
import { z } from "zod";
import { db } from "@/lib/db";
import { startSession } from "@/lib/auth";
import { audit } from "@/lib/audit";

export type AcceptState = { error?: string };

export async function acceptInvite(token: string, _: AcceptState, form: FormData): Promise<AcceptState> {
  const ip = (await headers()).get("x-forwarded-for")?.split(",")[0] ?? "local";
  const limit = rateLimit(`invite:${token}:${ip}`, 8);
  if (!limit.ok) return { error: `Too many attempts. Try again in ${limit.retryInMin} minutes.` };
  const invite = await db.invite.findUnique({ where: { token }, include: { player: true } });
  if (!invite || invite.usedAt || invite.expiresAt < new Date()) return { error: "This invite is no longer valid." };

  const password = String(form.get("password") ?? "");
  let user = await db.user.findUnique({ where: { email: invite.email } });

  if (user) {
    if (!(await bcrypt.compare(password, user.passwordHash))) return { error: "That password isn't right." };
    if (user.role !== "PARENT" && user.role !== "PLAYER") return { error: "Staff accounts can't be linked to a family invite." };
  } else {
    const parsed = z.object({ name: z.string().trim().min(2).max(80), password: z.string().min(10).max(200) }).safeParse({ name: form.get("name"), password });
    if (!parsed.success) return { error: "Enter your name and a password of at least 10 characters." };
    user = await db.user.create({
      data: {
        email: invite.email,
        name: parsed.data.name,
        role: invite.relation === "SELF" ? "PLAYER" : "PARENT",
        clubId: invite.player.clubId,
        passwordHash: await bcrypt.hash(parsed.data.password, 10),
      },
    });
  }

  await db.$transaction([
    db.playerAccess.upsert({
      where: { userId_playerId: { userId: user.id, playerId: invite.playerId } },
      create: { userId: user.id, playerId: invite.playerId, relation: invite.relation },
      update: {},
    }),
    db.invite.update({ where: { id: invite.id }, data: { usedAt: new Date() } }),
  ]);
  await audit(user.id, "INVITE_ACCEPTED", `player:${invite.playerId}`, invite.relation);
  await startSession(user);
  redirect("/dashboard");
}
