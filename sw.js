const CACHE='zoe-lista-v73';
const ASSETS=['./','./index.html','./styles.css','./list-layout-2026.css','./store-profiles-2026.css','./ui-polish-2026.css','./input-preview-2026.css','./frequent-items-2026.css','./shopping-habits-2026.css','./missing-items-2026.css','./price-history-2026.css','./store-price-memory-2026.css','./price-watch-2026.css','./pack-size-2026.css','./barcode-scanner-2026.css','./qr-share-2026.css','./voice-input-2026.css','./shopping-mode-2026.css','./list-templates-2026.css','./receipt-import-2026.css','./cloud-sync-2026.css','./undo-actions-2026.css','./list-search-2026.css','./shopping-stats-2026.css','./catalog-data.js','./market-catalog-2026.js','./family-catalog-2026.js','./family-grains-2026.js','./family-cleaning-2026.js','./family-home-tech-hygiene-2026.js','./family-mobile-charging-paint-2026.js','./family-reading-media-optics-2026.js','./family-kitchen-baking-textile-2026.js','./family-kitchenware-hydration-2026.js','./family-meat-2026.js','./family-pork-biscuits-bars-2026.js','./family-coffee-vinegar-sweet-bakery-2026.js','./family-stationery-rain-footwear-2026.js','./family-pantry-bakery-gifts-2026.js','./family-paper-insect-2026.js','./family-spices-baking-paper-2026.js','./family-garden-beauty-2026.js','./family-seeds-produce-2026.js','./family-fashion-accessories-2026.js','./family-dairy-desserts-candy-2026.js','./family-pasta-baby-2026.js','./catalog-patches.js','./produce-unit-overrides-2026.js','./catalog-stabilizer.js','./input-normalizer.js','./app.js','./unit-price-fixer.js','./price-policy.js','./list-layout-2026.js','./store-profiles-2026.js','./ui-polish-2026.js','./input-preview-2026.js','./frequent-items-2026.js','./shopping-habits-2026.js','./missing-items-2026.js','./price-history-2026.js','./pack-size-2026.js','./store-price-memory-2026.js','./price-watch-2026.js','./barcode-scanner-2026.js','./voice-input-2026.js','./qr-local-2026.js','./qr-share-2026.js','./shopping-mode-2026.js','./list-templates-2026.js','./receipt-import-2026.js','./cloud-sync-2026.js','./undo-actions-2026.js','./list-search-2026.js','./shopping-stats-2026.js','./manifest.webmanifest','./icon-192.png','./icon-512.png'];

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