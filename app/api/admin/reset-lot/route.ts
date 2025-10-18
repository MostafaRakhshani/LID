import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { LotStatus } from "@prisma/client";
import { publish } from "@/lib/sse";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

function parseBasic(auth: string | null) {
  if (!auth || !auth.startsWith("Basic ")) return { ok: false as false };
  try {
    const decoded = Buffer.from(auth.slice(6), "base64").toString("utf8");
    const i = decoded.indexOf(":");
    const user = i >= 0 ? decoded.slice(0, i) : decoded;
    const pass = i >= 0 ? decoded.slice(i + 1) : "";
    const ok =
      !!process.env.ADMIN_USER &&
      !!process.env.ADMIN_PASS &&
      user === process.env.ADMIN_USER &&
      pass === process.env.ADMIN_PASS;
    return ok ? { ok: true as true, user } : { ok: false as false };
  } catch {
    return { ok: false as false };
  }
}

async function handler(req: Request) {
  const auth = parseBasic(req.headers.get("authorization"));
  if (!auth.ok) {
    return new NextResponse("Auth required", { status: 401, headers: { "WWW-Authenticate": "Basic" } });
  }

  const url = new URL(req.url);
  let id: string | undefined = url.searchParams.get("id") ?? undefined;
  let minutesStr: string | undefined = url.searchParams.get("minutes") ?? undefined;

  if (req.method === "POST") {
    try {
      const body = await req.json().catch(() => null);
      if (body && typeof body === "object") {
        if (!id && typeof (body as any).id === "string") id = (body as any).id;
        if (!minutesStr && (typeof (body as any).minutes === "string" || typeof (body as any).minutes === "number")) {
          minutesStr = String((body as any).minutes);
        }
      }
    } catch {}
  }

  if (!id) return NextResponse.json({ ok: false, error: "missing id" }, { status: 400 });

  const minutes = minutesStr ? parseInt(minutesStr, 10) : 15;
  if (!Number.isFinite(minutes) || minutes <= 0) {
    return NextResponse.json({ ok: false, error: "invalid minutes" }, { status: 400 });
  }

  const lot = await prisma.lot.findUnique({
    where: { id },
    select: { id: true, title: true, basePrice: true },
  });
  if (!lot) return NextResponse.json({ ok: false, error: "lot not found" }, { status: 404 });

  const endAt = new Date(Date.now() + minutes * 60_000);

  // اگر لازم شد پاک‌کردن بیدها:
  // await prisma.bid.deleteMany({ where: { lotId: id } });

  const updated = await prisma.lot.update({
    where: { id },
    data: {
      status: LotStatus.OPEN,
      endAt,
      winnerBidId: null,
      currentPrice: lot.basePrice,
    },
    select: {
      id: true, title: true, status: true, basePrice: true, currentPrice: true, endAt: true, updatedAt: true,
    },
  });

  // 🔔 انتشار برای جزئیات و لیست
  publish(`lot:${id}`, { type: "reset", lot: updated });
  publish("lots",      { type: "lot_updated", lot: updated });

  return NextResponse.json({ ok: true, updated, by: (auth as any).user, inMinutes: minutes });
}

export async function POST(req: Request) { return handler(req); }
export async function GET(req: Request)  { return handler(req); }
