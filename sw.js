// 6ブロックウィザード：オフラインでも開けるようにアプリ本体をキャッシュする
const CACHE = '6block-v1';
const FILES = ['./', './index.html', './manifest.webmanifest', './icon-192.png', './icon-512.png', './icon-maskable-512.png', './apple-touch-icon.png'];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== location.origin) {
    // Google Fonts：取得できれば保存し、オフライン時は保存分を使う
    e.respondWith(caches.open(CACHE).then(c => fetch(req).then(r => { c.put(req, r.clone()); return r; }).catch(() => c.match(req))));
    return;
  }
  // 本体：ネット優先で最新を取り、オフライン時はキャッシュ
  e.respondWith(fetch(req).then(r => { const copy = r.clone(); caches.open(CACHE).then(c => c.put(req, copy)); return r; }).catch(() => caches.match(req).then(m => m || caches.match('./index.html'))));
});
