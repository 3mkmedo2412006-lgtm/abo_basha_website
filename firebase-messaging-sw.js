importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

firebase.initializeApp({
    apiKey: "AIzaSyBRdFA_TGCClkDBcqQnLAIvD4IuE-kQdiM",
    authDomain: "abobasha-1999.firebaseapp.com",
    databaseURL: "https://abobasha-1999-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "abobasha-1999",
    storageBucket: "abobasha-1999.firebasestorage.app",
    messagingSenderId: "794265969986",
    appId: "1:794265969986:web:48b61f4b17c18e63d194db"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage(payload => {
    const title = payload.notification?.title || 'مجموعة أبو باشا';

    const options = {
        body: payload.notification?.body || 'تم تحديث الأسعار',
        icon: '/assets/tarboosh.png',
        badge: '/assets/tarboosh.png',
        data: {
            url: payload.data?.url || '/#prices'
        }
    };

    self.registration.showNotification(title, options);
});

self.addEventListener('notificationclick', event => {
    event.notification.close();

    const url = event.notification.data?.url || '/#prices';

    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clientList => {
            for (const client of clientList) {
                if ('focus' in client) {
                    client.navigate(url);
                    return client.focus();
                }
            }

            return clients.openWindow(url);
        })
    );
});
