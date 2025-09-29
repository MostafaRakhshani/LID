const buckets = new Map<string, { tokens: number; ts: number }>();

export function allow(ip: string, rate = 8, perMs = 10_000) {
  const now = Date.now();
  const b = buckets.get(ip) ?? { tokens: rate, ts: now };
  // refill
  const refill = Math.floor(((now - b.ts) / perMs) * rate);
  if (refill > 0) {
    b.tokens = Math.min(rate, b.tokens + refill);
    b.ts = now;
  }
  if (b.tokens <= 0) { buckets.set(ip, b); return false; }
  b.tokens -= 1; buckets.set(ip, b); return true;
}