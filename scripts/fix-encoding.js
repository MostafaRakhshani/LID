const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// تبدیل "Ù„Ùˆ..." به فارسی: latin1 -> utf8
function fix(s) {
  if (!s || typeof s !== "string") return s;
  return Buffer.from(s, "latin1").toString("utf8");
}

async function main() {
  const lots = await prisma.lot.findMany();
  for (const l of lots) {
    await prisma.lot.update({
      where: { id: l.id },
      data: {
        title: fix(l.title),
        category: fix(l.category),
        description: l.description ? fix(l.description) : null,
      },
    });
  }
  console.log("✅ Fixed encoding for", lots.length, "lots.");
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => { console.error(e); return prisma.$disconnect(); })
  .finally(() => process.exit(0));