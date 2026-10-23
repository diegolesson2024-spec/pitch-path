"use server";

import bcrypt from "bcryptjs";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "@/lib/db";
import { endSession, startSession } from "@/lib/auth";
import { audit } from "@/lib/audit";
import { rateLimit } from "@/lib/rate-limit";

const schema = z.object({
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(1).max(200),
  next: z.string().optional(),
});

export type LoginState = { error?: string };

const DUMMY_HASH = bcrypt.hashSync("timing-equaliser-not-a-real-password", 10);

// Only allow redirects back into the app, never to another site.
function safeNext(next?: string) {
  return next && next.startsWith("/") && !next.startsWith("//") ? next : "/dashboard";
}

export async function login(_: LoginState, form: FormData): Promise<LoginState> {
  const parsed = schema.safeParse(Object.fromEntries(form));
  if (!parsed.success) return { error: "Enter your email and password." };

  const ip = (await headers()).get("x-forwarded-for")?.split(",")[0] ?? "local";
  const limit = rateLimit(`login:${parsed.data.email}:${ip}`);
  if (!limit.ok) return { error: `Too many attempts. Try again in ${limit.retryInMin} minutes.` };

  const user = await db.user.findUnique({ where: { email: parsed.data.email } });
  // Always run bcrypt so response time doesn't reveal whether the email exists.
  const ok = await bcrypt.compare(parsed.data.password, user?.passwordHash ?? DUMMY_HASH);
  if (!user || !ok) return { error: "That email and password don't match." };

  await startSession(user);
  await audit(user.id, "LOGIN", user.email);
  redirect(safeNext(parsed.data.next));
}

const DEMO_ACCOUNTS: Record<string, string> = {
  COACH: "coach@riverside.demo",
  PARENT: "parent@riverside.demo",
  PLAYER: "maya@riverside.demo",
  CLUB: "director@riverside.demo",
  ADMIN: "admin@pitchpath.demo",
};

export async function demoLogin(form: FormData) {
  if (process.env.DEMO_MODE !== "true") redirect("/login");
  const email = DEMO_ACCOUNTS[String(form.get("role"))];
  const user = email ? await db.user.findUnique({ where: { email } }) : null;
  if (!user) redirect("/login");
  await startSession(user);
  await audit(user.id, "LOGIN", user.email, "demo");
  redirect("/dashboard");
}

export async function logout() {
  await endSession();
  redirect("/login");
}
