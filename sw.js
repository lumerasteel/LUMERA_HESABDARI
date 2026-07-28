// سرویس‌ورکر LUMERASTEEL — نسخه ۲
// نکته مهم: استراتژی اینجا «اول شبکه» است، نه «اول کش».
// یعنی وقتی گوشی به اینترنت وصله، همیشه آخرین نسخه صفحه از سرور گرفته می‌شود
// و فقط برای حالت آفلاین (بی‌اینترنتی) از نسخه ذخیره‌شده استفاده می‌شود.
// نسخه قبلی (اول کش) باعث می‌شد بعد از هر به‌روزرسانی، برنامه نصب‌شده رو گوشی
// همچنان نسخه قدیمی و گاهی خراب را نشان بدهد.
const CACHE_NAME = 'lumerasteel-v3';
const APP_SHELL = ['./', './index.html'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL)).catch(() => {})
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200) {
          const clone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        }
        return networkResponse;
      })
      .catch(() => caches.match(event.request))
  );
});
