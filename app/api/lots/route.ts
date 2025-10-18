import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type SortField = "endAt" | "currentPrice" | "basePrice" | "title" | "status";
type Dir = "asc" | "desc";
type Status = "ALL" | "OPEN" | "CLOSED";

const PAGE_DEFAULT = 1;
const SIZE_DEFAULT = 20;
const SIZE_ALLOWED = [10, 20, 50, 100] as const;
const SORT_ALLOWED: SortField[] = ["endAt", "currentPrice", "basePrice", "title", "status"];

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const sp = url.searchParams;

    const page = Math.max(PAGE_DEFAULT, parseInt(sp.get("page") ?? String(PAGE_DEFAULT), 10) || PAGE_DEFAULT);
    const sizeRaw = parseInt(sp.get("size") ?? String(SIZE_DEFAULT), 10);
    const size = (SIZE_ALLOWED as readonly number[]).includes(sizeRaw) ? sizeRaw : SIZE_DEFAULT;

    const q = (sp.get("q") ?? "").trim();
    const sort = (sp.get("sort") as SortField) ?? "endAt";
    const dir = ((sp.get("dir") as Dir) ?? "asc") === "desc" ? "desc" : "asc";
    const status = (sp.get("status") as Status) ?? "ALL";

    const sortField: SortField = SORT_ALLOWED.includes(sort) ? sort : "endAt";

    const now = new Date();
    const where: any = { AND: [] as any[] };

    if (q) {
      where.AND.push({
        OR: [
          { title: { contains: q, mode: "insensitive" } },
          { id: { contains: q, mode: "insensitive" } },
        ],
      });
    }

    if (status !== "ALL") {
      // اگر ستون status واقعی داری، قسمت‌های اول را نگه دار؛ وگرنه fallback با endAt می‌ماند.
      where.AND.push(
        status === "OPEN"
          ? {
              OR: [
                { status: "OPEN" }, // اگر ستون status داری
                { AND: [{ status: null }, { endAt: { gt: now } }] }, // fallback
              ],
            }
          : {
              OR: [
                { status: "CLOSED" }, // اگر ستون status داری
                { AND: [{ status: null }, { OR: [{ endAt: { lte: now } }, { endAt: null }] }] }, // fallback
              ],
            }
      );
    }
    if (where.AND.length === 0) delete where.AND;

    const orderBy: any =
      sortField === "status"
        ? { endAt: dir } // اگر ستون status نداری، بر اساس endAt سورت می‌کنیم
        : { [sortField]: dir };

    const [total, rows] = await Promise.all([
      prisma.lot.count({ where }),
      prisma.lot.findMany({
        where,
        orderBy,
        skip: (page - 1) * size,
        take: size,
        select: {
          id: true,
          title: true,
          basePrice: true,
          currentPrice: true,
          endAt: true,
          // status: true, // اگر ستون status واقعی داری، این را باز کن
        },
      }),
    ]);

    const items = rows.map((r) => {
      const computedStatus =
        // r.status ?? // اگر ستون status واقعی داری، این را باز کن
        r.endAt ? (r.endAt > now ? "OPEN" : "CLOSED") : "OPEN";
      return {
        id: r.id,
        title: r.title,
        basePrice: r.basePrice ?? 0,
        currentPrice: r.currentPrice ?? 0,
        endAt: r.endAt ? r.endAt.toISOString() : null,
        status: computedStatus as "OPEN" | "CLOSED",
      };
    });

    const pages = Math.max(1, Math.ceil(total / size));

    return NextResponse.json({ items, page, pages, total }, { status: 200 });
  } catch (err) {
    console.error("GET /api/lots error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
