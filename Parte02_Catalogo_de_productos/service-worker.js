const CACHE = "malystore-v1";
self.addEventListener("install", e => e.waitUntil(caches.open(CACHE).then(c => c.addAll([
  "./",
  "./index.html",
  "./css/style.css",
  "./js/app.js",
  "./data/productos.json",
  "./img/logo.svg",
  "./img/hero.svg",
  "./img/Yape.jpg",
  "./img/Plin.jpg"
]))));
self.addEventListener("fetch", e => e.respondWith(caches.match(e.request).then(r => r || fetch(e.request))));
