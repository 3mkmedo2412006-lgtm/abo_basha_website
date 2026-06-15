// ==================== استيراد Firebase ====================
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

// ==================== تهيئة Firebase ====================
const firebaseConfig = {
    apiKey: "AIzaSyBRdFA_TGCClkDBcqQnLAIvD4IuE-kQdiM",
    authDomain: "abobasha-1999.firebaseapp.com",
    databaseURL: "https://abobasha-1999-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "abobasha-1999",
    storageBucket: "abobasha-1999.firebasestorage.app",
    messagingSenderId: "794265969986",
    appId: "1:794265969986:web:48b61f4b17c18e63d194db",
    measurementId: "G-8CTMHXEBXB"
};

// تهيئة Firebase
try {
    firebase.initializeApp(firebaseConfig);
    console.log('✅ تم تهيئة Firebase في Service Worker');
} catch (error) {
    console.error('❌ خطأ في تهيئة Firebase:', error);
}

// الحصول على Firebase Messaging
const messaging = firebase.messaging();

// ==================== معالجة الإشعارات في الخلفية ====================
messaging.onBackgroundMessage((payload) => {
    console.log('📬 إشعار في الخلفية:', payload);
    
    const notificationTitle = payload.notification?.title || 'مجموعة أبو باشا';
    const notificationOptions = {
        body: payload.notification?.body || 'إشعار جديد',
        icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect fill="%230d1b3e" width="100" height="100" rx="20"/><text x="50" y="75" font-size="60" text-anchor="middle" fill="white">🐔</text></svg>',
        badge: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect fill="%230d1b3e" width="100" height="100" rx="20"/><text x="50" y="75" font-size="60" text-anchor="middle" fill="white">🐔</text></svg>',
        tag: 'abobasha-notification',
        requireInteraction: false,
        data: {
            dateOfArrival: Date.now(),
            primaryKey: 1,
            ...payload.data
        },
        actions: [
            {
                action: 'open',
                title: 'فتح الموقع'
            },
            {
                action: 'close',
                title: 'إغلاق'
            }
        ]
    };
    
    // إضافة صورة إذا كانت موجودة
    if (payload.notification?.image) {
        notificationOptions.image = payload.notification.image;
    }
    
    // عرض الإشعار
    return self.registration.showNotification(notificationTitle, notificationOptions);
});

// ==================== معالجة النقر على الإشعار ====================
self.addEventListener('notificationclick', (event) => {
    console.log('👆 تم النقر على الإشعار:', event.action);
    
    event.notification.close();
    
    // إذا كان الإجراء "إغلاق"
    if (event.action === 'close') {
        return;
    }
    
    // فتح الموقع عند النقر على الإشعار
    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
            // ابحث عن نافذة مفتوحة بالفعل
            for (let i = 0; i < clientList.length; i++) {
                const client = clientList[i];
                if (client.url === '/' && 'focus' in client) {
                    return client.focus();
                }
            }
            
            // إذا لم توجد نافذة مفتوحة، افتح واحدة جديدة
            if (clients.openWindow) {
                return clients.openWindow('/');
            }
        })
    );
});

// ==================== معالجة إغلاق الإشعار ====================
self.addEventListener('notificationclose', (event) => {
    console.log('❌ تم إغلاق الإشعار');
});

// ==================== معالجة الرسائل من الصفحة ====================
self.addEventListener('message', (event) => {
    console.log('💬 رسالة من الصفحة:', event.data);
    
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
});

// ==================== معالجة الأخطاء ====================
self.addEventListener('error', (event) => {
    console.error('❌ خطأ في Firebase Messaging Service Worker:', event.error);
});

self.addEventListener('unhandledrejection', (event) => {
    console.error('❌ Promise مرفوضة بدون معالج:', event.reason);
});

console.log('✅ تم تحميل Firebase Messaging Service Worker');
