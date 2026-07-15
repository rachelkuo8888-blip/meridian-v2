/**
 * Meridian Service Worker v1
 *
 * Cache strategy:
 * - Network-first for API routes (/api/*)
 * - Cache-first for static assets (js, css, fonts, images)
 * - Network-first for navigation requests (precached routes)
 */

const CACHE_NAME = 'meridian-v1';

const PRECACHE_URLS = [
  '/',
  '/today',
  '/blueprint',
  '/coach',
  '/learn',
  '/discover',
  '/pricing',
];

// ─── Install: precache key routes ───

self.addEventListener('install', (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE_NAME);
      try {
        await cache.addAll(PRECACHE_URLS);
        console.log('[SW] Precached routes');
      } catch (err) {
        console.warn('[SW] Precaching failed for some routes:', err);
      }
      await self.skipWaiting();
    })(),
  );
});

// ─── Activate: claim clients + clean old caches ───

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      await self.clients.claim();
      // Clean old caches
      const cacheNames = await caches.keys();
      const oldCaches = cacheNames.filter((name) => name !== CACHE_NAME);
      await Promise.all(oldCaches.map((name) => caches.delete(name)));
      console.log('[SW] Activated, old caches cleaned');
    })(),
  );
});

// ─── Fetch: routing by request type ───

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Network-first for API routes
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(networkFirst(request));
    return;
  }

  // Cache-first for static assets
  if (
    request.destination === 'script' ||
    request.destination === 'style' ||
    request.destination === 'font' ||
    request.destination === 'image' ||
    /\.(js|css|woff2?|png|jpg|svg|ico|webp)$/i.test(url.pathname)
  ) {
    event.respondWith(cacheFirst(request));
    return;
  }

  // Network-first for navigation (HTML)
  if (request.mode === 'navigate') {
    event.respondWith(networkFirst(request));
    return;
  }

  // Default: network-first
  event.respondWith(networkFirst(request));
});

// ─── Strategies ───

async function networkFirst(request) {
  try {
    const response = await fetch(request);
    // Cache successful responses
    if (response.ok || response.type === 'opaqueredirect') {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    const cached = await caches.match(request);
    if (cached) {
      return cached;
    }
    // Return offline fallback
    return new Response('Offline - Meridian is unavailable right now.', {
      status: 503,
      statusText: 'Service Unavailable',
      headers: { 'Content-Type': 'text/plain' },
    });
  }
}

async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) {
    return cached;
  }
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    return new Response('Offline', {
      status: 503,
      statusText: 'Service Unavailable',
      headers: { 'Content-Type': 'text/plain' },
    });
  }
}
