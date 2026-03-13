import * as PrismaRuntime from "@prisma/client";

type GeneratedPrismaModule = typeof import("../node_modules/.prisma/client/default");

const generatedPrisma = PrismaRuntime as unknown as GeneratedPrismaModule;

export const PrismaClient = generatedPrisma.PrismaClient;
export const Prisma = generatedPrisma.Prisma;

export type PrismaClientInstance = InstanceType<GeneratedPrismaModule["PrismaClient"]>;
