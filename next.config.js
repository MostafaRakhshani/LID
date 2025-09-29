/** @type {import('next').NextConfig} */
const nextConfig = {
  // مهم: اینجا عمداً output تعریف نشده تا static export غیرفعال باشد
  // در نتیجه API Routes و Server Components در ورسل ساخته می‌شوند.
};
module.exports = nextConfig;
