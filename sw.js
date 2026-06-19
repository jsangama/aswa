// ASWA Service Worker v40 - https://jsangama.github.io/aswa/
const CACHE_NAME = 'aswa-v40';
const VERSION_PARAM = 'aswa_sw';
const BASE = new URL('./', self.registration.scope).pathname;
const ASSETS = [
  BASE,
  BASE + 'index.html',
  BASE + 'manifest.json',
  BASE + 'src/main.js',
  BASE + 'src/modules/app-shell.js',
  BASE + 'src/modules/cart.js',
  BASE + 'src/modules/catalog.js',
  BASE + 'src/modules/purchase-flow.js',
  BASE + 'src/modules/pwa-cache.js',
  BASE + 'src/modules/storage.js',
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
      .then(() => self.clients.claim())
      .then(() => self.clients.matchAll({ type: 'window', includeUncontrolled: true }))
      .then(list => Promise.all(list.map(client => {
        try {
          const url = new URL(client.url);
          if (url.origin !== self.location.origin) return Promise.resolve();
          if (url.searchParams.get(VERSION_PARAM) === CACHE_NAME) return Promise.resolve();
          url.searchParams.set(VERSION_PARAM, CACHE_NAME);
          return client.navigate(url.href);
        } catch (_) {
          return Promise.resolve();
        }
      })))
  );
});

self.addEventListener('fetch', e => {
  if (!e.request.url.startsWith(self.location.origin)) return;
  if (e.request.method !== 'GET') return;

  const accept = e.request.headers.get('accept') || '';
  const isHtml = e.request.mode === 'navigate' || accept.includes('text/html');
  const isImage = e.request.destination === 'image';
  if (isHtml) {
    e.respondWith(
      fetch(new Request(e.request, { cache: 'no-store' })).then(resp => {
        if (resp.status === 200) {
          const clone = resp.clone();
          caches.open(CACHE_NAME).then(c => {
            c.put(e.request, clone.clone());
            c.put(BASE, clone).catch(() => {});
          });
        }
        return resp;
      }).catch(() => caches.match(e.request).then(cached => cached || caches.match(BASE)))
    );
    return;
  }

  if (isImage) {
    e.respondWith(
      caches.match(e.request).then(cached => {
        const refresh = fetch(e.request).then(resp => {
          if (resp.status === 200) {
            const clone = resp.clone();
            caches.open(CACHE_NAME).then(c => c.put(e.request, clone));
          }
          return resp;
        }).catch(() => cached);
        return cached || refresh;
      })
    );
    return;
  }

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
