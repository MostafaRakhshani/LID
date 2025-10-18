export const revalidate = 0;
import { NextResponse } from "next/server";
import prisma from "../../../lib/prisma";

type SortKey = "endAt" | "currentPrice" | "basePrice" | "title" | "status";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1") || 1);
  const q = (searchParams.get("q") ?? "").trim();
  const sort = (searchParams.get("sort") ?? "endAt") as SortKey;
  const dir = (searchParams.get("dir") ?? "asc") as "asc" | "desc";
  const status = (searchParams.get("status") ?? "ALL") as "OPEN" | "CLOSED" | "ALL";
  const sizeRaw = parseInt(searchParams.get("size") ?? "20", 10);
  const PAGE_SIZE = [10,20,50,100].includes(sizeRaw) ? sizeRaw : 20;

  const where:any = {};
  if (status !== "ALL") where.status = status;
  if (q) where.OR = [{ title: { contains: q, mode: "insensitive" } }, { id: { contains: q, mode: "insensitive" } }];

  const orderBy:any = {}; orderBy[sort] = dir;

  const [total, items] = await Promise.all([
    prisma.lot.count({ where }),
    prisma.lot.findMany({
      where, orderBy,
      skip: (page - 1) * PAGE_SIZE, take: PAGE_SIZE,
      select: { id:true, title:true, status:true, basePrice:true, currentPrice:true, endAt:true },
    }),
  ]);

  return NextResponse.json({ items, page, pages: Math.max(1, Math.ceil(total/PAGE_SIZE)), total });
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({} as any));
  const title = String(body.title ?? "بدون عنوان");
  const basePrice = Number(body.basePrice ?? 0);
  const currentPrice = Number(body.currentPrice ?? basePrice);
  const endAt = body.endAt ? new Date(body.endAt) : null;
  const status = body.status === "CLOSED" ? "CLOSED" : "OPEN";

  const count = await prisma.lot.count();
  const id = `LOT-${String(count + 1).padStart(3,"0")}`;

  const item = await prisma.lot.create({
    data: { id, title, basePrice, currentPrice, endAt, status },
    select: { id:true, title:true, status:true, basePrice:true, currentPrice:true, endAt:true },
  });

  return NextResponse.json({ ok:true, item }, { status: 201 });
}
