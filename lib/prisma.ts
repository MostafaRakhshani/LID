import { PrismaClient } from "@prisma/client";

// جلوی ساخت چندباره‌ی کلاینت در هات‌ریلود را می‌گیرد
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ["warn", "error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export default prisma;