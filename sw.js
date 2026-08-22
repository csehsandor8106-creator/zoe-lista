const CACHE='zoe-lista-v32';
const ASSETS=['./','./index.html','./styles.css','./catalog-data.js','./market-catalog-2026.js','./family-catalog-2026.js','./family-grains-2026.js','./family-cleaning-2026.js','./family-meat-2026.js','./family-pantry-bakery-gifts-2026.js','./family-paper-insect-2026.js','./family-garden-beauty-2026.js','./family-seeds-produce-2026.js','./family-fashion-accessories-2026.js','./family-dairy-desserts-candy-2026.js','./family-pasta-baby-2026.js','./catalog-patches.js','./catalog-stabilizer.js','./input-normalizer.js','./app.js','./unit-price-fixer.js','./price-policy.js','./manifest.webmanifest','./icon-192.png','./icon-512.png'];

self.addEventListener('install',event=>{
  event.waitUntil(
    caches.open(CACHE)
      .then(c=>c.addAll(ASSETS))
      .then(()=>self.skipWaiting())
  );
});

self.addEventListener('activate',event=>{
  event.waitUntil(
    caches.keys()
      .then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k))))
      .then(()=>self.clients.claim())
  );
});

async function networkFirst(request, fallbackUrl) {
  try {
    const response = await fetch(request, {cache:'no-store'});
    const cache = await caches.open(CACHE);
    cache.put(request, response.clone());
    return response;
  } catch {
    const cached = await caches.match(request, {ignoreSearch:true});
    if (cached) return cached;
    if (fallbackUrl) return caches.match(fallbackUrl);
    throw new Error('offline');
  }
}

async function cacheFirst(request) {
  const cached = await caches.match(request, {ignoreSearch:true});
  if (cached) return cached;
  const response = await fetch(request);
  const cache = await caches.open(CACHE);
  cache.put(request, response.clone());
  return response;
}

self.addEventListener('fetch',event=>{
  const request = event.request;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  const sameOrigin = url.origin === self.location.origin;
  const freshDestinations = new Set(['document','script','style','manifest','worker']);

  if (request.mode === 'navigate') {
    event.respondWith(networkFirst(request, './index.html'));
    return;
  }

  if (sameOrigin && freshDestinations.has(request.destination)) {
    event.respondWith(networkFirst(request));
    return;
  }

  event.respondWith(cacheFirst(request));
});
