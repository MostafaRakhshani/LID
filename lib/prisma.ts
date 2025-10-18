import { PrismaClient } from "@prisma/client";

// الگوی singleton برای جلوگیری از ساخت چند کلاینت در HMR
declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

export const prisma: PrismaClient =
  global.prisma ??
  new PrismaClient({
    // لاگ‌ها اگر خواستی فعال کن:
    // log: ["query", "error", "warn"],
  });

if (process.env.NODE_ENV !== "production") global.prisma = prisma;
