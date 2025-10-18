// app/api/bids/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { LotStatus } from "@prisma/client";
import { publish } from "@/lib/sse";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

const MIN_STEP = Number(process.env.MIN_BID_STEP ?? 100_000);

// تبدیل ارقام فارسی و حذف کاما/فاصله و... و تبدیل به عدد
function parseAmount(raw: unknown): number | null {
  if (typeof raw === "number") return Math.floor(raw);
  if (typeof raw === "string") {
    const fa = "۰۱۲۳۴۵۶۷۸۹";
    const normalized = raw
      .replace(/[,_\s\u066B\u066C]/g, "")
      .replace(/[۰-۹]/g, (d) => String(fa.indexOf(d)));
    const n = Number(normalized);
    return Number.isFinite(n) ? Math.floor(n) : null;
  }
  return null;
}

export async function POST(req: Request) {
  try {
    const data = await req.json().catch(() => null);
    const lotId = data?.lotId as string | undefined;
    const amount = parseAmount(data?.amount);

    if (typeof lotId !== "string" || amount === null) {
      return NextResponse.json(
        { ok: false, error: "INVALID_BODY", hint: "need lotId:string & amount:number" },
        { status: 422 }
      );
    }

    const lot = await prisma.lot.findUnique({
      where: { id: lotId },
      select: { id: true, status: true, basePrice: true, currentPrice: true, endAt: true, title: true },
    });
    if (!lot) return NextResponse.json({ ok: false, error: "NOT_FOUND" }, { status: 404 });

    const now = Date.now();
    if (lot.status !== LotStatus.OPEN) {
      return NextResponse.json({ ok: false, error: "CLOSED" }, { status: 422 });
    }
    if (lot.endAt && now >= new Date(lot.endAt).getTime()) {
      return NextResponse.json({ ok: false, error: "ENDED" }, { status: 422 });
    }

    const minAcceptable = Math.max((lot.currentPrice ?? 0) + MIN_STEP, lot.basePrice);
    if (amount < minAcceptable) {
      return NextResponse.json(
        { ok: false, error: "LOW_AMOUNT", minAcceptable, step: MIN_STEP },
        { status: 422 }
      );
    }
    if (amount % MIN_STEP !== 0) {
      return NextResponse.json(
        { ok: false, error: "STEP_MISMATCH", step: MIN_STEP },
        { status: 422 }
      );
    }

    // ثبت بید
    const bid = await prisma.bid.create({
      data: { lotId, amount },
      select: { id: true, amount: true, createdAt: true },
    });

    // افزایش قیمت و تمدید خودکار ۲ دقیقه‌ای در صورت نیاز
    let newEndAt = lot.endAt ? new Date(lot.endAt) : null;
    if (newEndAt) {
      const remaining = newEndAt.getTime() - now;
      if (remaining <= 2 * 60_000) newEndAt = new Date(now + 2 * 60_000);
    }

    const updatedLot = await prisma.lot.update({
      where: { id: lotId },
      data: { currentPrice: amount, ...(newEndAt ? { endAt: newEndAt } : {}) },
      select: { id: true, title: true, status: true, basePrice: true, currentPrice: true, endAt: true },
    });

    // 🔔 انتشار رویداد برای صفحهٔ جزئیات و لیست
    publish(`lot:${lotId}`, { type: "bid", bid, lot: updatedLot });
    publish("lots",         { type: "lot_updated", lot: updatedLot });

    return NextResponse.json({ ok: true, bid, lot: updatedLot });
  } catch (e) {
    console.error(e);
    return new NextResponse("server_error", { status: 500 });
  }
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const lotId = url.searchParams.get("lotId");

  if (!lotId) {
    const lots = await prisma.lot.findMany({
      orderBy: { createdAt: "desc" },
      select: { id: true, title: true, status: true, basePrice: true, currentPrice: true, endAt: true },
    });
    return NextResponse.json({ lots });
  }

  const lot = await prisma.lot.findUnique({
    where: { id: lotId },
    select: { id: true, title: true, status: true, basePrice: true, currentPrice: true, endAt: true },
  });
  const bids = await prisma.bid.findMany({
    where: { lotId },
    orderBy: { amount: "desc" },
    select: { id: true, amount: true, createdAt: true },
  });

  return NextResponse.json({ lot, bids });
}
