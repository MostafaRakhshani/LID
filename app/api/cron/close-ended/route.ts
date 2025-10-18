import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { LotStatus } from "@prisma/client";
import { publish } from "@/lib/sse";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(req: Request) {
  const url = new URL(req.url);
  const token = url.searchParams.get("token");
  if (!process.env.CRON_SECRET || token !== process.env.CRON_SECRET) {
    return new NextResponse("forbidden", { status: 403 });
  }

  const now = new Date();
  const toClose = await prisma.lot.findMany({
    where: {
      status: LotStatus.OPEN,
      endAt: { lte: now },
    },
    select: { id: true },
  });

  const results: any[] = [];
  for (const l of toClose) {
    const top = await prisma.bid.findFirst({
      where: { lotId: l.id },
      orderBy: { amount: "desc" },
      select: { id: true, amount: true },
    });

    const updated = await prisma.lot.update({
      where: { id: l.id },
      data: {
        status: LotStatus.CLOSED,
        winnerBidId: top?.id ?? null,
        ...(top ? { currentPrice: top.amount } : {}),
      },
      select: { id: true, title: true, status: true, currentPrice: true, winnerBidId: true, endAt: true },
    });

    results.push({ id: updated.id, winnerBidId: updated.winnerBidId, currentPrice: updated.currentPrice });

    // 🔔 انتشار برای جزئیات و لیست
    publish(`lot:${l.id}`, { type: "closed", lot: updated, winnerBidId: updated.winnerBidId });
    publish("lots",        { type: "lot_updated", lot: updated });
  }

  return NextResponse.json({ ok: true, count: results.length, closed: results });
}
