import { headers } from "next/headers";

/** Build absolute URL on server (localhost & Vercel safe) */
export function abs(path: string) {
  const h = headers();
  const host =
    h.get("x-forwarded-host") ??
    h.get("host") ??
    "localhost:3000";
  const proto =
    h.get("x-forwarded-proto") ??
    (process.env.NODE_ENV === "production" ? "https" : "http");
  return `${proto}://${host}${path}`;
}
