import type { PrismaClient as PrismaClientType } from "@prisma/client";

const globalForPrisma = globalThis as {
  __prisma__?: unknown;
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
    return globalForPrisma.__prisma__ as PrismaClientType;
  }

  const [{ PrismaClient }, { PrismaNeon }] = await Promise.all([
    import("@prisma/client"),
    import("@prisma/adapter-neon")
  ]);

  const adapter = new PrismaNeon({
    connectionString: databaseUrl
  });

  const prisma = new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"]
  });

  if (process.env.NODE_ENV !== "production") {
    globalForPrisma.__prisma__ = prisma;
  }

  return prisma;
}
