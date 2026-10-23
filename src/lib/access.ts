// Every query for player data goes through these scopes. Players are minors, so
// the rule is: you only see a profile if your role and relationship allow it.
import "server-only";
import { notFound } from "next/navigation";
import type { Prisma } from "@prisma/client";
import { db } from "./db";
import type { CurrentUser } from "./auth";

export function playerScope(user: CurrentUser): Prisma.PlayerWhereInput {
  switch (user.role) {
    case "ADMIN":
      return {};
    case "CLUB":
      return { clubId: user.clubId ?? "__none__" };
    case "COACH":
      return { clubId: user.clubId ?? "__none__", team: { coaches: { some: { userId: user.id } } } };
    case "PARENT":
    case "PLAYER":
      return { access: { some: { userId: user.id } } };
    default:
      return { id: "__none__" };
  }
}

export function teamScope(user: CurrentUser): Prisma.TeamWhereInput {
  switch (user.role) {
    case "ADMIN":
      return {};
    case "CLUB":
      return { clubId: user.clubId ?? "__none__" };
    case "COACH":
      return { coaches: { some: { userId: user.id } } };
    default:
      return { id: "__none__" };
  }
}

// Returns the player or a 404, so we never reveal that a profile exists.
export async function getViewablePlayer(user: CurrentUser, playerId: string) {
  const player = await db.player.findFirst({
    where: { AND: [{ id: playerId }, playerScope(user)] },
    include: { team: true, club: true },
  });
  if (!player) notFound();
  return player;
}

export async function getManageablePlayer(user: CurrentUser, playerId: string) {
  if (user.role === "PARENT" || user.role === "PLAYER") notFound();
  return getViewablePlayer(user, playerId);
}

export async function canManageTeam(user: CurrentUser, teamId: string) {
  const team = await db.team.findFirst({ where: { AND: [{ id: teamId }, teamScope(user)] } });
  return Boolean(team);
}
