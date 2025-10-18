import { notFound } from "next/navigation";
import { headers } from "next/headers";

type LotLite = {
  id: string;
  title: string;
  status: "OPEN" | "CLOSED";
  basePrice: number;
  currentPrice: number;
  endAt: string | null;
};

export default async function LotPage({ params }: { params: { id: string } }) {
  const id = decodeURIComponent(params.id);

  const h = headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  const proto = h.get("x-forwarded-proto") ?? "http";
  const base = `${proto}://${host}`;

  const res = await fetch(`${base}/api/lots/${encodeURIComponent(id)}`, { cache: "no-store" });
  if (!res.ok) return notFound();
  const lot = (await res.json()) as LotLite;

  const nf = new Intl.NumberFormat("fa-IR");
  const fmt = (n: number) => nf.format(n);
  const end = lot.endAt ? new Date(lot.endAt).toLocaleString("fa-IR", { hour12: false }) : "—";

  return (
    <main dir="rtl" className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold">{lot.title}</h1>
      <div className="opacity-70 mt-1">شناسه: {id}</div>

      <section className="mt-6 grid gap-3">
        <div className="p-4 rounded-xl border">
          <div className="flex gap-4 flex-wrap">
            <div>وضعیت: <b>{lot.status === "OPEN" ? "باز" : "بسته"}</b></div>
            <div>قیمت پایه: <b>{fmt(lot.basePrice)}</b></div>
            <div>قیمت جاری: <b>{fmt(lot.currentPrice)}</b></div>
            <div>پایان: <b>{end}</b></div>
          </div>
        </div>
        <a href="/admin/lots" className="underline">بازگشت به لیست مزایده‌ها</a>
      </section>
    </main>
  );
}
