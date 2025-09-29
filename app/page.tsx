
import Link from "next/link";

export default function Page() {
  return (
    <div className="grid md:grid-cols-2 gap-6">
      <section className="card">
        <h1 className="text-2xl font-bold text-navy mb-2">مزایدهٔ محمولهٔ پایلوت چابهار</h1>
        <p className="text-gray-700 leading-7">
          این نسخهٔ MVP است و صرفاً برای تست جریان مزایده ساخته شده. پرداخت و سپرده‌ها به‌صورت نمایشی هستند.
        </p>
        <div className="mt-4">
          <Link href="/lots" className="inline-block bg-navy text-white rounded-xl px-4 py-2 hover:opacity-90">
            مشاهدهٔ مزایده‌ها
          </Link>
        </div>
      </section>
      <section className="card">
        <h2 className="text-xl font-semibold mb-2">راهنما</h2>
        <ol className="list-decimal pr-5 space-y-1 text-gray-700">
          <li>یک لات را انتخاب کن.</li>
          <li>سپردهٔ ۲٪ را (ماک) فعال کن.</li>
          <li>در مزایده شرکت کن؛ در ۲ دقیقهٔ آخر، پایان تمدید می‌شود.</li>
        </ol>
      </section>
    </div>
  );
}
