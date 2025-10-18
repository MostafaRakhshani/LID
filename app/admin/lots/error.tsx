"use client";
export default function ErrorState({ error }: { error: Error }) {
  return (
    <div className="mx-auto max-w-5xl py-10 text-center text-red-600">
      خطا در بارگذاری مزایده‌ها: {error.message}
    </div>
  );
}
