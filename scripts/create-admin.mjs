// Creates the first platform admin on a fresh database.
//   npm run create-admin -- --email you@example.com --name "Your Name"
// Prints a one-time temporary password; sign in and change it on the Account page.
// Plain Node (no dev dependencies) so it runs in a production shell such as Render's.
import crypto from "node:crypto";
import path from "node:path";
import bcrypt from "bcryptjs";
import prismaPkg from "@prisma/client";

const { PrismaClient } = prismaPkg;

function arg(name) {
  const i = process.argv.indexOf(`--${name}`);
  return i > -1 ? process.argv[i + 1] : undefined;
}

// Same rule as src/lib/db.ts: relative SQLite paths resolve from prisma/.
function databaseUrl() {
  const url = process.env.DATABASE_URL ?? "file:./dev.db";
  if (!url.startsWith("file:./")) return url;
  return `file:${path.join(process.cwd(), "prisma", url.slice("file:./".length))}`;
}

const email = arg("email")?.trim().toLowerCase();
const name = arg("name")?.trim();
if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email) || !name) {
  console.error('Usage: npm run create-admin -- --email you@example.com --name "Your Name"');
  process.exit(1);
}

const db = new PrismaClient({ datasourceUrl: databaseUrl() });
try {
  if (await db.user.findUnique({ where: { email } })) {
    console.error(`An account for ${email} already exists. Nothing changed.`);
    process.exit(1);
  }
  const password = crypto.randomBytes(12).toString("base64url");
  await db.user.create({ data: { email, name, role: "ADMIN", passwordHash: await bcrypt.hash(password, 12) } });
  await db.auditLog.create({ data: { action: "USER_CREATED", target: `user:${email}`, detail: "ADMIN via create-admin script" } });
  console.log(`Created platform admin ${email}.`);
  console.log(`Temporary password (shown once): ${password}`);
  console.log("Sign in, then change it on the Account page.");
} finally {
  await db.$disconnect();
}
