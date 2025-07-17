const CACHE_NAME = 'savemycgpa-v1';
const urlsToCache = [
  '/',
  '/static/js/bundle.js',
  '/static/css/main.css',
  '/Operation-save-my-CGPA-09.svg'
];

// Install event
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
  );
});

// Fetch event
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        if (response) {
          return response;
        }
        return fetch(event.request);
      })
  );
});

self.addEventListener('install', function(event) {
  console.log('Service Worker installing...')
  self.skipWaiting()
})

self.addEventListener('activate', function(event) {
  console.log('Service Worker activating...')
  event.waitUntil(self.clients.claim())
})

self.addEventListener('push', function(event) {
  console.log('Push event received:', event)

  if (event.data) {
    try {
      const data = event.data.json()
      console.log('Push data:', data)

      const options = {
        body: data.body,
        icon: data.icon || '/Operation-save-my-CGPA-09.svg',
        badge: data.badge || '/Operation-save-my-CGPA-09.svg',
        tag: 'savemycgpa-notification',
        renotify: true,
        requireInteraction: false,
        data: {
          url: data.url || '/',
          timestamp: data.timestamp || Date.now()
        }
      }

      event.waitUntil(
        self.registration.showNotification(data.title || 'Save My CGPA', options)
      )
    } catch (error) {
      console.error('Error parsing push data:', error)
    }
  }
})

self.addEventListener('notificationclick', function(event) {
  console.log('Notification clicked:', event.notification)
  event.notification.close()

  const url = event.notification.data?.url || '/'

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function(clientList) {
      // Check if there's already a window/tab open with the target URL
      for (const client of clientList) {
        if (client.url === url && 'focus' in client) {
          return client.focus()
        }
      }
      // If not, open a new window/tab
      if (clients.openWindow) {
        return clients.openWindow(url)
      }
    })
  )
})

self.addEventListener('notificationclose', function(event) {
  console.log('Notification closed:', event.notification)
})