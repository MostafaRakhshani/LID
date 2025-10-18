const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  const now = Date.now();

  const lots = [
    {
      id: "LOT-001",
      title: "محمولهٔ آزمایشی ۱",
      status: "OPEN",
      basePrice: 5000000,
      currentPrice: 5000000,
      endAt: new Date(now + 2 * 60 * 60 * 1000), // 2 ساعت دیگر
      imageUrl: "/lots/sample-1.jpg",
    },
    {
      id: "LOT-002",
      title: "محمولهٔ آزمایشی ۲",
      status: "OPEN",
      basePrice: 2500000,
      currentPrice: 2500000,
      endAt: new Date(now + 3 * 60 * 60 * 1000),
      imageUrl: "/lots/sample-2.jpg",
    },
    {
      id: "LOT-003",
      title: "محمولهٔ بسته‌شده",
      status: "CLOSED",
      basePrice: 7500000,
      currentPrice: 8200000,
      endAt: new Date(now - 24 * 60 * 60 * 1000), // دیروز
      imageUrl: "/lots/sample-3.jpg",
    },
  ];

  for (const l of lots) {
    await prisma.lot.upsert({
      where: { id: l.id },
      update: l,
      create: l,
    });
  }
  console.log("✅ Seed completed");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
