import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default function NewLotPage() {
  async function createLot(formData: FormData) {
    "use server";
    const h = headers();
    const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
    const proto = h.get("x-forwarded-proto") ?? "http";
    const base = `${proto}://${host}`;

    const title = String(formData.get("title") ?? "");
    const basePrice = Number(formData.get("basePrice") ?? 0);
    const currentPrice = Number(formData.get("currentPrice") ?? basePrice);
    const endAtRaw = String(formData.get("endAt") ?? "");
    const status = (formData.get("status") === "CLOSED") ? "CLOSED" : "OPEN";

    const payload = {
      title,
      basePrice,
      currentPrice,
      endAt: endAtRaw ? new Date(endAtRaw).toISOString() : null,
      status
    };

    await fetch(`${base}/api/lots`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
      cache: "no-store",
    });

    redirect("/admin/lots");
  }

  return (
    <main dir="rtl" className="max-w-xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6 text-center">افزودن مزایده جدید</h1>
      <form action={createLot} className="grid gap-4">
        <label className="grid gap-1">
          <span>عنوان</span>
          <input name="title" required className="border rounded-xl px-3 py-2" placeholder="مثلاً مزایده برنج طارم" />
        </label>
        <label className="grid gap-1">
          <span>قیمت پایه</span>
          <input name="basePrice" type="number" min="0" step="1" required className="border rounded-xl px-3 py-2" />
        </label>
        <label className="grid gap-1">
          <span>قیمت جاری (اختیاری)</span>
          <input name="currentPrice" type="number" min="0" step="1" className="border rounded-xl px-3 py-2" />
        </label>
        <label className="grid gap-1">
          <span>پایان (اختیاری)</span>
          <input name="endAt" type="datetime-local" className="border rounded-xl px-3 py-2" />
        </label>
        <label className="grid gap-1">
          <span>وضعیت</span>
          <select name="status" defaultValue="OPEN" className="border rounded-xl px-3 py-2">
            <option value="OPEN">باز</option>
            <option value="CLOSED">بسته</option>
          </select>
        </label>
        <div className="flex gap-2 mt-2">
          <button className="border rounded-xl px-4 py-2">ثبت</button>
          <a href="/admin/lots" className="underline px-4 py-2">انصراف</a>
        </div>
      </form>
    </main>
  );
}
