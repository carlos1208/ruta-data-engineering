/* Service worker: que la plataforma abra sin señal y se pueda instalar en el
 * celular. Estrategia deliberadamente simple:
 *   /api/*   siempre a la red — el progreso y el tutor nunca se sirven viejos
 *   el resto  caché primero, y en segundo plano se refresca
 */
const CACHE = "ruta-cde-v2";
const BASICOS = [
  "./", "index.html", "modulo-1.html", "bot-de-los-55.html",
  "glosario.js", "almacenamiento.js", "tutor.js", "manifest.webmanifest"
];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(BASICOS)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys()
      .then((ks) => Promise.all(ks.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (e) => {
  const url = new URL(e.request.url);
  if (e.request.method !== "GET") return;
  if (url.pathname.startsWith("/api/")) return;            // nunca desde caché
  if (url.origin !== location.origin) return;              // tipografías: que decida el navegador

  e.respondWith(
    caches.match(e.request).then((guardada) => {
      const red = fetch(e.request).then((r) => {
        if (r && r.ok) {
          const copia = r.clone();
          caches.open(CACHE).then((c) => c.put(e.request, copia));
        }
        return r;
      }).catch(() => guardada);
      return guardada || red;
    })
  );
});
