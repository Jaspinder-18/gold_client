// Firebase Cloud Messaging Service Worker for Gold Alert Terminal Web Push
importScripts('https://www.gstatic.com/firebasejs/10.13.2/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.13.2/firebase-messaging-compat.js');

// Initialize Firebase with the project credentials
firebase.initializeApp({
  apiKey: 'AIzaSyDBXUjucFx4R-Ydvx2S_buZh3aNiq-EuwQ',
  appId: '1:395068005465:web:b2089e9f93539281a70014',
  messagingSenderId: '395068005465',
  projectId: 'alert-96e3b',
  storageBucket: 'alert-96e3b.firebasestorage.app'
});

const messaging = firebase.messaging();

// Background message handler when browser tab is inactive, minimized, or closed
messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Background push received:', payload);

  const data = payload.data || {};
  const notification = payload.notification || {};

  const title = notification.title || data.title || '🚨 GOLD PRICE ALERT TOUCHED';
  const body = notification.body || data.body || data.message || 'Target price touched. Click to view live chart.';
  const image = notification.imageUrl || data.screenshotUrl || null;
  const alertId = data.alertId || `alert_${Date.now()}`;

  const notificationOptions = {
    body,
    icon: '/favicon.ico',
    badge: '/favicon.ico',
    image: image || undefined,
    tag: alertId,
    renotify: true,
    requireInteraction: true,
    vibrate: [300, 100, 300, 100, 600],
    data: {
      url: '/',
      alertId,
      symbol: data.symbol || 'XAUUSD',
      targetPrice: data.targetPrice,
      timestamp: Date.now()
    },
    actions: [
      { action: 'open_chart', title: '📈 View Chart' },
      { action: 'dismiss', title: '✕ Dismiss' }
    ]
  };

  return self.registration.showNotification(title, notificationOptions);
});

// Notification click handling
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'dismiss') {
    return;
  }

  // Open or focus the app window
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      // If a window is already open, focus it
      for (const client of windowClients) {
        if ('focus' in client) {
          return client.focus();
        }
      }
      // Otherwise open a new window
      if (clients.openWindow) {
        return clients.openWindow('/');
      }
    })
  );
});
