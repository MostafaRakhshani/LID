import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

function parseBasic(auth?: string | null) {
  if (!auth || !auth.startsWith("Basic ")) return { ok: false, reason: "no-header" };
  try {
    const decoded = Buffer.from(auth.slice(6), "base64").toString("utf8");
    const i = decoded.indexOf(":");
    const user = i >= 0 ? decoded.slice(0, i) : decoded;
    const pass = i >= 0 ? decoded.slice(i + 1) : "";
    const ok = user === process.env.ADMIN_USER && pass === process.env.ADMIN_PASS;
    return { ok, user, passLen: pass.length };
  } catch {
    return { ok: false, reason: "decode-failed" };
  }
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const q = Object.fromEntries(url.searchParams.entries());
  const auth = parseBasic(req.headers.get("authorization"));

  return NextResponse.json({
    route: "/api/admin/debug",
    env: { hasUser: !!process.env.ADMIN_USER, hasPass: !!process.env.ADMIN_PASS },
    auth,
    q,
    method: "GET"
  });
}