// Service worker: permite instalar el juego y jugarlo sin conexión.
// Primero intenta la red (así los testers reciben las versiones nuevas) y si no hay conexión usa la copia guardada.
// La versión viene de CFG.version (game.js la pasa en la URL): al cambiarla se descarta la copia vieja.
const VERSION = 'cosmo-' + (new URL(location.href).searchParams.get('v') || 'dev');
const FILES = ['./', 'index.html', 'style.css', 'game.js', 'manifest.webmanifest', 'icon-192.png', 'icon-512.png', 'apple-touch-icon.png'];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(VERSION).then((c) => c.addAll(FILES)));
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== VERSION).map((k) => caches.delete(k)))));
  self.clients.claim();
});

self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);
  if (e.request.method !== 'GET' || url.origin !== location.origin) return; // la analítica va directo a la red
  e.respondWith(
    // no-cache: siempre le pregunta al servidor si hay versión nueva (si no cambió, la respuesta es mínima).
    fetch(e.request, { cache: 'no-cache' })
      .then((res) => {
        const copy = res.clone();
        caches.open(VERSION).then((c) => c.put(e.request, copy));
        return res;
      })
      .catch(() => caches.match(e.request, { ignoreSearch: true }))
  );
});
