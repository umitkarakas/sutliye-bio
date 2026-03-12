const globalForPrisma = globalThis as {
  __prisma__?: unknown;
};

export function hasDatabaseUrl() {
  return Boolean(process.env.DATABASE_URL);
}

export async function getPrisma() {
  if (!hasDatabaseUrl()) {
    throw new Error("DATABASE_URL is not configured.");
  }

  if (globalForPrisma.__prisma__) {
    return globalForPrisma.__prisma__ as import("@prisma/client").PrismaClient;
  }

  const { PrismaClient } = await import("@prisma/client");

  const prisma = new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"]
  });

  if (process.env.NODE_ENV !== "production") {
    globalForPrisma.__prisma__ = prisma;
  }

  return prisma;
}
