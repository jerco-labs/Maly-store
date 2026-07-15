const CACHE = "malystore-v1";
self.addEventListener("install", e => e.waitUntil(caches.open(CACHE).then(c => c.addAll([
  "./",
  "./index.html",
  "./Parte01_Pagina_principal/css/style.css",
  "./Parte01_Pagina_principal/js/app.js",
  "./Parte01_Pagina_principal/data/productos.json",
  "./Parte01_Pagina_principal/img/logo.svg",
  "./Parte01_Pagina_principal/img/hero.svg",
  "./Parte01_Pagina_principal/img/Yape.jpg",
  "./Parte01_Pagina_principal/img/Plin.jpg"
]))));
self.addEventListener("fetch", e => e.respondWith(caches.match(e.request).then(r => r || fetch(e.request))));
