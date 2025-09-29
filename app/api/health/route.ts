import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    // کوئری سبک برای بررسی اتصال DB
    await prisma.lot.count();
    return NextResponse.json({ ok: true, db: "up" });
  } catch (e) {
    return NextResponse.json({ ok: false, db: "down", error: (e as Error).message }, { status: 500 });
  }
}