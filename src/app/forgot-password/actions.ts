"use server";

import { headers } from "next/headers";
import { z } from "zod";
import { db } from "@/lib/db";
import { audit } from "@/lib/audit";
import { emailConfigured, sendEmail } from "@/lib/email";
import { rateLimit } from "@/lib/rate-limit";
import { newResetToken } from "@/lib/reset-token";
import { siteUrl } from "@/lib/site";

export type ForgotState = { sent?: boolean; error?: string };

// Same reply whether or not the email has an account, so this can't be used to discover accounts.
const SENT: ForgotState = { sent: true };

export async function requestReset(_: ForgotState, form: FormData): Promise<ForgotState> {
  const parsed = z.string().trim().toLowerCase().email().safeParse(form.get("email"));
  if (!parsed.success) return { error: "Enter the email address you sign in with." };
  const email = parsed.data;

  const ip = (await headers()).get("x-forwarded-for")?.split(",")[0]?.trim() ?? "local";
  if (!rateLimit(`forgot-ip:${ip}`, 5, 15 * 60 * 1000).ok) return { error: "Too many requests. Please wait a few minutes and try again." };
  if (!rateLimit(`forgot-email:${email}`, 3, 60 * 60 * 1000).ok) return SENT;

  const user = await db.user.findUnique({ where: { email } });
  if (!user) return SENT;

  // Only the newest link works.
  await db.passwordResetToken.deleteMany({ where: { userId: user.id, usedAt: null } });
  const { token, tokenHash, expiresAt } = newResetToken();
  await db.passwordResetToken.create({ data: { userId: user.id, tokenHash, expiresAt } });
  const link = `${siteUrl()}/reset-password/${token}`;

  if (emailConfigured()) {
    try {
      await sendEmail({
        to: user.email,
        subject: "Reset your PitchPath password",
        text: `Hi ${user.name},\n\nUse this link to choose a new PitchPath password. It works once and expires in 1 hour:\n\n${link}\n\nIf you didn't ask for this, you can ignore this email; your password won't change.`,
        html: `<p>Hi ${escapeHtml(user.name)},</p><p>Use this link to choose a new PitchPath password. It works once and expires in 1 hour:</p><p><a href="${link}">Reset my password</a></p><p>If you didn't ask for this, you can ignore this email; your password won't change.</p>`,
      });
    } catch (e) {
      console.error("Password reset email failed", e);
      return { error: "We couldn't send the email just now. Please try again later, or ask your club to reset your password." };
    }
  } else if (process.env.NODE_ENV !== "production") {
    // Local development without an email provider: print the link for testing.
    console.log(`[dev] Password reset link for ${user.email}: ${link}`);
  }

  await audit(user.id, "PASSWORD_RESET_REQUESTED", `user:${user.id}`);
  return SENT;
}

function escapeHtml(s: string) {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
}
