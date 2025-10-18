// app/api/health/route.ts
export const revalidate = 0;
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const cnt = await prisma.lot.count();
    return NextResponse.json({
      ok: true,
      db: true,
      lots: cnt,
      env: process.env.NODE_ENV,
      commit: process.env.VERCEL_GIT_COMMIT_SHA || null,
      pooled: (process.env.DATABASE_URL || "").includes("-pooler."),
    });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, db: false, error: e.message },
      { status: 500 }
    );
  }
}
