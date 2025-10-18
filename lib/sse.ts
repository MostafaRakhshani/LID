type Sender = (payload: string) => void

// استفاده از globalThis برای اشتراک در طول عمر فانکشن‌سرورها
const g = globalThis as any
if (!g.__LID_SSE_BUS__) g.__LID_SSE_BUS__ = new Map<string, Set<Sender>>()

/** انتشار رویداد روی یک topic به فرمت استاندارد SSE (event: update) */
export function publish(topic: string, data: any) {
  const bus: Map<string, Set<Sender>> = g.__LID_SSE_BUS__
  const set = bus.get(topic)
  if (!set || set.size === 0) return
  const payload = `event: update\ndata: ${JSON.stringify(data)}\n\n`
  for (const fn of set) {
    try { fn(payload) } catch {}
  }
}

/** عضویت در topic: خروجی تابع، unsubscribe است */
export function subscribe(topic: string, sender: Sender) {
  const bus: Map<string, Set<Sender>> = g.__LID_SSE_BUS__
  let set = bus.get(topic)
  if (!set) { set = new Set(); bus.set(topic, set) }
  set.add(sender)
  return () => { set!.delete(sender); if (set!.size === 0) bus.delete(topic) }
}
