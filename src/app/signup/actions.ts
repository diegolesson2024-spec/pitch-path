"use server";

import bcrypt from "bcryptjs";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "@/lib/db";
import { startSession } from "@/lib/auth";
import { audit } from "@/lib/audit";
import { notifyUser } from "@/lib/notify";
import { rateLimit } from "@/lib/rate-limit";

// `values` refills the form after an error (passwords are deliberately not echoed back).
export type SignupState = {
  error?: string;
  field?: string;
  values?: { name: string; email: string; clubName: string; city: string; agree: boolean };
};

const schema = z
  .object({
    name: z.string().trim().min(2, "Enter your full name.").max(80),
    email: z.string().trim().toLowerCase().email("Enter a valid email address."),
    password: z.string().min(10, "Password must be at least 10 characters.").max(200),
    confirm: z.string(),
    clubName: z.string().trim().min(2, "Enter your club's name.").max(80),
    city: z.string().trim().min(2, "Enter your club's town or city.").max(60),
    agree: z.literal("on", { message: "Please confirm you'll get guardian consent before adding players." }),
    website: z.string().max(0).optional(), // honeypot: real people never fill this hidden field
  })
  .refine((d) => d.password === d.confirm, { message: "The passwords don't match.", path: ["confirm"] });

// "Riverside Athletic FC" -> "RAFC"
function shortNameFor(club: string) {
  const initials = club.split(/\s+/).filter(Boolean).map((w) => w[0]).join("").toUpperCase().replace(/[^A-Z0-9]/g, "");
  return (initials.length >= 2 ? initials : club.replace(/[^A-Za-z0-9]/g, "").toUpperCase()).slice(0, 6) || "CLUB";
}

export async function signup(_: SignupState, form: FormData): Promise<SignupState> {
  const text = (k: string) => String(form.get(k) ?? "").slice(0, 120);
  const values = { name: text("name"), email: text("email"), clubName: text("clubName"), city: text("city"), agree: form.get("agree") === "on" };

  const ip = (await headers()).get("x-forwarded-for")?.split(",")[0]?.trim() ?? "local";
  const limit = rateLimit(`signup:${ip}`, 5, 60 * 60 * 1000);
  if (!limit.ok) return { error: `Too many sign-ups from this network. Try again in ${limit.retryInMin} minutes.`, values };

  const parsed = schema.safeParse(Object.fromEntries(form));
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    // A filled honeypot means a bot; give it nothing useful.
    if (issue?.path[0] === "website") return { error: "Something went wrong. Please try again." };
    return { error: issue?.message ?? "Check the form and try again.", field: String(issue?.path[0] ?? ""), values };
  }
  const d = parsed.data;

  if (await db.user.findUnique({ where: { email: d.email } })) {
    return { error: "An account with this email already exists. Sign in instead.", field: "email", values };
  }

  const passwordHash = await bcrypt.hash(d.password, 12);
  const user = await db.$transaction(async (tx) => {
    const club = await tx.club.create({ data: { name: d.clubName, shortName: shortNameFor(d.clubName), city: d.city } });
    return tx.user.create({ data: { name: d.name, email: d.email, role: "CLUB", clubId: club.id, passwordHash } });
  });

  await audit(user.id, "SIGNUP", `user:${user.id}`, `${d.clubName} (${d.city})`);
  const admins = await db.user.findMany({ where: { role: "ADMIN" }, select: { id: true } });
  for (const a of admins) {
    await notifyUser(a.id, {
      kind: "NOTE",
      title: `New club signed up: ${d.clubName}`,
      body: `${d.name} (${d.email}) created ${d.clubName} in ${d.city}.`,
      href: "/people",
    });
  }

  await startSession(user);
  redirect("/dashboard?welcome=1");
}
