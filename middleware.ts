import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const USER = process.env.ADMIN_USER ?? "";
const PASS = process.env.ADMIN_PASS ?? "";
const DISABLE =
  (process.env.BASIC_AUTH_DISABLE ?? "").toLowerCase() === "true";

// فقط روی مسیرهای ادمین اعمال شود
export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};

export function middleware(req: NextRequest) {
  // اگر غیرفعال باشد یا یوزر/پسورد ست نشده باشد، عبور
  if (DISABLE || !USER || !PASS) return NextResponse.next();

  // درخواست‌های prefetch را عبور بده
  const isPrefetch =
    req.headers.get("x-middleware-prefetch") ||
    req.headers.get("next-router-prefetch") ||
    req.headers.get("purpose") === "prefetch";
  if (isPrefetch) return NextResponse.next();

  // Basic Auth
  const auth = req.headers.get("authorization") || "";
  const [scheme, token] = auth.split(" ");
  if (scheme === "Basic" && token) {
    try {
      const [u, p] = atob(token).split(":");
      if (u === USER && p === PASS) return NextResponse.next();
    } catch {}
  }

  return new NextResponse("Auth required", {
    status: 401,
    headers: { "WWW-Authenticate": 'Basic realm="LID Admin"' },
  });
}