const CACHE_NAME = "rivanoy-static-v1";
const DATA_CACHE = "rivanoy-data-v1";

const FILES_TO_CACHE = [
  "/",
  "/index.html",
  "/manifest.json",
  "/sw.js",
];

// Install: cache static assets
self.addEventListener("install", evt => {
  evt.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(FILES_TO_CACHE))
  );
  self.skipWaiting();
});

// Activate: clean old caches
self.addEventListener("activate", evt => {
  evt.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.map(key => {
        if(key!==CACHE_NAME && key!==DATA_CACHE) return caches.delete(key);
      })
    ))
  );
  self.clients.claim();
});

// Fetch: cache-first for static, network-first for APIs
self.addEventListener("fetch", evt => {
  if(evt.request.url.includes("open-meteo.com") || evt.request.url.includes("air-quality-api.open-meteo.com")) {
    evt.respondWith(
      caches.open(DATA_CACHE).then(cache =>
        fetch(evt.request)
          .then(resp => {cache.put(evt.request, resp.clone()); return resp;})
          .catch(()=>caches.match(evt.request))
      )
    );
    return;
  }

  evt.respondWith(
    caches.match(evt.request).then(resp => resp || fetch(evt.request))
  );
});
