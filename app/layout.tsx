// app/layout.tsx
import "cropperjs/dist/cropper.css";
import "./globals.css";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "LID — مزایده پایلوت چابهار",
  description: "مزایدهٔ محموله‌های وارداتی — نسخهٔ پایلوت",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fa" dir="rtl">
      <head>
        {/* استایل Cropper از CDN (بدون وابستگی به node_modules) */}
        <link
          rel="stylesheet"
          href="https://unpkg.com/cropperjs@1.6.2/dist/cropper.css"
        />
      </head>
      <body className="min-h-screen bg-gray-50 text-gray-900">
        <header className="bg-white border-b">
          <div className="container flex items-center justify-between h-14">
            <Link href="/" className="font-extrabold text-navy text-xl">LID</Link>
            <nav className="flex items-center gap-4 text-sm">
              <Link href="/rules" className="hover:text-teal">قوانین</Link>
              <Link href="/lots" className="hover:text-teal">مزایده‌ها</Link>
              <Link href="/dashboard" className="hover:text-teal">پنل من</Link>
              <Link href="/admin" className="hover:text-teal">ادمین</Link>
            </nav>
          </div>
        </header>

        <main className="container py-6">{children}</main>

        <footer className="border-t mt-10 py-6 text-center text-gray-500 text-sm">
          نسخهٔ پایلوت — پرداخت‌ها ماک/نمایشی است.
        </footer>
      </body>
    </html>
  );
}
