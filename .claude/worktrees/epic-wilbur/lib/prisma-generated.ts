export { PrismaClient, Prisma } from "@/lib/generated/prisma/client";

export type PrismaClientInstance = InstanceType<
  typeof import("@/lib/generated/prisma/client").PrismaClient
>;
