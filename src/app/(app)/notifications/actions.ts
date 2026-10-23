"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";

export async function markAllRead() {
  const user = await requireUser();
  await db.notification.updateMany({ where: { userId: user.id, readAt: null }, data: { readAt: new Date() } });
  revalidatePath("/", "layout");
}

// Marks one notification read and follows its link.
export async function openNotification(form: FormData) {
  const user = await requireUser();
  const id = z.string().parse(form.get("id"));
  const n = await db.notification.findFirst({ where: { id, userId: user.id } });
  if (!n) redirect("/notifications");
  if (!n.readAt) await db.notification.update({ where: { id }, data: { readAt: new Date() } });
  // Only follow internal links.
  redirect(n.href.startsWith("/") && !n.href.startsWith("//") ? n.href : "/dashboard");
}
