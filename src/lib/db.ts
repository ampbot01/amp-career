import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

function createClient() {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    console.warn("DATABASE_URL environment variable is not defined!");
  }

  const pool = new Pool({
    connectionString: connectionString || undefined,
    ssl: connectionString?.includes("supabase") || connectionString?.includes("pooler")
      ? { rejectUnauthorized: false }
      : undefined,
    max: 10,
    connectionTimeoutMillis: 15000,
    idleTimeoutMillis: 30000,
  });

  const adapter = new PrismaPg(pool);
  return new PrismaClient({ adapter });
}

export const prisma = globalForPrisma.prisma ?? createClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

