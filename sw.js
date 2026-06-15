// ==================== ثوابت ====================
const CACHE_NAME = 'abobasha-v1';
const CACHE_ASSETS = 'abobasha-assets-v1';
const CACHE_DYNAMIC = 'abobasha-dynamic-v1';

// الملفات الأساسية التي يجب تخزينها
const urlsToCache = [
    '/',
    '/index.html',
    '/admin.html',
    '/style.css',
    '/admin.css',
    '/app.js',
    '/admin.js',
    '/data.js',
    '/storage.js',
    '/firebase.js',
    '/manifest.json'
];

// ==================== تثبيت Service Worker ====================
self.addEventListener('install', event => {
    console.log('🔧 جاري تثبيت Service Worker...');
    
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            console.log('✅ تم فتح الـ Cache');
            
            // محاولة تخزين الملفات الأساسية
            return cache.addAll(urlsToCache).catch(err => {
                console.log('⚠️ بعض الملفات لم تتم مزامنتها (قد تكون غير موجودة)');
                // لا نرفع خطأ إذا كانت بعض الملفات غير موجودة
                return Promise.resolve();
            });
        }).catch(err => {
            console.error('❌ خطأ في فتح الـ Cache:', err);
        })
    );
    
    // تخطي انتظار التفعيل
    self.skipWaiting();
});

// ==================== تفعيل Service Worker ====================
self.addEventListener('activate', event => {
    console.log('✅ تم تفعيل Service Worker');
    
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    // حذف الـ Caches القديمة
                    if (cacheName !== CACHE_NAME && 
                        cacheName !== CACHE_ASSETS && 
                        cacheName !== CACHE_DYNAMIC) {
                        console.log('🗑️ حذف الـ Cache القديم:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
    
    // السيطرة على جميع الصفحات المفتوحة
    self.clients.claim();
});

// ==================== معالجة الطلبات ====================
self.addEventListener('fetch', event => {
    const { request } = event;
    const url = new URL(request.url);
    
    // تجاهل الطلبات غير HTTP/HTTPS
    if (!url.protocol.startsWith('http')) {
        return;
    }
    
    // معالجة الطلبات المختلفة
    if (request.method === 'GET') {
        // للصور والملفات الثابتة
        if (isAsset(request.url)) {
            event.respondWith(cacheAssets(request));
        }
        // للصفحات والملفات الديناميكية
        else {
            event.respondWith(cacheDynamic(request));
        }
    }
});

// ==================== استراتيجية تخزين الملفات الثابتة ====================
function cacheAssets(request) {
    return caches.match(request).then(response => {
        // إذا كانت الملف في الـ Cache، أرجعه
        if (response) {
            return response;
        }
        
        // وإلا، حاول جلبه من الإنترنت
        return fetch(request).then(response => {
            // تحقق من أن الاستجابة صحيحة
            if (!response || response.status !== 200 || response.type === 'error') {
                return response;
            }
            
            // خزّن نسخة من الملف
            const responseToCache = response.clone();
            caches.open(CACHE_ASSETS).then(cache => {
                cache.put(request, responseToCache);
            });
            
            return response;
        }).catch(() => {
            // إذا فشل الجلب والملف ليس في الـ Cache
            console.log('⚠️ لا يمكن جلب الملف:', request.url);
            return null;
        });
    });
}

// ==================== استراتيجية تخزين الملفات الديناميكية ====================
function cacheDynamic(request) {
    return fetch(request).then(response => {
        // تحقق من أن الاستجابة صحيحة
        if (!response || response.status !== 200 || response.type === 'error') {
            return response;
        }
        
        // خزّن نسخة من الملف
        const responseToCache = response.clone();
        caches.open(CACHE_DYNAMIC).then(cache => {
            cache.put(request, responseToCache);
        });
        
        return response;
    }).catch(() => {
        // إذا فشل الجلب، حاول الحصول على نسخة مخزنة
        return caches.match(request).then(response => {
            if (response) {
                console.log('📦 استخدام نسخة مخزنة:', request.url);
                return response;
            }
            
            // إذا كانت صفحة HTML، أرجع الصفحة الرئيسية
            if (request.headers.get('accept').includes('text/html')) {
                return caches.match('/index.html');
            }
            
            return null;
        });
    });
}

// ==================== تحديد الملفات الثابتة ====================
function isAsset(url) {
    return /\.(js|css|png|jpg|jpeg|gif|svg|woff|woff2|ttf|eot|ico)$/i.test(url);
}

// ==================== معالجة الإشعارات ====================
self.addEventListener('push', event => {
    console.log('📬 إشعار جديد:', event);
    
    if (!event.data) {
        console.log('⚠️ لا توجد بيانات في الإشعار');
        return;
    }
    
    try {
        const data = event.data.json();
        
        const options = {
            body: data.notification?.body || 'إشعار جديد',
            icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect fill="%230d1b3e" width="100" height="100" rx="20"/><text x="50" y="75" font-size="60" text-anchor="middle" fill="white">🐔</text></svg>',
            badge: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect fill="%230d1b3e" width="100" height="100" rx="20"/><text x="50" y="75" font-size="60" text-anchor="middle" fill="white">🐔</text></svg>',
            tag: 'abobasha-notification',
            requireInteraction: false,
            actions: [
                {
                    action: 'open',
                    title: 'فتح'
                },
                {
                    action: 'close',
                    title: 'إغلاق'
                }
            ]
        };
        
        event.waitUntil(
            self.registration.showNotification(
                data.notification?.title || 'مجموعة أبو باشا',
                options
            )
        );
    } catch (error) {
        console.error('❌ خطأ في معالجة الإشعار:', error);
        
        // إذا فشل التحليل، أرسل إشعار بسيط
        event.waitUntil(
            self.registration.showNotification('مجموعة أبو باشا', {
                body: event.data.text(),
                icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect fill="%230d1b3e" width="100" height="100" rx="20"/><text x="50" y="75" font-size="60" text-anchor="middle" fill="white">🐔</text></svg>'
            })
        );
    }
});

// ==================== معالجة النقر على الإشعار ====================
self.addEventListener('notificationclick', event => {
    console.log('👆 تم النقر على الإشعار:', event.action);
    
    event.notification.close();
    
    if (event.action === 'close') {
        return;
    }
    
    // فتح الموقع عند النقر على الإشعار
    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clientList => {
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
self.addEventListener('notificationclose', event => {
    console.log('❌ تم إغلاق الإشعار');
});

// ==================== معالجة الرسائل من الصفحة ====================
self.addEventListener('message', event => {
    console.log('💬 رسالة من الصفحة:', event.data);
    
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
    
    if (event.data && event.data.type === 'CLEAR_CACHE') {
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => caches.delete(cacheName))
            );
        }).then(() => {
            event.ports[0].postMessage({ success: true });
        });
    }
});

// ==================== مزامنة البيانات في الخلفية ====================
self.addEventListener('sync', event => {
    console.log('🔄 مزامنة في الخلفية:', event.tag);
    
    if (event.tag === 'sync-data') {
        event.waitUntil(
            // هنا يمكنك إضافة منطق المزامنة
            Promise.resolve()
        );
    }
});

// ==================== معالجة الأخطاء ====================
self.addEventListener('error', event => {
    console.error('❌ خطأ في Service Worker:', event.error);
});

self.addEventListener('unhandledrejection', event => {
    console.error('❌ Promise مرفوضة بدون معالج:', event.reason);
});

console.log('✅ تم تحميل Service Worker');
