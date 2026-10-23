"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { teamScope } from "@/lib/access";
import { audit } from "@/lib/audit";
import { POSITIONS } from "@/lib/skills";

const POS = POSITIONS.map((p) => p.key) as [string, ...string[]];
const optionalInt = z.preprocess((v) => (v === "" || v == null ? undefined : v), z.coerce.number().int().optional());

const schema = z.object({
  firstName: z.string().trim().min(1).max(60),
  lastName: z.string().trim().min(1).max(60),
  dateOfBirth: z.coerce.date(),
  teamId: z.string().min(1),
  position: z.enum(POS),
  secondaryPos: z.preprocess((v) => (v === "" ? undefined : v), z.enum(POS).optional()),
  dominantFoot: z.enum(["Right", "Left", "Both"]),
  shirtNumber: optionalInt,
  heightCm: optionalInt,
  weightKg: optionalInt,
  consent: z.string().optional(),
});

export async function createPlayer(form: FormData) {
  const user = await requireUser(["ADMIN", "CLUB", "COACH"]);
  const data = schema.parse(Object.fromEntries(form));
  const team = await db.team.findFirst({ where: { AND: [{ id: data.teamId }, teamScope(user)] } });
  if (!team) throw new Error("You can't add players to that team.");

  const player = await db.player.create({
    data: {
      clubId: team.clubId,
      teamId: team.id,
      firstName: data.firstName,
      lastName: data.lastName,
      dateOfBirth: data.dateOfBirth,
      position: data.position,
      secondaryPos: data.secondaryPos ?? null,
      dominantFoot: data.dominantFoot,
      shirtNumber: data.shirtNumber,
      heightCm: data.heightCm,
      weightKg: data.weightKg,
      avatarHue: 190 + Math.floor(Math.random() * 70),
      consentAt: data.consent ? new Date() : null,
    },
  });
  await audit(user.id, "PLAYER_CREATED", `player:${player.id}`, `${player.firstName} ${player.lastName}`);
  redirect(`/players/${player.id}/evaluate`);
}
