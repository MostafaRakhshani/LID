export const revalidate = 0;
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";

function pick(h: Headers, keys: string[]) {
  const obj: Record<string, string> = {};
  for (const k of keys) {
    const v = h.get(k);
    if (v) obj[k] = v;
  }
  return obj;
}

export async function GET(req: Request) {
  return NextResponse.json({
    ok: true,
    method: "GET",
    now: new Date().toISOString(),
    headers: pick(req.headers, [
      "authorization",
      "user-agent",
      "x-forwarded-for",
      "x-real-ip",
      "host",
    ]),
  });
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  return NextResponse.json({
    ok: true,
    method: "POST",
    now: new Date().toISOString(),
    body,
    headers: pick(req.headers, [
      "authorization",
      "content-type",
      "user-agent",
      "x-forwarded-for",
      "x-real-ip",
      "host",
    ]),
  });
}