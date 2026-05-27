// ASWA Service Worker v16 - https://jsangama.github.io/aswa/
const CACHE_NAME = 'aswa-v16';
const BASE = '/aswa/';
const ASSETS = [
  BASE,
  BASE + 'index.html',
  BASE + 'manifest.json',
  BASE + 'assets/images/icons/icon-192.png',
  BASE + 'assets/images/icons/icon-512.png',
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(ASSETS).catch(err => console.warn('Cache install:', err));
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  if (!e.request.url.startsWith(self.location.origin)) return;
  e.respondWith(
    caches.match(e.request).then(cached => {
      return cached || fetch(e.request).then(resp => {
        if (resp.status === 200) {
          const clone = resp.clone();
          caches.open(CACHE_NAME).then(c => c.put(e.request, clone));
        }
        return resp;
      }).catch(() => caches.match(BASE));
    })
  );
});

self.addEventListener('notificationclick', e => {
  const data = e.notification?.data || {};
  const url = data.url || './index.html';
  e.notification.close();
  if (e.action === 'ok') return;
  e.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(list => {
      const appClient = list.find(c => c.url.includes('/aswa/'));
      if (appClient) {
        appClient.focus();
        if ('navigate' in appClient) return appClient.navigate(url);
        return appClient;
      }
      return clients.openWindow(url);
    })
  );
});
