import Link from "next/link";
import { abs } from "@/lib/abs";

/* ===== types ===== */
type SearchParams = {
  page?: string;
  q?: string;
  sort?: "endAt" | "currentPrice" | "basePrice" | "title" | "status";
  dir?: "asc" | "desc";
  status?: "ALL" | "OPEN" | "CLOSED";
  size?: string;
};

type Lot = {
  id: string;
  title: string;
  status: "OPEN" | "CLOSED";
  basePrice: number;
  currentPrice: number;
  endAt: string | null;
};

type LotsResp = {
  items: Lot[];
  page: number;
  pages: number;
  total: number;
};

/* ===== utils ===== */
function coerce(sp: SearchParams) {
  const page = Math.max(1, parseInt(sp.page ?? "1", 10) || 1);
  const sizeRaw = parseInt(sp.size ?? "20", 10);
  const size = [10, 20, 50, 100].includes(sizeRaw) ? sizeRaw : 20;
  const q = (sp.q ?? "").trim();
  const sort = (sp.sort ?? "endAt") as NonNullable<SearchParams["sort"]>;
  const dir = (sp.dir ?? "asc") as NonNullable<SearchParams["dir"]>;
  const status = (sp.status ?? "ALL") as NonNullable<SearchParams["status"]>;
  return { page, size, q, sort, dir, status };
}

function qs(input: Record<string, string | number | undefined>) {
  const s = new URLSearchParams();
  for (const [k, v] of Object.entries(input)) {
    if (v === undefined) continue;
    s.set(k, String(v));
  }
  return s.toString();
}

function SortLink({
  sp,
  field,
  label,
}: {
  sp: ReturnType<typeof coerce>;
  field: NonNullable<SearchParams["sort"]>;
  label: string;
}) {
  const active = sp.sort === field;
  const nextDir = active && sp.dir === "asc" ? "desc" : "asc";
  const href = `/admin/lots?` + qs({ ...sp, sort: field, dir: nextDir });
  return (
    <Link href={href}>
      {label}
      {active ? (sp.dir === "asc" ? " ↑" : " ↓") : ""}
    </Link>
  );
}

/* ===== page ===== */
export default async function AdminLotsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const sp = coerce(searchParams);
  const url = abs(`/api/lots?${qs(sp)}`);
  const res = await fetch(url, { cache: "no-store" });

  if (!res.ok) {
    throw new Error(`Failed to load lots (${res.status})`);
  }

  const data: LotsResp = await res.json();

  return (
    <main className="mx-auto max-w-6xl p-6">
      <h1 className="text-xl mb-4">مزایده‌ها</h1>

      <div className="overflow-x-auto rounded border">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="bg-gray-100 text-right">
              <th className="p-2">ID</th>
              <th className="p-2"><SortLink sp={sp} field="title" label="عنوان" /></th>
              <th className="p-2"><SortLink sp={sp} field="basePrice" label="قیمت پایه" /></th>
              <th className="p-2"><SortLink sp={sp} field="currentPrice" label="قیمت فعلی" /></th>
              <th className="p-2"><SortLink sp={sp} field="endAt" label="پایان" /></th>
              <th className="p-2"><SortLink sp={sp} field="status" label="وضعیت" /></th>
            </tr>
          </thead>
          <tbody>
            {data.items.map((lot) => (
              <tr key={lot.id} className="border-t text-right">
                <td className="p-2">{lot.id}</td>
                <td className="p-2">{lot.title}</td>
                <td className="p-2">{lot.basePrice.toLocaleString("fa-IR")}</td>
                <td className="p-2">{lot.currentPrice.toLocaleString("fa-IR")}</td>
                <td className="p-2">{lot.endAt ?? "-"}</td>
                <td className="p-2">{lot.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="text-center text-xs text-gray-500 mt-8">
        نسخه نمایشی/ماک — LID
      </p>
    </main>
  );
}
