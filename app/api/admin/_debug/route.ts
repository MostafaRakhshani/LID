import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

function decodeBasic(h: string | null) {
  if (!h || !h.startsWith("Basic ")) return { present: !!h, ok: false };
  const raw = Buffer.from(h.slice(6), "base64").toString("utf8");
  const [u, p] = raw.split(":");
  const ok = u === process.env.ADMIN_USER && p === process.env.ADMIN_PASS;
  return { present: true, ok, user: u, passLen: p?.length ?? 0 };
}

async function parse(req: Request) {
  let id: string | undefined;
  let minutes: any;

  try {
    const ct = req.headers.get("content-type") || "";
    if (ct.includes("application/json")) {
      const b = await req.json().catch(() => null);
      if (b && typeof b === "object") {
        if (typeof (b as any).id === "string") id = (b as any).id.trim();
        minutes = (b as any).minutes;
      }
    }
  } catch {}

  const url = new URL(req.url);
  if (!id) id = url.searchParams.get("id") || undefined;
  if (minutes == null) minutes = url.searchParams.get("minutes");

  return { id, minutesRaw: minutes, minutes: minutes != null ? Number(minutes) : undefined };
}

export async function GET(req: Request) {
  const auth = decodeBasic(req.headers.get("authorization"));
  const params = await parse(req);

  const lotsCount = await prisma.lot.count();
  const lot = params.id ? await prisma.lot.findUnique({ where: { id: params.id } }) : null;

  return NextResponse.json({
    env: {
      hasUser: !!process.env.ADMIN_USER,
      hasPass: !!process.env.ADMIN_PASS,
    },
    auth,
    params,
    db: {
      lotsCount,
      lotExists: !!lot,
      lotId: lot?.id ?? null,
      lotStatus: lot?.status ?? null,
    },
  });
}
