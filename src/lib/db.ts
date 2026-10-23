import { PrismaClient } from "@prisma/client";
import path from "node:path";

// Relative SQLite URLs are resolved against the schema by the CLI but against the
// generated client at runtime, so anchor them to the project root explicitly.
export function databaseUrl() {
  const url = process.env.DATABASE_URL ?? "file:./dev.db";
  if (!url.startsWith("file:./")) return url;
  return `file:${path.join(process.cwd(), "prisma", url.slice("file:./".length))}`;
}

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const db = globalForPrisma.prisma ?? new PrismaClient({ datasourceUrl: databaseUrl() });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;
