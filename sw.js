/* Service worker: guarda la app para que abra sin Internet. Sube el número de CACHE al publicar una versión nueva. */
const CACHE = 'control-stock-v1';
const ARCHIVOS = ['./', 'index.html', 'manifest.webmanifest', 'icons/icon-192.png', 'icons/icon-512.png', 'icons/maskable-512.png', 'icons/apple-touch-icon.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ARCHIVOS)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const r = e.request;
  if (r.method !== 'GET' || new URL(r.url).origin !== location.origin) return;
  /* Primero lo guardado (rápido y sin Internet); en segundo plano se actualiza para la próxima vez */
  e.respondWith(caches.match(r, { ignoreSearch: true }).then(hit => {
    const red = fetch(r).then(resp => { if (resp && resp.ok) { const cp = resp.clone(); caches.open(CACHE).then(c => c.put(r, cp)); } return resp; }).catch(() => hit);
    return hit || red;
  }));
});
