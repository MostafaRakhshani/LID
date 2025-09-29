"use client";
import { useEffect, useRef, useState } from "react";

type Toast = { id: number; title: string; desc?: string };

declare global {
  interface Window { __pushToast?: (t: Partial<Toast>) => void }
}

export default function Toaster() {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const nextId = useRef(1);

  useEffect(() => {
    window.__pushToast = (t: Partial<Toast>) => {
      const id = nextId.current++;
      const toast: Toast = { id, title: t.title ?? "اعلان", desc: t.desc };
      setToasts((arr) => [...arr, toast]);
      setTimeout(() => setToasts((arr) => arr.filter((x) => x.id !== id)), 4000);
    };
    return () => { delete window.__pushToast; };
  }, []);

  return (
    <div className="fixed top-3 left-3 z-[1000] space-y-2 rtl:text-right">
      {toasts.map((t) => (
        <div key={t.id} className="bg-white/95 backdrop-blur shadow-lg border rounded-lg p-3 w-80">
          <div className="font-medium">{t.title}</div>
          {t.desc ? <div className="text-sm text-gray-600 mt-1">{t.desc}</div> : null}
        </div>
      ))}
    </div>
  );
}