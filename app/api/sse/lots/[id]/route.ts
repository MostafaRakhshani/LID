import { subscribe } from "@/lib/sse";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const id = params.id;
  // ✔️ لیست از کانال "lots" استفاده می‌کند، جزئیات از "lot:<id>"
  const topic = id === "lots" ? "lots" : `lot:${id}`;

  const enc = new TextEncoder();
  let cleanup: (() => void) | undefined;

  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      const send = (s: string) => controller.enqueue(enc.encode(s));
      const iv = setInterval(() => send(`: ping ${Date.now()}\n\n`), 25000);

      send(`event: hello\ndata: {"ok":true,"topic":"${topic}"}\n\n`);
      const unsub = subscribe(topic, send);

      cleanup = () => { clearInterval(iv); unsub(); try { controller.close(); } catch {} };
    },
    cancel() { cleanup?.(); }
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      "Connection": "keep-alive",
      "Access-Control-Allow-Origin": "*"
    }
  });
}