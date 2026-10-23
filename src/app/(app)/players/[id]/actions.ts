"use server";

import crypto from "node:crypto";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { getManageablePlayer, getViewablePlayer } from "@/lib/access";
import { audit } from "@/lib/audit";
import { notifyFamily } from "@/lib/notify";

export async function addCheckIn(playerId: string, form: FormData) {
  const user = await requireUser();
  await getViewablePlayer(user, playerId);
  const data = z
    .object({ planId: z.string(), note: z.string().trim().min(2).max(600), effort: z.coerce.number().int().min(1).max(5) })
    .parse(Object.fromEntries(form));
  const plan = await db.developmentPlan.findFirst({ where: { id: data.planId, playerId } });
  if (!plan) throw new Error("Plan not found");
  await db.checkIn.create({ data: { planId: plan.id, authorId: user.id, note: data.note, effort: data.effort } });
  revalidatePath(`/players/${playerId}`);
}

export async function addNote(playerId: string, form: FormData) {
  const user = await requireUser(["ADMIN", "CLUB", "COACH"]);
  await getManageablePlayer(user, playerId);
  const data = z
    .object({ body: z.string().trim().min(2).max(1200), visibility: z.enum(["FAMILY", "STAFF"]) })
    .parse(Object.fromEntries(form));
  await db.note.create({ data: { playerId, authorId: user.id, ...data } });
  if (data.visibility === "FAMILY") {
    await notifyFamily(playerId, {
      kind: "NOTE",
      title: `New note from ${user.name}`,
      body: data.body.length > 140 ? `${data.body.slice(0, 137)}…` : data.body,
      href: `/players/${playerId}`,
    });
  }
  revalidatePath(`/players/${playerId}`);
}

export async function updateGoalProgress(playerId: string, form: FormData) {
  const user = await requireUser(["ADMIN", "CLUB", "COACH"]);
  await getManageablePlayer(user, playerId);
  const data = z.object({ goalId: z.string(), current: z.coerce.number() }).parse(Object.fromEntries(form));
  await db.planGoal.updateMany({ where: { id: data.goalId, plan: { playerId } }, data: { current: data.current } });
  revalidatePath(`/players/${playerId}`);
}

export type InviteState = { link?: string; error?: string };

export async function createInvite(playerId: string, _: InviteState, form: FormData): Promise<InviteState> {
  const user = await requireUser(["ADMIN", "CLUB", "COACH"]);
  const player = await getManageablePlayer(user, playerId);
  const parsed = z
    .object({ email: z.string().trim().toLowerCase().email(), relation: z.enum(["PARENT", "SELF"]) })
    .safeParse(Object.fromEntries(form));
  if (!parsed.success) return { error: "Enter a valid email address." };
  if (!player.consentAt && parsed.data.relation === "SELF") {
    return { error: "Record guardian consent before giving the player their own account." };
  }
  const token = crypto.randomBytes(24).toString("base64url");
  await db.invite.create({
    data: {
      token,
      email: parsed.data.email,
      relation: parsed.data.relation,
      playerId,
      createdById: user.id,
      expiresAt: new Date(Date.now() + 7 * 86_400_000),
    },
  });
  await audit(user.id, "INVITE_CREATED", `player:${playerId}`, `${parsed.data.relation} ${parsed.data.email}`);
  revalidatePath(`/players/${playerId}`);
  return { link: `/invite/${token}` };
}

export async function revokeAccess(playerId: string, form: FormData) {
  const user = await requireUser(["ADMIN", "CLUB", "COACH"]);
  await getManageablePlayer(user, playerId);
  const userId = z.string().parse(form.get("userId"));
  await db.playerAccess.deleteMany({ where: { playerId, userId } });
  await audit(user.id, "ACCESS_REVOKED", `player:${playerId}`, userId);
  revalidatePath(`/players/${playerId}`);
}

export async function recordConsent(playerId: string) {
  const user = await requireUser(["ADMIN", "CLUB", "COACH"]);
  await getManageablePlayer(user, playerId);
  await db.player.update({ where: { id: playerId }, data: { consentAt: new Date() } });
  await audit(user.id, "CONSENT_RECORDED", `player:${playerId}`);
  revalidatePath(`/players/${playerId}`);
}
