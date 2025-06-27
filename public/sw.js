
const CACHE_NAME = 'hifdh-aid-v3';
const urlsToCache = [
  '/',
  '/static/js/bundle.js',
  '/static/css/main.css',
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
  // Force the waiting service worker to become the active service worker
  self.skipWaiting();
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
    }).then(() => {
      // Take control of all pages immediately
      return self.clients.claim();
    })
  );
});

// Fetch event with improved caching strategy
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  
  // Skip caching for API requests and external domains
  if (url.origin !== location.origin || 
      event.request.url.includes('/api/') ||
      event.request.url.includes('supabase') ||
      event.request.url.includes('posthog') ||
      event.request.url.includes('gtag') ||
      event.request.url.includes('googletagmanager')) {
    return;
  }

  event.respondWith(
    (async () => {
      try {
        // For HTML documents, try network first
        if (event.request.destination === 'document') {
          try {
            const networkResponse = await fetch(event.request);
            if (networkResponse.ok) {
              // Update cache with fresh content
              const cache = await caches.open(CACHE_NAME);
              cache.put(event.request, networkResponse.clone());
              return networkResponse;
            }
          } catch (networkError) {
            console.log('Network failed, trying cache:', networkError);
          }
          
          // Fallback to cache for HTML
          const cachedResponse = await caches.match(event.request);
          if (cachedResponse) {
            return cachedResponse;
          }
          
          // Final fallback to index.html for navigation
          return caches.match('/');
        }
        
        // For static assets, try cache first
        const cachedResponse = await caches.match(event.request);
        if (cachedResponse) {
          return cachedResponse;
        }
        
        // If not in cache, fetch from network and cache it
        const networkResponse = await fetch(event.request);
        if (networkResponse.ok) {
          const cache = await caches.open(CACHE_NAME);
          cache.put(event.request, networkResponse.clone());
        }
        return networkResponse;
        
      } catch (error) {
        console.error('Fetch failed:', error);
        
        // Fallback to cache
        const cachedResponse = await caches.match(event.request);
        if (cachedResponse) {
          return cachedResponse;
        }
        
        // Final fallback for navigation requests
        if (event.request.destination === 'document') {
          return caches.match('/');
        }
        
        throw error;
      }
    })()
  );
});

// Handle service worker updates
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// Handle unhandled promise rejections
self.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection in service worker:', event.reason);
});

// Handle errors
self.addEventListener('error', (event) => {
  console.error('Service worker error:', event.error);
});
