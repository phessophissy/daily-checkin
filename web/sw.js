/**
 * Service Worker Implementation
 * Offline support and caching strategies
 */

const CACHE_NAME = 'daily-checkin-v1';
const URLS_TO_CACHE = [
  '/',
  '/index.html',
  '/styles/metallic-theme.css',
  '/styles/components.css',
  '/styles/layout.css',
  '/styles/dark-theme.css',
  '/app-metallic.js',
  '/config.js',
  '/icon-192.png',
  '/icon-512.png'
];

// Install event
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Installing...');

  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[Service Worker] Caching app files');
      return cache.addAll(URLS_TO_CACHE);
    })
  );

  self.skipWaiting();
});

// Activate event
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activating...');

  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('[Service Worker] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );

  self.clients.claim();
});

// Fetch event - Cache First Strategy
self.addEventListener('fetch', (event) => {
  const { request } = event;

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Handle API calls differently
  if (request.url.includes('/api/')) {
    event.respondWith(networkFirst(request));
    return;
  }

  // For other requests, use cache-first strategy
  event.respondWith(cacheFirst(request));
});

/**
 * Cache-First Strategy
 */
async function cacheFirst(request) {
  const cache = await caches.open(CACHE_NAME);
  const cached = await cache.match(request);

  if (cached) {
    return cached;
  }

  try {
    const response = await fetch(request);

    if (response && response.status === 200) {
      cache.put(request, response.clone());
    }

    return response;
  } catch (error) {
    console.error('[Service Worker] Fetch failed:', error);
    return new Response('Offline', { status: 503 });
  }
}

/**
 * Network-First Strategy
 */
async function networkFirst(request) {
  try {
    const response = await fetch(request);

    if (response && response.status === 200) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, response.clone());
    }

    return response;
  } catch (error) {
    const cache = await caches.open(CACHE_NAME);
    const cached = await cache.match(request);

    if (cached) {
      return cached;
    }

    console.error('[Service Worker] Network request failed:', error);
    return new Response('Offline', { status: 503 });
  }
}

// Message handling
self.addEventListener('message', (event) => {
  const { type, data } = event.data;

  switch (type) {
    case 'skip-waiting':
      self.skipWaiting();
      break;

    case 'clear-cache':
      caches.delete(CACHE_NAME).then(() => {
        event.ports[0].postMessage({ success: true });
      });
      break;

    case 'get-cache-size':
      caches.open(CACHE_NAME).then(async (cache) => {
        const keys = await cache.keys();
        event.ports[0].postMessage({ size: keys.length });
      });
      break;

    case 'cache-urls':
      caches.open(CACHE_NAME).then((cache) => {
        cache.addAll(data.urls).then(() => {
          event.ports[0].postMessage({ success: true });
        }).catch((error) => {
          event.ports[0].postMessage({ error: error.message });
        });
      });
      break;
  }
});

// Background sync
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-checkins') {
    event.waitUntil(syncCheckins());
  }
});

async function syncCheckins() {
  try {
    const cache = await caches.open(CACHE_NAME);
    const request = new Request('/api/checkins/sync');
    const response = await fetch(request);

    if (response.ok) {
      console.log('[Service Worker] Checkins synced');
    }
  } catch (error) {
    console.error('[Service Worker] Sync failed:', error);
    throw error;
  }
}

// Periodic background sync
self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'update-checkins') {
    event.waitUntil(updateCheckins());
  }
});

async function updateCheckins() {
  try {
    const response = await fetch('/api/checkins/updates');
    const data = await response.json();
    console.log('[Service Worker] Checkins updated:', data);
  } catch (error) {
    console.error('[Service Worker] Update failed:', error);
  }
}

console.log('[Service Worker] Loaded');
