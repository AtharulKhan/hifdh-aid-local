
const CACHE_NAME = 'hifdh-aid-v4';
const urlsToCache = [
  '/',
  '/manifest.json'
];

// Install service worker
self.addEventListener('install', (event) => {
  console.log('Service Worker installing...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
      .catch((error) => {
        console.error('Failed to cache resources during install:', error);
      })
  );
  // Don't force activation to prevent conflicts
});

// Activate service worker
self.addEventListener('activate', (event) => {
  console.log('Service Worker activating...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Simplified fetch strategy to avoid module loading conflicts
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  
  // Skip service worker for:
  // - External domains
  // - API requests
  // - Node modules (to fix the import error)
  // - Analytics
  if (url.origin !== location.origin || 
      event.request.url.includes('/api/') ||
      event.request.url.includes('/node_modules/') ||
      event.request.url.includes('supabase') ||
      event.request.url.includes('posthog') ||
      event.request.url.includes('gtag') ||
      event.request.url.includes('googletagmanager') ||
      event.request.url.includes('.js') ||
      event.request.url.includes('.mjs') ||
      event.request.url.includes('.ts') ||
      event.request.url.includes('.tsx')) {
    return;
  }

  // Only cache basic navigation requests
  if (event.request.destination === 'document') {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          if (response.ok) {
            const cache = caches.open(CACHE_NAME);
            cache.then(c => c.put(event.request, response.clone()));
          }
          return response;
        })
        .catch(() => {
          return caches.match('/') || caches.match(event.request);
        })
    );
  }
});

// Handle service worker messages
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// Error handling
self.addEventListener('error', (event) => {
  console.error('Service worker error:', event.error);
});

self.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection in service worker:', event.reason);
});
