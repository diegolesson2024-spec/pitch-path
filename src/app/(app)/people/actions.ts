"use server";

import crypto from "node:crypto";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { audit } from "@/lib/audit";

export type PeopleState = { error?: string; tempPassword?: string; email?: string; ok?: boolean };

export async function createStaff(_: PeopleState, form: FormData): Promise<PeopleState> {
  const user = await requireUser(["ADMIN", "CLUB"]);
  const parsed = z
    .object({
      name: z.string().trim().min(2).max(80),
      email: z.string().trim().toLowerCase().email(),
      role: z.enum(["COACH", "CLUB", "ADMIN"]),
      clubId: z.string().optional(),
    })
    .safeParse(Object.fromEntries(form));
  if (!parsed.success) return { error: "Check the name, email and role." };
  const d = parsed.data;
  if (d.role === "ADMIN" && user.role !== "ADMIN") return { error: "Only platform admins can create admins." };
  const clubId = user.role === "ADMIN" ? d.clubId || null : user.clubId;
  if (d.role !== "ADMIN" && !clubId) return { error: "Choose a club for this account." };
  if (await db.user.findUnique({ where: { email: d.email } })) return { error: "An account with that email already exists." };

  const tempPassword = crypto.randomBytes(9).toString("base64url");
  const created = await db.user.create({
    data: { name: d.name, email: d.email, role: d.role, clubId, passwordHash: await bcrypt.hash(tempPassword, 10) },
  });
  await audit(user.id, "USER_CREATED", `user:${created.id}`, `${d.role} ${d.email}`);
  revalidatePath("/people");
  return { tempPassword, email: d.email };
}

export async function createClub(_: PeopleState, form: FormData): Promise<PeopleState> {
  const user = await requireUser(["ADMIN"]);
  const parsed = z
    .object({ name: z.string().trim().min(2).max(80), shortName: z.string().trim().min(2).max(6), city: z.string().trim().min(2).max(60) })
    .safeParse(Object.fromEntries(form));
  if (!parsed.success) return { error: "Fill in all club fields." };
  const club = await db.club.create({ data: { ...parsed.data, shortName: parsed.data.shortName.toUpperCase() } });
  await audit(user.id, "CLUB_CREATED", `club:${club.id}`, club.name);
  revalidatePath("/people");
  return { ok: true };
}
