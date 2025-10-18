import prisma from "@/lib/prisma";

function fmt(n?: number | null) {
  return typeof n === "number" ? n.toLocaleString("fa-IR") : "—";
}

function fdt(d?: Date | string | null) {
  if (!d) return "—";
  const dt = typeof d === "string" ? new Date(d) : d;
  return isNaN(dt.getTime()) ? "—" : dt.toLocaleString("fa-IR");
}

export default async function LotsPage() {
  const lots = await prisma.lot.findMany({ orderBy: { id: "desc" } });

  if (!lots.length) {
    return (
      <main className="container py-8">
        <h1 className="text-2xl font-bold mb-4">مزایده‌ها</h1>
        <p className="text-gray-600">هنوز لات ثبت نشده است.</p>
      </main>
    );
  }

  return (
    <main className="container py-8">
      <h1 className="text-2xl font-bold mb-4">مزایده‌ها</h1>
      <div className="overflow-x-auto rounded-lg border bg-white">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50 text-gray-700">
            <tr>
              <th className="p-3 text-right">پایان</th>
              <th className="p-3 text-right">قیمت پایه</th>
              <th className="p-3 text-right">دسته</th>
              <th className="p-3 text-right">عنوان</th>
              <th className="p-3 text-right">ID</th>
            </tr>
          </thead>
          <tbody>
            {lots.map((l) => (
              <tr key={l.id} className="border-t">
                <td className="p-3">{fdt(l.endAt as any)}</td>
                <td className="p-3">{fmt(l.basePrice as number | null)}</td>
                <td className="p-3">{(l as any).category ?? "—"}</td>
                <td className="p-3">{l.title ?? "—"}</td>
                <td className="p-3">{l.id}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}
