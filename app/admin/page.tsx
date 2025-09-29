"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

type LotLite = {
  id: string;
  title: string;
  status: "OPEN" | "CLOSED";
  basePrice: number;
  currentPrice: number;
  endAt: string | null;
};

function fmt(n: number) {
  return n.toLocaleString("fa-IR");
}

export default function AdminPage() {
  const [lots, setLots] = useState<LotLite[]>([]);
  const [loading, setLoading] = useState(false);

  // دمو: ذخیره در LocalStorage
  const [user, setUser] = useState<string>("");
  const [pass, setPass] = useState<string>("");

  useEffect(() => {
    setUser(localStorage.getItem("ADMIN_USER") || "");
    setPass(localStorage.getItem("ADMIN_PASS") || "");
  }, []);
  useEffect(() => { localStorage.setItem("ADMIN_USER", user || ""); }, [user]);
  useEffect(() => { localStorage.setItem("ADMIN_PASS", pass || ""); }, [pass]);

  // ✅ به‌جای تابع، خودِ Headers به‌صورت Record<string,string>
  const authHeaders = useMemo<Record<string, string>>(() => {
    if (!user || !pass) return {} as Record<string, string>;
    const b64 = typeof window !== "undefined" ? window.btoa(`${user}:${pass}`) : "";
    if (!b64) return {} as Record<string, string>;
    return { Authorization: `Basic ${b64}` };
  }, [user, pass]);

  async function loadLots() {
    const res = await fetch("/api/lots", { cache: "no-store" });
    const data = await res.json();
    setLots(data.lots ?? []);
  }
  useEffect(() => { loadLots(); }, []);

  async function postJson(path: string, body?: unknown) {
    const res = await fetch(path, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...authHeaders },
      body: body ? JSON.stringify(body) : undefined,
    });
    const text = await res.text();
    try { return { ok: res.ok, json: JSON.parse(text), text }; }
    catch { return { ok: res.ok, json: null, text }; }
  }

  async function onExtend(id: string, minutes = 2) {
    setLoading(true);
    const r = await postJson("/api/admin/extend-lot", { id, minutes });
    setLoading(false);
    if (!r.ok) alert(`Extend failed:\n${r.text}`);
    await loadLots();
  }
  async function onClose(id: string) {
    setLoading(true);
    const r = await postJson("/api/admin/close-lot", { id });
    setLoading(false);
    if (!r.ok) alert(`Close failed:\n${r.text}`);
    await loadLots();
  }
  async function onDelete(id: string) {
    if (!confirm(`لات «${id}» حذف شود؟ تمام بیدها هم پاک خواهند شد.`)) return;
    setLoading(true);
    const r = await postJson("/api/admin/delete-lot", { id });
    setLoading(false);
    if (!r.ok) alert(`Delete failed:\n${r.text}`);
    await loadLots();
  }

  // ساخت/آپدیت با create-lot
  const [form, setForm] = useState({
    id: "",
    title: "",
    category: "",
    basePrice: 0,
    minutes: 30,
    imageUrl: "",
    description: "",
  });
  function set<T extends keyof typeof form>(k: T, v: (typeof form)[T]) {
    setForm((p) => ({ ...p, [k]: v }));
  }
  async function onCreateOrUpdate() {
    setLoading(true);
    const payload = {
      ...form,
      basePrice: Number(form.basePrice || 0),
      minutes: Number(form.minutes || 0),
      imageUrl: form.imageUrl || undefined,
      description: form.description || undefined,
    };
    const r = await postJson("/api/admin/create-lot", payload);
    setLoading(false);
    if (!r.ok) alert(`Create/Update failed:\n${r.text}`);
    await loadLots();
  }

  return (
    <div className="container py-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">ادمین</h1>
        <Link href="/lots" className="text-sm hover:underline">← لیست مزایده‌ها</Link>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <div className="rounded border p-3 space-y-2">
          <h2 className="font-semibold">ورود ادمین (Basic)</h2>
          <input className="input w-full" placeholder="ADMIN_USER"
                 value={user} onChange={e => setUser(e.target.value)} />
          <input className="input w-full" placeholder="ADMIN_PASS" type="password"
                 value={pass} onChange={e => setPass(e.target.value)} />
          <div className="text-xs text-gray-500">فقط برای دمو در مرورگر ذخیره می‌شود.</div>
        </div>

        <div className="md:col-span-2 rounded border p-3 space-y-2">
          <h2 className="font-semibold">ساخت / به‌روزرسانی لات</h2>
          <div className="grid md:grid-cols-2 gap-2">
            <input className="input" placeholder="id" value={form.id} onChange={e=>set("id", e.target.value)} />
            <input className="input" placeholder="عنوان" value={form.title} onChange={e=>set("title", e.target.value)} />
            <input className="input" placeholder="دسته" value={form.category} onChange={e=>set("category", e.target.value)} />
            <input className="input" placeholder="قیمت پایه" type="number" value={form.basePrice}
                   onChange={e=>set("basePrice", Number(e.target.value))} />
            <input className="input" placeholder="دقایق مزایده" type="number" value={form.minutes}
                   onChange={e=>set("minutes", Number(e.target.value))} />
            <input className="input" placeholder="imageUrl (اختیاری)" value={form.imageUrl}
                   onChange={e=>set("imageUrl", e.target.value)} />
          </div>
          <textarea className="input w-full" rows={3} placeholder="توضیحات"
                    value={form.description} onChange={e=>set("description", e.target.value)} />
          <div className="flex gap-2">
            <button className="btn" disabled={loading} onClick={onCreateOrUpdate}>ثبت</button>
          </div>
        </div>
      </div>

      <div className="rounded border p-3">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold">لیست لات‌ها</h2>
          <button className="btn" onClick={loadLots} disabled={loading}>بارگذاری مجدد</button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-right border-b">
                <th className="p-2">ID</th>
                <th className="p-2">عنوان</th>
                <th className="p-2">وضعیت</th>
                <th className="p-2">پایه</th>
                <th className="p-2">فعلی</th>
                <th className="p-2">پایان</th>
                <th className="p-2">اکشن‌ها</th>
              </tr>
            </thead>
            <tbody>
              {lots.map(l => (
                <tr key={l.id} className="border-b">
                  <td className="p-2 font-mono">{l.id}</td>
                  <td className="p-2">{l.title}</td>
                  <td className="p-2">{l.status}</td>
                  <td className="p-2">{fmt(l.basePrice)} ت</td>
                  <td className="p-2">{fmt(l.currentPrice)} ت</td>
                  <td className="p-2">{l.endAt ? new Date(l.endAt).toLocaleString("fa-IR") : "—"}</td>
                  <td className="p-2 flex flex-wrap gap-2">
                    <button className="btn" disabled={loading} onClick={()=>onExtend(l.id, 2)}>+2m</button>
                    <button className="btn" disabled={loading} onClick={()=>onClose(l.id)}>بستن</button>
                    <button className="btn danger" disabled={loading} onClick={()=>onDelete(l.id)}>حذف</button>
                  </td>
                </tr>
              ))}
              {lots.length === 0 && (
                <tr><td className="p-3 text-gray-500" colSpan={7}>موردی نیست.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <style jsx>{`
        .input { @apply border rounded px-2 py-1; }
        .btn { @apply border rounded px-3 py-1 bg-gray-100 hover:bg-gray-200; }
        .btn.danger { @apply bg-rose-100 hover:bg-rose-200 border-rose-200 text-rose-800; }
      `}</style>
    </div>
  );
}