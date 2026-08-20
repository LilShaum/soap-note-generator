/* Offline shell for the SOAP Note Generator.

   Network first, cache second. The cache exists so the app keeps working with
   no internet — it must never be the reason an old version stays on screen.
   Bump CACHE whenever index.html / script.js / style.css change. */
const CACHE = 'soap-generator-v7-2026-08-20';
const ASSETS = [
  './',
  'index.html',
  'style.css',
  'script.js',
  'manifest.webmanifest',
  'icon-192.png',
  'icon-512.png',
  'icon-maskable-512.png'
];
const FONT_HOSTS = ['fonts.googleapis.com', 'fonts.gstatic.com'];
const NET_TIMEOUT = 3500;   // ms before falling back to the cached copy

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c =>
      /* {cache:'reload'} skips the browser's own HTTP cache, so a fresh
         install can never pin a stale copy of the app. */
      Promise.all(ASSETS.map(url =>
        fetch(new Request(url, { cache: 'reload' }))
          .then(res => (res && res.ok) ? c.put(url, res) : null)
          .catch(() => null)
      ))
    ).then(() => self.skipWaiting()).catch(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  const sameOrigin = url.origin === self.location.origin;
  const isFont = FONT_HOSTS.indexOf(url.hostname) > -1;
  if (!sameOrigin && !isFont) return;

  /* The app itself: whatever the server has wins, with the cache as the
     safety net for no connection or a connection too slow to be useful. */
  if (sameOrigin) {
    e.respondWith(
      Promise.race([
        /* {cache:'no-cache'} forces a revalidation with the server. Without it
           `fetch` is free to answer from the browser's own HTTP cache, which is
           how a stale script.js survives a deploy. */
        fetch(new Request(req.url, { cache: 'no-cache', credentials: 'same-origin' })).then(res => {
          if (res && res.status === 200) {
            const copy = res.clone();
            caches.open(CACHE).then(c => c.put(req, copy)).catch(() => {});
          }
          return res;
        }),
        new Promise((_, reject) => setTimeout(reject, NET_TIMEOUT))
      ]).catch(() =>
        caches.match(req).then(hit =>
          hit || caches.match('index.html') || Response.error()
        )
      )
    );
    return;
  }

  /* Fonts never change: cache first. */
  e.respondWith(
    caches.match(req).then(hit => {
      if (hit) return hit;
      return fetch(req).then(res => {
        if (res && (res.status === 200 || res.type === 'opaque')) {
          const copy = res.clone();
          caches.open(CACHE).then(c => c.put(req, copy)).catch(() => {});
        }
        return res;
      }).catch(() => new Response('', { status: 504 }));
    })
  );
});
