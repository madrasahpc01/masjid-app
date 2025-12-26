// sw.js

const CACHE_NAME = 'umarmasjid-shell-v1';
const OFFLINE_URLS = [
  '/index.html',
  '/manifest.json',
  '/azan-alerts.js',
  '/azan.mp3',
  '/logo.png'
  // add CSS, images, etc. here as needed
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(OFFLINE_URLS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(self.clients.claim());
});

// Basic offline support
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(resp => resp || fetch(event.request))
  );
});

// Handle incoming push messages
self.addEventListener('push', event => {
  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch (e) {
    console.warn('Push data parse error', e);
  }

  const title = data.title || 'Azan Reminder';
  const body = data.body || 'It is time for prayer.';
  const icon = data.icon || '/icons/maskable-192.png';
  const urlToOpen = data.url || '/index.html';
  const tag = data.tag || 'azan-alert';

  const options = {
    body,
    icon,
    badge: icon,
    data: { urlToOpen },
    tag,
    renotify: true
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

// When user taps the notification
self.addEventListener('notificationclick', event => {
  event.notification.close();
  const url = event.notification.data && event.notification.data.urlToOpen;

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(list => {
      for (const client of list) {
        if (client.url.includes(url) && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(url || '/index.html');
      }
    })
  );
});