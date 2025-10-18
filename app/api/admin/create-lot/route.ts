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

export async function POST(req: Request) {
  const auth = parseBasic(req.headers.get("authorization"));
  if (!auth.ok) {
    return new NextResponse("Auth required", { status: 401, headers: { "WWW-Authenticate": "Basic" } });
  }

  let data: any = null;
  try { data = await req.json(); } catch {}

  const id: string | undefined         = typeof data?.id === "string" ? data.id.trim() : undefined;
  const title: string | undefined      = typeof data?.title === "string" ? data.title.trim() : undefined;
  const category: string | undefined   = typeof data?.category === "string" ? data.category.trim() : undefined;
  const basePrice: number | undefined  = Number.isFinite(Number(data?.basePrice)) ? Number(data.basePrice) : undefined;
  const minutes: number                = Number.isFinite(Number(data?.minutes)) && Number(data?.minutes) > 0 ? Number(data.minutes) : 30;
  const imageUrl: string | undefined   = typeof data?.imageUrl === "string" ? data.imageUrl.trim() : undefined;
  const description: string | undefined= typeof data?.description === "string" ? data.description.trim() : undefined;

  if (!id || !title || !category || !basePrice) {
    return NextResponse.json({ ok: false, error: "INVALID_BODY", need: ["id","title","category","basePrice"] }, { status: 422 });
  }

  const now = new Date();
  const startAt = now;
  const endAt   = new Date(now.getTime() + minutes * 60_000);

  const exists = await prisma.lot.findUnique({ where: { id }, select: { id: true } });

  const lot = exists
    ? await prisma.lot.update({
        where: { id },
        data: {
          title, category,
          basePrice,
          currentPrice: basePrice,
          startAt, endAt,
          ...(imageUrl != null ? { imageUrl } : {}),
          ...(description != null ? { description } : {}),
          status: LotStatus.OPEN,
          winnerBidId: null,
        },
        select: { id:true, title:true, category:true, basePrice:true, currentPrice:true, startAt:true, endAt:true, imageUrl:true, description:true, status:true },
      })
    : await prisma.lot.create({
        data: {
          id, title, category,
          basePrice,
          currentPrice: basePrice,
          startAt, endAt,
          imageUrl: imageUrl ?? "/placeholder.png",
          description: description ?? "",
          status: LotStatus.OPEN,
        },
        select: { id:true, title:true, category:true, basePrice:true, currentPrice:true, startAt:true, endAt:true, imageUrl:true, description:true, status:true },
      });

  publish(`lot:${id}`, { type: exists ? "reset" : "created", lot });
  publish("lots",      { type: "lot_updated", lot });

  return NextResponse.json({ ok: true, mode: exists ? "updated" : "created", lot, by: auth.user });
}
