import "server-only";
import { cache } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "./db";
import { SESSION_COOKIE, SESSION_TTL_SECONDS, signSession, verifySession } from "./session";
import type { Role } from "./skills";

export type CurrentUser = {
  id: string;
  email: string;
  name: string;
  role: Role;
  clubId: string | null;
  clubName: string | null;
};

export const getCurrentUser = cache(async (): Promise<CurrentUser | null> => {
  const store = await cookies();
  const session = await verifySession(store.get(SESSION_COOKIE)?.value);
  if (!session) return null;
  const user = await db.user.findUnique({ where: { id: session.uid }, include: { club: true } });
  // A changed password or "sign out everywhere" bumps sessionVersion and invalidates older cookies.
  if (!user || user.sessionVersion !== session.sv) return null;
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role as Role,
    clubId: user.clubId,
    clubName: user.club?.name ?? null,
  };
});

export async function requireUser(roles?: Role[]): Promise<CurrentUser> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (roles && !roles.includes(user.role)) redirect("/dashboard");
  return user;
}

export async function startSession(user: { id: string; role: string; sessionVersion: number }) {
  const token = await signSession({ uid: user.id, role: user.role, sv: user.sessionVersion });
  const store = await cookies();
  store.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_TTL_SECONDS,
  });
  await db.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } });
}

export async function endSession() {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
}

export const isStaff = (u: CurrentUser) => u.role === "ADMIN" || u.role === "CLUB" || u.role === "COACH";
export const isFamily = (u: CurrentUser) => u.role === "PARENT" || u.role === "PLAYER";
