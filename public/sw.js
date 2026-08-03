const CACHE_VERSION = 'v2';
const CACHE_NAME = `closerush-pwa-cache-${CACHE_VERSION}`;

// Assets to cache immediately on install
const PRECACHE_ASSETS = [
  '/',
  '/manifest.json',
  '/logo.png',
  '/image.png'
];

// Install event: cache core assets
self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_ASSETS);
    })
  );
});

// Activate event: clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch event: Network-first for navigation/API, Stale-while-revalidate for static assets
self.addEventListener('fetch', (event) => {
  // Ignore non-GET requests (e.g. POST for payments, form submissions)
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);

  // Ignore Chrome extensions or external non-http schemes
  if (!url.protocol.startsWith('http')) return;

  // For API requests, skip caching to ensure fresh data and proper payments
  if (url.pathname.startsWith('/api/')) {
    return;
  }

  // Strategy for static assets (images, css, js)
  if (url.pathname.match(/\.(png|jpg|jpeg|svg|css|js|woff2|woff)$/) || url.pathname.startsWith('/_next/static/')) {
    event.respondWith(
      caches.match(event.request).then((cachedResponse) => {
        const fetchPromise = fetch(event.request).then((networkResponse) => {
          // Update cache with new response
          if (networkResponse && networkResponse.status === 200) {
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseToCache);
            });
          }
          return networkResponse;
        }).catch(() => {
          // Ignore fetch errors for static assets if we have cache
        });
        
        return cachedResponse || fetchPromise;
      })
    );
    return;
  }

  // Strategy for HTML documents (Network-first with offline fallback)
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          return caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, response.clone());
            return response;
          });
        })
        .catch(() => {
          return caches.match(event.request).then((cachedResponse) => {
            if (cachedResponse) {
              return cachedResponse;
            }
            // If nothing is found, return the cached homepage as fallback
            return caches.match('/');
          });
        })
    );
  }
});

// --- PUSH NOTIFICATIONS ---

self.addEventListener('push', function(event) {
  if (event.data) {
    try {
      const data = event.data.json();
      const options = {
        body: data.message,
        icon: '/logo.png',
        image: data.image || null,
        badge: '/logo.png',
        data: {
          url: data.url || '/'
        }
      };
      
      event.waitUntil(
        self.registration.showNotification(data.title || 'Close Rush', options)
      );
    } catch (e) {
      console.error('Push event error:', e);
    }
  }
});

self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  const urlToOpen = event.notification.data?.url || '/';
  
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function(clientList) {
      // If a window is already open, focus it and navigate
      for (let i = 0; i < clientList.length; i++) {
        const client = clientList[i];
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          client.navigate(urlToOpen);
          return client.focus();
        }
      }
      // Otherwise open a new window
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});
