import { abs } from "@/lib/abs";
import Link from "next/link";
import { notFound } from "next/navigation";
export const dynamic = "force-dynamic";
export const revalidate = 0;


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

function coerce(sp: SearchParams) {
  const page = Math.max(1, parseInt(sp.page ?? "1") || 1);
  const sizeRaw = parseInt(sp.size ?? "20", 10);
  const size = [10, 20, 50, 100].includes(sizeRaw) ? sizeRaw : 20;
  const q = (sp.q ?? "").trim();
  const sort = (sp.sort ?? "endAt") as NonNullable<SearchParams["sort"]>;
  const dir = (sp.dir ?? "asc") as NonNullable<SearchParams["dir"]>;
  const status = (sp.status ?? "ALL") as NonNullable<SearchParams["status"]>;
  return { page, size, q, sort, dir, status };
function qs(input: Record<string, string | number | undefined>) {
  const s = new URLSearchParams();
  for (const [k, v] of Object.entries(input)) {
    if (v === undefined) continue;
    s.set(k, String(v));
  return s.toString();
function SortLink({
  label,
  field,
  sp,
}: {
  label: string;
  field: NonNullable<SearchParams["sort"]>;
  sp: ReturnType<typeof coerce>;
}) {
  const active = sp.sort === field;
  const nextDir = active && sp.dir === "asc" ? "desc" : "asc";
  const href = `/admin/lots?${qs({ ...sp, sort: field, dir: nextDir })}`;
  return (
    <Link href={href} className={active ? "font-bold" : ""}>
      {label}
      {active ? (sp.dir === "asc" ? " ↑" : " ↓") : ""}
    </Link>
  );
export default async function AdminLotsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const sp = coerce(searchParams);
  const url = abs(`/api/lots?${qs(sp)}`);

  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) {
    if (res.status === 404) notFound();
    throw new Error(`Failed to load lots (${res.status})`);
  const data: LotsResp = await res.json();

  return (
    <div className="p-6">
      <h1 className="text-xl mb-4">مزایده‌ها</h1>
      <table className="min-w-full text-sm">
        <thead>
          <tr>
            <th className="text-right p-2">ID</th>
            <th className="text-right p-2">
              <SortLink label="عنوان" field="title" sp={sp} />
            </th>
            <th className="text-right p-2">
              <SortLink label="قیمت پایه" field="basePrice" sp={sp} />
            </th>
            <th className="text-right p-2">
              <SortLink label="قیمت فعلی" field="currentPrice" sp={sp} />
            </th>
            <th className="text-right p-2">
              <SortLink label="پایان" field="endAt" sp={sp} />
            </th>
            <th className="text-right p-2">وضعیت</th>
          </tr>
        </thead>
        <tbody>
          {data.items.map((l) => (
            <tr key={l.id} className="border-t">
              <td className="p-2">{l.id}</td>
              <td className="p-2">{l.title}</td>
              <td className="p-2">
                {Number(l.basePrice).toLocaleString("fa-IR")}
              </td>
              <td className="p-2">
                {Number(l.currentPrice).toLocaleString("fa-IR")}
              </td>
              <td className="p-2">{l.endAt ?? "—"}</td>
              <td className="p-2">{l.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

