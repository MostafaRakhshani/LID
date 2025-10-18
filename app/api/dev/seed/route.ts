import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { LotStatus } from "@prisma/client";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const token = url.searchParams.get("token") || "";
    const inProd = process.env.NODE_ENV === "production";
    const seedEnabled = process.env.ENABLE_SEED === "true";
    if (inProd && !seedEnabled) {
      if (!process.env.SEED_TOKEN || token !== process.env.SEED_TOKEN) {
        return new NextResponse("forbidden", { status: 403 });
      }
    }
    const now = Date.now();
    const lots = [
      {
        id: "kitchen-1",
        title: "لوازم آشپزخانه — چابهار",
        category: "لوازم خانه",
        basePrice: 50_000_000,
        currentPrice: 50_000_000,
        startAt: new Date(now - 60_000),
        endAt: new Date(now + 60 * 60 * 1000),
        imageUrl: "/lots/spoon.JPG",
        description: "آزمون...",
        status: LotStatus.OPEN,
      },
      {
        id: "vacuum-1",
        title: "پوشاک — سری مخلوط",
        category: "پوشاک",
        basePrice: 30_000_000,
        currentPrice: 30_000_000,
        startAt: new Date(now - 60_000),
        endAt: new Date(now + 2 * 60 * 60 * 1000),
        imageUrl: "/placeholder.png",
        description: "آزمون...",
        status: LotStatus.OPEN,
      },
    ];
    for (const l of lots) {
      await prisma.lot.upsert({ where: { id: l.id }, update: l, create: l });
    }
    return NextResponse.json({ ok: true, inserted: lots.map((l) => l.id) });
  } catch (err) {
    console.error("seed error", err);
    return new NextResponse("seed failed", { status: 500 });
  }
}
