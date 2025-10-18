"use client";

import { useState } from "react";

export default function AdminControl({ lotId, isClosed }: { lotId: string; isClosed: boolean }) {
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState<{ text: string; kind: "success" | "error" } | null>(null);

  const hit = async () => {
    if (busy) return;
    setBusy(true);
    setToast(null);
    try {
      const url = isClosed ? "/api/admin/reset-lot" : "/api/admin/close-lot";
      const res = await fetch(url, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ lotId }),
      });
      if (!res.ok) {
        const msg = await res.text().catch(() => "");
        setToast({ kind: "error", text: msg || "خطا در انجام عملیات." });
        setBusy(false);
        return;
      }
      setToast({ kind: "success", text: isClosed ? "لات بازگشایی شد." : "لات بسته شد." });
      setTimeout(() => window.location.reload(), 900);
    } catch {
      setToast({ kind: "error", text: "خطای شبکه." });
      setBusy(false);
    }
  };

  return (
    <div className="relative">
      {/* Toast */}
      <div className="pointer-events-none fixed right-4 top-4 z-50">
        {toast && (
          <div
            className={
              "pointer-events-auto rounded-lg px-3 py-2 text-sm shadow " +
              (toast.kind === "success" ? "bg-emerald-600 text-white" : "bg-rose-600 text-white")
            }
          >
            {toast.text}
          </div>
        )}
      </div>

      <button
        onClick={hit}
        disabled={busy}
        className={
          "rounded-lg px-3 py-2 text-sm font-medium text-white " +
          (isClosed ? "bg-amber-600 hover:bg-amber-700" : "bg-rose-600 hover:bg-rose-700") +
          (busy ? " opacity-70 cursor-not-allowed" : "")
        }
      >
        {busy ? "…" : isClosed ? "بازگشایی (ریست)" : "بستن فوری"}
      </button>
    </div>
  );
}
