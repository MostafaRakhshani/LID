import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { LotStatus } from "@prisma/client";
import { publish } from "@/lib/sse";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

type AuthResult = { ok: boolean; user?: string };

function parseBasic(auth: string | null): AuthResult {
  if (!auth || !auth.startsWith("Basic ")) return { ok: false };
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
    return ok ? { ok: true, user } : { ok: false };
  } catch {
    return { ok: false };
  }
}

async function handler(req: Request) {
  const auth = parseBasic(req.headers.get("authorization"));
  if (!auth.ok) {
    return new NextResponse("Auth required", { status: 401, headers: { "WWW-Authenticate": "Basic" } });
  }

  const url = new URL(req.url);
  let id: string | undefined = url.searchParams.get("id") ?? undefined;

  if (req.method === "POST") {
    try {
      const body = await req.json().catch(() => null);
      if (!id && body && typeof body === "object" && typeof (body as any).id === "string") {
        id = (body as any).id;
      }
    } catch {}
  }

  if (!id) return NextResponse.json({ ok: false, error: "missing id" }, { status: 400 });

  const lot = await prisma.lot.findUnique({ where: { id }, select: { id: true, status: true } });
  if (!lot) return NextResponse.json({ ok: false, error: "lot not found" }, { status: 404 });

  if (lot.status === LotStatus.CLOSED) {
    return NextResponse.json({ ok: true, alreadyClosed: true, id });
  }

  const top = await prisma.bid.findFirst({
    where: { lotId: id },
    orderBy: { amount: "desc" },
    select: { id: true, amount: true },
  });

  const updated = await prisma.lot.update({
    where: { id },
    data: {
      status: LotStatus.CLOSED,
      winnerBidId: top?.id ?? null,
      ...(top ? { currentPrice: top.amount } : {}),
    },
    select: { id: true, title: true, status: true, currentPrice: true, winnerBidId: true, endAt: true },
  });

  // انتشار رویداد برای UI
  publish(`lot:${id}`, { type: "closed", lot: updated, winnerBidId: updated.winnerBidId });
  publish("lots", { type: "lot_updated", lot: updated });

  return NextResponse.json({
    ok: true,
    closed: id,
    winnerBidId: updated.winnerBidId,
    currentPrice: updated.currentPrice,
  });
}

export async function POST(req: Request) { return handler(req); }
export async function GET(req: Request)  { return handler(req); }