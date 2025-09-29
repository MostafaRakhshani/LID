import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const format = (url.searchParams.get("format") || "json").toLowerCase();

    const [lots, bids] = await Promise.all([
      prisma.lot.findMany({ orderBy: { updatedAt: "desc" } }),
      prisma.bid.findMany({ orderBy: { createdAt: "desc" } })
    ]);

    if (format === "json") {
      return NextResponse.json({ ok: true, lots, bids });
    }

    // CSV ساده: فقط بیدها
    if (format === "csv") {
      const head = "id,lotId,amount,createdAt";
      const lines = [head].concat(
        bids.map(b => `${b.id},${b.lotId},${b.amount},${b.createdAt.toISOString()}`)
      );
      const body = lines.join("\n");
      return new Response(body, {
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": 'attachment; filename="bids.csv"'
        }
      });
    }

    return NextResponse.json({ ok: false, error: "unsupported format" }, { status: 400 });
  } catch (e) {
    return NextResponse.json({ ok: false, error: (e as Error).message }, { status: 500 });
  }
}