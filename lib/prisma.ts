import { PrismaNeon } from "@prisma/adapter-neon";
import { PrismaClient } from "@/lib/prisma-generated";

function createPrismaClient(databaseUrl: string) {
  const adapter = new PrismaNeon({
    connectionString: databaseUrl
  });

  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"]
  });
}

type PrismaClientInstance = ReturnType<typeof createPrismaClient>;

const globalForPrisma = globalThis as {
  __prisma__?: PrismaClientInstance;
};

export function hasDatabaseUrl() {
  return Boolean(process.env.DATABASE_URL);
}

export async function getPrisma() {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    throw new Error("DATABASE_URL is not configured.");
  }

  if (globalForPrisma.__prisma__) {
    return globalForPrisma.__prisma__;
  }

  const prisma = createPrismaClient(databaseUrl);

  if (process.env.NODE_ENV !== "production") {
    globalForPrisma.__prisma__ = prisma;
  }

  return prisma;
}
