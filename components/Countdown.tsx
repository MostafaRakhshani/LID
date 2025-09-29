"use client";
import { useEffect, useMemo, useState } from "react";

export default function Countdown({ endAt }: { endAt: string | Date }) {
  const end = useMemo(() => new Date(endAt).getTime(), [endAt]);
  const [ms, setMs] = useState(end - Date.now());

  useEffect(() => {
    const t = setInterval(() => setMs(end - Date.now()), 1000);
    return () => clearInterval(t);
  }, [end]);

  if (ms <= 0) return <span className="text-red-600">پایان یافته</span>;

  const sec = Math.floor(ms / 1000) % 60;
  const min = Math.floor(ms / (1000 * 60)) % 60;
  const hr  = Math.floor(ms / (1000 * 60 * 60));

  return (
    <span dir="ltr" className="font-mono tabular-nums">
      {hr.toString().padStart(2, "0")}:
      {min.toString().padStart(2, "0")}:
      {sec.toString().padStart(2, "0")}
    </span>
  );
}
