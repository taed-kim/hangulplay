// sw.js
const CACHE = 'hp-v4'; // ← 배포버전
const PRECACHE = [
  './index.html',
  './404.html',                
  './manifest.json',
  './css/app.css',
  './js/vendor/jquery-3.7.1.min.js',
  './js/core.combiner.js',
  './js/core.store.js',
  './js/core.sound.js',
  './js/ui.drag.js',
  './js/ui.game.js',
  './js/ui.report.js',
  './js/app.bootstrap.js',
  './assets/icons/icon-192.png',
  './assets/icons/icon-512.png'
];

// Install: 실패 항목은 건너뛰되 로그로 확인
self.addEventListener('install', (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE);
    for (const url of PRECACHE) {
      try {
        // 리다이렉트/404 잡으려고 요청 한번 확인
        const res = await fetch(url, { cache: 'reload' });
        if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
        await cache.put(url, res);
      } catch (err) {
        console.warn('[SW] precache failed:', url, err);
      }
    }
    self.skipWaiting();
  })());
});

// Activate: 오래된 캐시 정리 + 즉시 클라이언트 장악
self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)));
    await self.clients.claim();
  })());
});

// Fetch: 캐시 우선, 없으면 네트워크
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  event.respondWith((async () => {
    const hit = await caches.match(event.request);
    return hit || fetch(event.request);
  })());
});
