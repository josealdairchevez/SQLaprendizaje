// ═══════════════════════════════════════════════════
//  SERVICE WORKER PWA — SQL Mastery
//  Estrategia Offline-First de Alto Rendimiento
// ═══════════════════════════════════════════════════

const CACHE_VERSION = 'v1';
const CACHE_NAME = 'sql-mastery-' + CACHE_VERSION;

const ASSETS_PROPIOS = [
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png',
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(ASSETS_PROPIOS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  if (e.request.method !== 'GET') return;
  if (url.protocol === 'chrome-extension:') return;

  // 1. Archivos propios y de GitHub Pages (Cache First, fallback to Network)
  if (url.hostname.includes('github.io') || url.hostname === location.hostname) {
    e.respondWith(
      caches.match(e.request).then(cached => {
        if (cached) return cached;
        return fetch(e.request)
          .then(response => {
            if (response && response.status === 200) {
              const clone = response.clone();
              caches.open(CACHE_NAME).then(c => c.put(e.request, clone));
            }
            return response;
          })
          .catch(() => caches.match('./index.html'));
      })
    );
    return;
  }

  // 2. Librerías externas (Tailwind, CodeMirror, SQL.js)
  if (url.hostname.includes('gstatic.com') || url.hostname.includes('cdnjs.cloudflare.com') || url.hostname.includes('cdn.tailwindcss.com') || url.hostname.includes('cdn.jsdelivr.net')) {
    e.respondWith(
      caches.match(e.request).then(cached => {
        if (cached) return cached;
        return fetch(e.request).then(response => {
          if (response && response.status === 200) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then(c => c.put(e.request, clone));
          }
          return response;
        }).catch(() => cached || new Response('', { status: 503 }));
      })
    );
    return;
  }

  // 3. Consultas a Firebase Firestore (Sincronización de Datos)
  // Ignoramos la caché para Firebase, dejándolo pasar directo a la red.
  // La SDK de Firestore maneja su propia persistencia offline internamente.
  if (url.hostname.includes('firebase') || url.hostname.includes('firestore.googleapis.com')) {
    e.respondWith(fetch(e.request));
    return;
  }

  // 4. Todo lo demás
  e.respondWith(
    fetch(e.request)
      .then(response => {
        if (response && response.status === 200 && response.type !== 'opaque') {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(c => c.put(e.request, clone));
        }
        return response;
      })
      .catch(() => caches.match(e.request))
  );
});
