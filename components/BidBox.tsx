"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

type Props = {
  lotId: string;
  minAmount: number;
  step?: number;
};

export default function BidBox({ lotId, minAmount, step = 100_000 }: Props) {
  const [amount, setAmount] = useState<number>(minAmount);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const [msg, setMsg] = useState<string>("");

  const clamp = (n: number) =>
    Number.isFinite(n) ? Math.max(minAmount, Math.floor(n)) : minAmount;

  const bump = (delta: number) => setAmount((a) => clamp(a + delta));

  async function submit() {
    setMsg("");
    try {
      const res = await fetch("/api/bids", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lotId, amount }),
      });
      if (!res.ok) {
        const txt = await res.text();
        throw new Error(txt || `HTTP ${res.status}`);
      }
      setMsg("ثبت شد ✅");
      startTransition(() => router.refresh());
    } catch (e: any) {
      setMsg(e?.message?.slice(0, 200) || "خطا در ثبت پیشنهاد");
    }
  }

  return (
    <div className="mt-4 border rounded-xl p-3 space-y-3">
      <div className="text-sm text-gray-600">
        حداقل رقم مجاز: <b>{minAmount.toLocaleString("fa-IR")}</b> تومان
      </div>

      <div className="flex items-stretch gap-2">
        <button
          className="px-3 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 disabled:opacity-50"
          onClick={() => bump(-step)}
          disabled={isPending}
          type="button"
        >
          −{step.toLocaleString("fa-IR")}
        </button>

        <input
          inputMode="numeric"
          pattern="[0-9]*"
          className="flex-1 px-3 py-2 rounded-lg border text-center"
          value={amount}
          onChange={(e) =>
            setAmount(
              clamp(parseInt(e.target.value.replace(/\D/g, "")) || minAmount)
            )
          }
        />

        <button
          className="px-3 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 disabled:opacity-50"
          onClick={() => bump(step)}
          disabled={isPending}
          type="button"
        >
          +{step.toLocaleString("fa-IR")}
        </button>

        <button
          className="px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-60"
          onClick={submit}
          disabled={isPending || amount < minAmount}
          type="button"
        >
          {isPending ? "در حال ارسال…" : "ثبت پیشنهاد"}
        </button>
      </div>

      {!!msg && <div className="text-sm text-gray-700">{msg}</div>}
    </div>
  );
}
