export type Lot = {
  id: string;
  title: string;
  status: "OPEN" | "CLOSED";
  basePrice: number;
  currentPrice: number;
  endAt: string | null;
};

declare global {
  // برای پایداری میان HMR در dev
  // eslint-disable-next-line no-var
  var __LOTS__: Lot[] | undefined;
}

function seed(): Lot[] {
  return Array.from({ length: 123 }).map((_, i) => ({
    id: `LOT-${(i + 1).toString().padStart(3, "0")}`,
    title: `مزایده ${i + 1}`,
    status: i % 3 === 0 ? "CLOSED" : "OPEN",
    basePrice: 1000 + i * 50,
    currentPrice: 1200 + i * 60,
    endAt: i % 5 === 0 ? null : new Date(Date.now() + i * 3600_000).toISOString(),
  }));
}

const LOTS: Lot[] = globalThis.__LOTS__ ?? (globalThis.__LOTS__ = seed());

export function list(): Lot[] { return LOTS; }

export function find(id: string): Lot | undefined {
  return LOTS.find(x => x.id === id);
}

export function nextId(): string {
  const max = LOTS.reduce((m, x) => Math.max(m, parseInt(x.id.replace("LOT-", "") || "0")), 0);
  return `LOT-${String(max + 1).padStart(3, "0")}`;
}

export function add(data: Omit<Lot, "id"> & Partial<Pick<Lot, "id">>): Lot {
  const id = data.id ?? nextId();
  const item: Lot = {
    id,
    title: data.title ?? "بدون عنوان",
    status: data.status ?? "OPEN",
    basePrice: data.basePrice ?? 0,
    currentPrice: data.currentPrice ?? (data.basePrice ?? 0),
    endAt: data.endAt ?? null,
  };
  LOTS.push(item);
  return item;
}

export function update(id: string, patch: Partial<Omit<Lot, "id">>): Lot | undefined {
  const it = find(id);
  if (!it) return undefined;
  Object.assign(it, patch);
  return it;
}

export function remove(id: string): boolean {
  const i = LOTS.findIndex(x => x.id === id);
  if (i >= 0) { LOTS.splice(i, 1); return true; }
  return false;
}
