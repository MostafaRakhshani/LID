const { PrismaClient, LotStatus } = require("@prisma/client");
const prisma = new PrismaClient();

function fromNowMinutes(min) {
  return new Date(Date.now() + min * 60 * 1000);
}

async function main() {
  // دو لات نمونه
  const lots = [
    {
      id: "kitchen-1",
      title: "لوازم آشپزخانه — محموله پلایوت",
      category: "لوازم خانه",
      basePrice: 50_000_000,
      currentPrice: 50_000_000,
      startAt: new Date(),
      endAt: fromNowMinutes(60), // یک ساعت بعد
      imageUrl: "/lots/spoon.jpg",
      description: "محموله‌ی آزمایشی برای MVP",
      status: LotStatus.OPEN,
    },
    {
      id: "shaver-1",
      title: "پوشاک — سری مخلوط",
      category: "پوشاک",
      basePrice: 30_000_000,
      currentPrice: 30_000_000,
      startAt: new Date(),
      endAt: fromNowMinutes(45),
      imageUrl: "/placeholder.png",
      description: "برای تست جریان مزایده",
      status: LotStatus.OPEN,
    },
  ];

  for (const l of lots) {
    await prisma.lot.upsert({
      where: { id: l.id },
      update: l,
      create: l,
    });
  }
  console.log("Seed done.");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
