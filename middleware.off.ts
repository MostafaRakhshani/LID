import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

// کلید قطع اضطراری (برای اطمینان از اینکه از این سمت مشکلی نیست)
const DISABLED = process.env.BASIC_AUTH_DISABLE === "true";

// فقط اگر هر دو مقدار تنظیم شده باشند، Basic Auth فعال می‌شود
const USER = process.env.ADMIN_USER || "";
const PASS = process.env.ADMIN_PASS || "";

export function middleware(req: NextRequest) {
  if (DISABLED || !USER || !PASS) return NextResponse.next();

  const basicAuth = req.headers.get("authorization");
  if (basicAuth) {
    const [scheme, token] = basicAuth.split(" ");
    if (scheme === "Basic") {
      const [u, p] = atob(token).split(":");
      if (u === USER && p === PASS) return NextResponse.next();
    }
  }

  return new NextResponse("Authentication required", {
    status: 401,
    headers: { "WWW-Authenticate": 'Basic realm="LID Admin Area"' },
  });
}

// فقط مسیرهای ادمین را بپوشان
export const config = {
  matcher: [
    "/admin",
    "/admin/:path*",
    "/dashboard",
    "/api/admin/:path*",
  ],
};
