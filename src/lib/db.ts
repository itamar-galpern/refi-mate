// creates a single prismaclient instance to be used across all files
import { PrismaClient } from "@prisma/client";

// Trick: stash Prisma in globalThis so it survives hot reload
const globalForPrisma = global as unknown as { prisma: PrismaClient };

// If we already created one, reuse it; otherwise, create a new one.
export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === "development"
      ? ["query", "error", "warn"]
      : ["error"],
  });

// Save back into globalThis if not production
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
