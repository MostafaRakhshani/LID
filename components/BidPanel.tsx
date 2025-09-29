"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type Props = {
  lotId: string;
  basePrice: number;
  initialEndAt: string;
  initialPrice?: number | null;
};

type FetchState = {
  currentPrice: number;
  endAt: string; // ISO
  status?: "OPEN" | "CLOSED";
};

type Toast = { id: number; text: string; kind: "success" | "error" };

export default function BidPanel({ lotId, basePrice, initialEndAt, initialPrice }: Props) {
  const [amount, setAmount] = useState<number>(initialPrice ?? basePrice);
  const [data, setData] = useState<FetchState>({
    currentPrice: initialPrice ?? basePrice,
    endAt: initialEndAt,
  });
  const [loading, setLoading] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const idRef = useRef(1);

  const showToast = (t: Omit<Toast, "id">) => {
    const id = idRef.current++;
    setToasts((prev) => [...prev, { id, ...t }]);
    setTimeout(() => setToasts((prev) => prev.filter((x) => x.id !== id)), 3500);
  };

  // هر 8 ثانیه وضعیت را بگیر
  useEffect(() => {
    let stop = false;
    async function tick() {
      try {
        const res = await fetch(`/api/bids?lotId=${encodeURIComponent(lotId)}`, { cache: "no-store" });
        if (!res.ok) throw new Error(await res.text());
        const j = await res.json();
        if (!stop) {
          setData({ currentPrice: j.currentPrice, endAt: j.endAt, status: j.status });
          // اگر قیمت عوض شد، ورودی را هم همگام کن (جزء کوچکِ UX)
          setAmount(j.currentPrice);
        }
      } catch {
        /* نادیده می‌گیریم */
      } finally {
        if (!stop) setTimeout(tick, 8000);
      }
    }
    tick();
    return () => {
      stop = true;
    };
  }, [lotId]);

  const isClosed = data.status === "CLOSED" || new Date(data.endAt) < new Date();
  const minStep = useMemo(() => Math.max(1, Math.round((data.currentPrice ?? basePrice) * 0.01)), [data.currentPrice, basePrice]);

  const placeBid = async () => {
    if (loading) return;
    if (isClosed) {
      showToast({ kind: "error", text: "مزایده تمام شده است." });
      return;
    }
    if (amount < (data.currentPrice ?? basePrice) + minStep) {
      showToast({ kind: "error", text: `حداقل ${minStep.toLocaleString("fa-IR")} تومان بیشتر از قیمت فعلی بزنید.` });
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/bids", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ lotId, amount }),
      });
      if (!res.ok) {
        const msg = await res.text().catch(() => "");
        showToast({ kind: "error", text: msg || "ثبت پیشنهاد ناموفق بود." });
        return;
      }
      const j = (await res.json()) as FetchState;
      setData({ currentPrice: j.currentPrice, endAt: j.endAt, status: j.status });
      setAmount(j.currentPrice);
      showToast({ kind: "success", text: "پیشنهاد شما ثبت شد." });
    } catch {
      showToast({ kind: "error", text: "خطای شبکه. دوباره تلاش کنید." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-xl border p-4">
      {/* توست‌ها */}
      <div className="pointer-events-none fixed right-4 top-4 z-50 space-y-2">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={
              "pointer-events-auto rounded-lg px-3 py-2 text-sm shadow " +
              (t.kind === "success" ? "bg-emerald-600 text-white" : "bg-rose-600 text-white")
            }
          >
            {t.text}
          </div>
        ))}
      </div>

      <div className="text-sm text-gray-600 mb-1">
        وضعیت:{" "}
        <span className={isClosed ? "text-rose-600" : "text-emerald-700"}>
          {isClosed ? "پایان یافته" : "باز"}
        </span>
      </div>

      <div className="text-sm text-gray-600 mb-1">
        قیمت فعلی: <span className="font-semibold">{(data.currentPrice ?? basePrice).toLocaleString("fa-IR")} تومان</span>
      </div>
      <div className="text-sm text-gray-600 mb-3">
        حداقل گام: <span className="font-semibold">{minStep.toLocaleString("fa-IR")} تومان</span>
      </div>

      <div className="flex items-center gap-2">
        <input
          type="number"
          className="w-40 rounded-lg border px-3 py-2 text-sm"
          value={amount}
          min={(data.currentPrice ?? basePrice) + minStep}
          onChange={(e) => setAmount(Number(e.target.value))}
          disabled={loading || isClosed}
        />
        <button
          onClick={placeBid}
          disabled={loading || isClosed}
          className={
            "rounded-lg px-4 py-2 text-sm font-medium text-white " +
            (isClosed
              ? "bg-gray-400 cursor-not-allowed"
              : loading
              ? "bg-teal-500/70"
              : "bg-teal-600 hover:bg-teal-700")
          }
        >
          {isClosed ? "مزایده تمام شده" : loading ? "در حال ثبت…" : "ثبت پیشنهاد"}
        </button>
      </div>
    </div>
  );
}
