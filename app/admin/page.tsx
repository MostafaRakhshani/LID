export default function AdminIndex() {
  return (
    <main className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold">مدیریت</h1>
      <p className="mt-4">به بخش ادمین خوش آمدی.</p>
      <a href="/admin/lots" className="inline-block mt-6 underline">رفتن به لیست مزایده‌ها</a>
    </main>
  );
}
