import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { publish } from "@/lib/sse";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

function parseBasic(auth: string | null): { ok: boolean; user?: string } {
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

  let id: string | undefined;
  try {
    const body = await req.json().catch(() => null);
    if (body && typeof body.id === "string") id = body.id;
  } catch {}
  if (!id) return NextResponse.json({ ok: false, error: "missing id" }, { status: 400 });

  const lot = await prisma.lot.findUnique({ where: { id }, select: { id: true } });
  if (!lot) return NextResponse.json({ ok: false, error: "lot not found" }, { status: 404 });

  await prisma.$transaction([
    prisma.bid.deleteMany({ where: { lotId: id } }),
    prisma.lot.delete({ where: { id } }),
  ]);

  publish("lots", { type: "lot_deleted", id });
  return NextResponse.json({ ok: true, deletedId: id, by: auth.user });
}
