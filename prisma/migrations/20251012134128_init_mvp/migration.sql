-- CreateEnum
CREATE TYPE "LotStatus" AS ENUM ('OPEN', 'CLOSED');

-- CreateTable
CREATE TABLE "Lot" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "status" "LotStatus" NOT NULL DEFAULT 'OPEN',
    "basePrice" INTEGER NOT NULL,
    "currentPrice" INTEGER NOT NULL,
    "endAt" TIMESTAMP(3),
    "imageUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Lot_pkey" PRIMARY KEY ("id")
);
