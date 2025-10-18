// middleware.ts
import { NextRequest, NextResponse } from "next/server";

const PROTECTED = [/^\/admin(\/|$)/, /^\/api\/admin(\/|$)/];

function challenge() {
  return new NextResponse("Auth required", {
    status: 401,
    headers: { "WWW-Authenticate": 'Basic realm="LID Admin", charset="UTF-8"' },
  });
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const needAuth = PROTECTED.some((re) => re.test(pathname));
  if (!needAuth) return NextResponse.next();

  const auth = req.headers.get("authorization") || "";
  if (!auth.startsWith("Basic ")) return challenge();

  const encoded = auth.slice("Basic ".length).trim();
  const [u, p] = atob(encoded).split(":");

  if (u === process.env.ADMIN_USER && p === process.env.ADMIN_PASS) {
    return NextResponse.next();
  }

  // نکته مهم: برای رمز اشتباه هم 401 بده تا مرورگر دوباره پنجره‌ی ورود را نشان دهد
  return challenge();
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
