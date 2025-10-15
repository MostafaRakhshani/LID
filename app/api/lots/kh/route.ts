import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const lots = await prisma.lot.findMany({ orderBy: { id: "desc" } });
    return NextResponse.json({ ok: true, lots });
  } catch (err) {
    console.error("GET /api/lots/kh error:", err);
    return NextResponse.json({ ok: false, error: "internal_error" }, { status: 500 });
  }
}
