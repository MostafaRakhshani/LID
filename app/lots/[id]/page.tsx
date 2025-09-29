export const dynamic = "force-dynamic";
export const revalidate = 0;
export const runtime = "nodejs";

import LiveRefresh from "@/components/LiveRefresh";
import Toaster from "@/components/Toaster";
import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import Countdown from "@/components/Countdown";
import BidBox from "@/components/BidBox";

function Price({ v }: { v: number }) {
  return <span>{v.toLocaleString("fa-IR")} تومان</span>;
}

type PageProps = { params: { id: string } };

export default async function LotPage({ params }: PageProps) {
  const id = params.id;

  const lot = await prisma.lot.findUnique({
    where: { id },
    select: {
      id: true,
      title: true,
      category: true,
      basePrice: true,
      currentPrice: true,
      startAt: true,
      endAt: true,
      imageUrl: true,
      status: true,
      winnerBidId: true,
      createdAt: true,
    },
  });

  if (!lot) notFound();

  const bids = await prisma.bid.findMany({
    where: { lotId: id },
    orderBy: { amount: "desc" },
    select: { id: true, amount: true, createdAt: true },
  });

  const topBid = bids[0] ?? null;
  const isClosed =
    lot.status === "CLOSED" ||
    (lot.endAt ? new Date(lot.endAt).getTime() <= Date.now() : false);

  return (
    <div className="container py-6 space-y-6">
      {/* 🔌 SSE + Toasts */}
      <Toaster />
      <LiveRefresh topic={`lot:${lot.id}`} reloadDelayMs={1000} />

      <Link href="/lots" className="text-sm hover:underline">
        ← بازگشت به لیست
      </Link>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-xl overflow-hidden bg-gray-100">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={lot.imageUrl ?? "/placeholder.png"}
            alt={lot.title}
            className="w-full h-auto object-cover"
          />
        </div>

        <div className="space-y-3">
          <h1 className="text-2xl font-bold">{lot.title}</h1>
          <div className="text-sm text-muted-foreground">
            دسته: {lot.category}
          </div>

          <div className="text-sm">
            قیمت پایه: <Price v={lot.basePrice} />
          </div>
          <div className="text-base font-semibold">
            قیمت فعلی: <Price v={lot.currentPrice} />
          </div>

          <div className="text-xs text-muted-foreground">
            پایان:{" "}
            {lot.endAt
              ? new Date(lot.endAt).toLocaleString("fa-IR", {
                  dateStyle: "medium",
                  timeStyle: "short",
                })
              : "—"}
          </div>

          {!isClosed && lot.endAt && (
            <div className="text-sm text-gray-700">
              زمان باقیمانده: <Countdown endAt={lot.endAt} />
            </div>
          )}

          {isClosed ? (
            <div className="rounded-md bg-amber-100 text-amber-900 p-3 text-sm">
              مزایده پایان یافته است
              {topBid ? (
                <>
                  ؛ برنده با پیشنهاد{" "}
                  <b>
                    <Price v={topBid.amount} />
                  </b>
                </>
              ) : (
                " و پیشنهادی ثبت نشده."
              )}
            </div>
          ) : (
            <div className="rounded-md bg-emerald-50 text-emerald-800 p-3 text-sm">
              مزایده باز است.
            </div>
          )}

          {!isClosed && (
            <div className="pt-2">
              <BidBox
                lotId={lot.id}
                minAmount={Math.max(lot.currentPrice + 100_000, lot.basePrice)}
                step={100_000}
              />
            </div>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <h2 className="font-medium">پیشنهادها</h2>
        <ul className="space-y-2">
          {bids.length === 0 && (
            <li className="text-sm text-muted-foreground">
              هنوز پیشنهادی ثبت نشده.
            </li>
          )}
          {bids.map((b) => (
            <li
              key={b.id}
              className="rounded border p-2 flex items-center justify-between"
            >
              <div className="text-sm">
                <Price v={b.amount} />
              </div>
              <div className="text-xs text-muted-foreground">
                {new Date(b.createdAt).toLocaleString("fa-IR", {
                  dateStyle: "short",
                  timeStyle: "short",
                })}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}