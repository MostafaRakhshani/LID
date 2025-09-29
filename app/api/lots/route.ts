export const runtime = "nodejs";
import prisma from "@/lib/prisma";

type LotDTO = {
  id: string; title: string; category: string;
  basePrice: number; currentPrice?: number;
  startAt?: string; endAt: string; images: string[];
  description?: string;
};

function toDTO(l: any): LotDTO {
  return {
    id: l.id, title: l.title, category: l.category,
    basePrice: l.basePrice, currentPrice: l.currentPrice,
    startAt: l.startAt?.toISOString?.(), endAt: l.endAt?.toISOString?.() ?? l.endAt,
    images: l.imageUrl ? [l.imageUrl] : ["/placeholder.png"],
    description: l.description ?? "",
  };
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (id) {
    const lot = await prisma.lot.findUnique({ where: { id } });
    if (!lot) return new Response("not found", { status: 404 });
    return Response.json({ lot: toDTO(lot) });
  }
  const lots = await prisma.lot.findMany({ orderBy: { createdAt: "desc" } });
  return Response.json({ lots: lots.map(toDTO) });
}

export async function POST(req: Request) {
  const b = (await req.json()) as Partial<LotDTO>;
  if (!b.id || !b.title || !b.basePrice || !b.endAt)
    return new Response("bad request", { status: 400 });

  const created = await prisma.lot.create({
    data: {
      id: b.id, title: b.title, category: b.category ?? "",
      basePrice: Math.trunc(b.basePrice),
      currentPrice: Math.trunc(b.currentPrice ?? b.basePrice!),
      startAt: b.startAt ? new Date(b.startAt) : new Date(),
      endAt: new Date(b.endAt),
      imageUrl: b.images?.[0] || "/placeholder.png",
      description: b.description ?? "",
    },
  });
  return Response.json({ lot: toDTO(created) }, { status: 201 });
}

export async function PUT(req: Request) {
  const b = (await req.json()) as Partial<LotDTO> & { id: string };
  if (!b.id) return new Response("bad request", { status: 400 });

  const updated = await prisma.lot.update({
    where: { id: b.id },
    data: {
      title: b.title ?? undefined,
      category: b.category ?? undefined,
      basePrice: b.basePrice != null ? Math.trunc(b.basePrice) : undefined,
      currentPrice: b.currentPrice != null ? Math.trunc(b.currentPrice) : undefined,
      startAt: b.startAt ? new Date(b.startAt) : undefined,
      endAt: b.endAt ? new Date(b.endAt) : undefined,
      imageUrl: b.images?.[0] ?? undefined,
      description: b.description ?? undefined,
    },
  });

  return Response.json({ lot: toDTO(updated) });
}

export async function DELETE(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return new Response("id required", { status: 400 });
  await prisma.bid.deleteMany({ where: { lotId: id } }).catch(() => {});
  await prisma.lot.delete({ where: { id } });
  return new Response(null, { status: 204 });
}