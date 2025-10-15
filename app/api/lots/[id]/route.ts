export const revalidate = 0;
import { NextResponse } from "next/server";
import prisma from "../../../../lib/prisma";

export async function GET(_req: Request, ctx: { params: { id: string } }) {
  const id = decodeURIComponent(ctx.params.id);
  const item = await prisma.lot.findUnique({ where: { id }, select: { id:true, title:true, status:true, basePrice:true, currentPrice:true, endAt:true } });
  if (!item) return NextResponse.json({ error: "Not Found" }, { status: 404 });
  return NextResponse.json(item);
}

export async function PATCH(req: Request, ctx: { params: { id: string } }) {
  const id = decodeURIComponent(ctx.params.id);
  const body = await req.json().catch(() => ({} as any));
  if (body?.toggleStatus) {
    const cur = await prisma.lot.findUnique({ where: { id }, select: { status:true } });
    if (!cur) return NextResponse.json({ error: "Not Found" }, { status: 404 });
    const next = cur.status === "OPEN" ? "CLOSED" : "OPEN";
    const item = await prisma.lot.update({ where: { id }, data: { status: next }, select: { id:true, title:true, status:true, basePrice:true, currentPrice:true, endAt:true } });
    return NextResponse.json({ ok:true, item });
  }
  const data:any = {};
  if (typeof body.title === "string") data.title = body.title;
  if (typeof body.basePrice !== "undefined") data.basePrice = Number(body.basePrice);
  if (typeof body.currentPrice !== "undefined") data.currentPrice = Number(body.currentPrice);
  if (typeof body.endAt !== "undefined") data.endAt = body.endAt ? new Date(body.endAt) : null;
  if (body.status === "OPEN" || body.status === "CLOSED") data.status = body.status;

  const item = await prisma.lot.update({ where: { id }, data, select: { id:true, title:true, status:true, basePrice:true, currentPrice:true, endAt:true } });
  return NextResponse.json({ ok:true, item });
}

export async function DELETE(_req: Request, ctx: { params: { id: string } }) {
  const id = decodeURIComponent(ctx.params.id);
  const exists = await prisma.lot.findUnique({ where: { id }, select: { id:true } });
  if (!exists) return NextResponse.json({ ok:false }, { status: 404 });
  await prisma.lot.delete({ where: { id } });
  return NextResponse.json({ ok:true }, { status: 204 });
}
