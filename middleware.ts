import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const DISABLED = process.env.BASIC_AUTH_DISABLE === "true";
const USER = process.env.ADMIN_USER || "";
const PASS = process.env.ADMIN_PASS || "";

function isPrefetch(req: NextRequest) {
  const h = req.headers;
  return (
    h.get("x-middleware-prefetch") === "1" ||
    h.get("purpose") === "prefetch" ||
    h.get("next-router-prefetch") === "1"
  );
}

function b64decode(t: string) {
  // کار در Edge/Node
  // @ts-ignore
  return (typeof atob === "function") ? atob(t) : Buffer.from(t, "base64").toString();
}

export function middleware(req: NextRequest) {
  if (DISABLED || !USER || !PASS) return NextResponse.next();
  if (isPrefetch(req)) return NextResponse.next();

  const auth = req.headers.get("authorization") || "";
  const [scheme, token] = auth.split(" ");
  if (scheme === "Basic" && token) {
    const [u, p] = b64decode(token).split(":");
    if (u === USER && p === PASS) return NextResponse.next();
  }
  return new NextResponse("Authentication required", {
    status: 401,
    headers: { "WWW-Authenticate": 'Basic realm="Secure Area"' },
  });
}

// فقط ادمین و داشبورد و API ادمین
export const config = {
  matcher: ["/admin/:path*", "/dashboard", "/api/admin/:path*"],
};
