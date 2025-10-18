"use client";
import { useEffect } from "react";

type Props = { topic: string; reload?: boolean; reloadDelayMs?: number };

export default function LiveRefresh({ topic, reload = true, reloadDelayMs = 800 }: Props) {
  useEffect(() => {
    const url = topic.startsWith("lot:")
      ? `/api/sse/lots/${encodeURIComponent(topic.slice(4))}`
      : `/api/sse?topic=${encodeURIComponent(topic)}`;

    const es = new EventSource(url);
    const push = (window as any).__pushToast as undefined | ((t: any) => void);

    const onMsg = (ev: MessageEvent<string>) => {
      let data: any = null;
      try { data = ev.data ? JSON.parse(ev.data) : null; } catch {}
      const t = data?.type;

      if (push) {
        if (t === "bid") {
          const amt = typeof data?.bid?.amount === "number"
            ? data.bid.amount.toLocaleString("fa-IR")
            : String(data?.bid?.amount ?? "");
          push({ title: "پیشنهاد جدید", desc: `${amt} تومان` });
        } else if (t === "closed") {
          push({ title: "مزایده پایان یافت" });
        } else if (t === "reset") {
          push({ title: "مزایده باز شد" });
        } else if (t === "lot_updated") {
          push({ title: "به‌روزرسانی لات" });
        } else {
          push({ title: "رویداد جدید" });
        }
      }

      if (reload) setTimeout(() => location.reload(), reloadDelayMs);
    };

    es.addEventListener("message", onMsg);
    es.addEventListener("hello", () => {});
    es.onerror = () => {};
    return () => es.close();
  }, [topic, reload, reloadDelayMs]);

  return null;
}
