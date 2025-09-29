export const dynamic = "force-dynamic";
export const revalidate = 0;
export const runtime = "nodejs";

import LiveRefresh from "@/components/LiveRefresh";
import Toaster from "@/components/Toaster";
import prisma from "@/lib/prisma";
import Link from "next/link";

function Price({ v }: { v: number }) {
  return <span>{v.toLocaleString("fa-IR")} تومان</span>;
}

export default async function Page() {
  const lots = await prisma.lot.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <div className="space-y-4">
      {/* 🔌 SSE + Toasts */}
      <Toaster />
      <LiveRefresh topic="lots" reloadDelayMs={1000} />

      <div className="grid md:grid-cols-2 gap-4">
        {lots.map((l) => (
          <div key={l.id} className="card relative">
            <div className="absolute top-2 right-2 z-10">
              {l.status === "CLOSED" && (
                <span className="px-2 py-0.5 text-xs rounded bg-rose-100 text-rose-700 border border-rose-200">
                  پایان یافت
                </span>
              )}
            </div>
            <div className="relative aspect-[16/9] rounded-xl overflow-hidden bg-gray-100">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={l.imageUrl ?? "/placeholder.png"} alt={l.title} className="w-full h-full object-cover" />
              {l.status === "CLOSED" && <div className="absolute inset-0 bg-black/35" />}
            </div>
            <div className="p-3 space-y-1">
              <Link href={`/lots/${l.id}`} className="font-semibold hover:underline">{l.title}</Link>
              <div className="text-sm text-gray-600">
                قیمت فعلی: <Price v={l.currentPrice} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}