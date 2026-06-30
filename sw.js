// LUMERA_HESABDARI Service Worker
// نکته مهم: هر بار که index.html را آپدیت می‌کنی، عدد CACHE_VERSION را یکی زیاد کن
// تا مرورگر بفهمد نسخه جدید آمده و کش قدیمی را دور بریزد.
const CACHE_VERSION = 'v2';
const CACHE_NAME = 'lumera-cache-' + CACHE_VERSION;
const APP_SHELL = ['./', './index.html'];

self.addEventListener('install', e=>{
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache=>cache.addAll(APP_SHELL))
  );
  self.skipWaiting();
});

self.addEventListener('activate', e=>{
  e.waitUntil(
    caches.keys().then(keys=>Promise.all(
      keys.filter(k=>k!==CACHE_NAME).map(k=>caches.delete(k))
    ))
  );
  self.clients.claim();
});

// استراتژی: شبکه را اول امتحان کن (تا همیشه نسخه به‌روز بیاد وقتی آنلاینی)،
// اگر شبکه نبود، از کش بده — این یعنی هم آپدیت‌ها سریع دیده می‌شوند هم آفلاین کار می‌کند.
self.addEventListener('fetch', e=>{
  e.respondWith(
    fetch(e.request).then(res=>{
      const resClone = res.clone();
      caches.open(CACHE_NAME).then(cache=>cache.put(e.request, resClone));
      return res;
    }).catch(()=>
      caches.match(e.request).then(cached=> cached || caches.match('./index.html'))
    )
  );
});
