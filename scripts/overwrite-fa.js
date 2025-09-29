const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  await prisma.lot.update({
    where: { id: "kitchen-1" },
    data: {
      title: "لوازم آشپزخانه — محمولهٔ پایلوت",
      category: "لوازم خانه",
      description: "۸ پالت، ۱۲٬۰۰۰ عدد قاشق و چنگال — تحویل: انبار منطقه آزاد چابهار",
    },
  });

  await prisma.lot.update({
    where: { id: "apparel-1" },
    data: {
      title: "پوشاک — سری مخلوط",
      category: "پوشاک",
      description: "سری منتخب برای پایلوت؛ تحویل: انبار چابهار",
      // در صورت نیاز:
      // imageUrl: "/placeholder.png",
    },
  });

  console.log("✅ Persian fields overwritten.");
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => { console.error(e); return prisma.$disconnect(); })
  .finally(() => process.exit(0));