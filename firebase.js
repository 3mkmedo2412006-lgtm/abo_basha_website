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

let firebaseInitialized = false;
let firebaseDb = null;
let firebaseStorage = null;
let firebaseMessaging = null;

// ==================== تهيئة Firebase ====================
function initializeFirebase() {
    try {
        if (!firebase.apps.length) {
            firebase.initializeApp(firebaseConfig);
            firebaseDb = firebase.database();
            firebaseStorage = firebase.storage();
            firebaseMessaging = firebase.messaging();
            firebaseInitialized = true;
            console.log('✅ تم تهيئة Firebase');
            
            // إعداد الإشعارات
            setupNotifications();
            
            // تسجيل Service Worker الخاص بـ Firebase
            registerFirebaseMessagingServiceWorker();
        }
    } catch (error) {
        console.error('❌ خطأ في تهيئة Firebase:', error);
    }
}

// ==================== تسجيل Firebase Messaging Service Worker ====================
function registerFirebaseMessagingServiceWorker() {
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/firebase-messaging-sw.js').then(registration => {
            console.log('✅ تم تسجيل Firebase Messaging Service Worker');
            
            // تعيين Service Worker إلى Firebase Messaging
            if (firebaseMessaging) {
                firebaseMessaging.useServiceWorker(registration);
            }
        }).catch(error => {
            console.error('❌ خطأ في تسجيل Firebase Messaging Service Worker:', error);
        });
    }
}

// ==================== تسجيل Service Worker العام ====================
function registerServiceWorker() {
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('/sw.js').then(registration => {
                console.log('✅ تم تسجيل Service Worker');
                
                // التحقق من التحديثات
                registration.addEventListener('updatefound', () => {
                    const newWorker = registration.installing;
                    newWorker.addEventListener('statechange', () => {
                        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                            console.log('🔄 تحديث جديد متاح');
                            showUpdateNotification();
                        }
                    });
                });
            }).catch(error => {
                console.error('❌ خطأ في تسجيل Service Worker:', error);
            });
        });
    }
}

// ==================== إظهار إشعار التحديث ====================
function showUpdateNotification() {
    const message = 'تحديث جديد متاح. هل تريد تحديث الموقع؟';
    if (confirm(message)) {
        window.location.reload();
    }
}

// ==================== الإشعارات ====================
function setupNotifications() {
    if (!firebaseMessaging) return;

    // طلب إذن الإشعارات
    Notification.requestPermission().then(permission => {
        if (permission === 'granted') {
            console.log('✅ تم السماح بالإشعارات');
            
            // الحصول على رمز الجهاز
            firebaseMessaging.getToken({
                vapidKey: 'Sx76uoGEG0j5FqZgpA2Nc0Jw6eAMYRXMV9Ei26Rg3gI'
            }).then(token => {
                if (token) {
                    console.log('📱 رمز الجهاز:', token);
                    addNotificationSubscriber(token);
                    localStorage.setItem('abobasha_notification_token', token);
                }
            }).catch(error => {
                console.error('❌ خطأ في الحصول على رمز الجهاز:', error);
            });

            // استقبال الإشعارات في المقدمة
            firebaseMessaging.onMessage(payload => {
                console.log('📬 إشعار جديد في المقدمة:', payload);
                showNotificationPopup(
                    payload.notification?.title || 'مجموعة أبو باشا',
                    payload.notification?.body || 'إشعار جديد'
                );
            });
        } else if (permission === 'denied') {
            console.log('❌ تم رفض الإشعارات');
        }
    }).catch(error => {
        console.error('❌ خطأ في طلب الإذن:', error);
    });
}

// ==================== عرض الإشعار المنبثق ====================
function showNotificationPopup(title, body) {
    if (Notification.permission === 'granted') {
        new Notification(title, {
            body: body,
            icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect fill="%230d1b3e" width="100" height="100" rx="20"/><text x="50" y="75" font-size="60" text-anchor="middle" fill="white">🐔</text></svg>',
            badge: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect fill="%230d1b3e" width="100" height="100" rx="20"/><text x="50" y="75" font-size="60" text-anchor="middle" fill="white">🐔</text></svg>',
            tag: 'abobasha-notification',
            requireInteraction: false
        });
    }
}

// ==================== إضافة المشترك في الإشعارات ====================
function addNotificationSubscriber(token) {
    if (!firebaseDb) return;
    
    const subscribersRef = firebaseDb.ref('notificationSubscribers');
    subscribersRef.child(token).set({
        subscribedAt: new Date().toISOString(),
        deviceId: getDeviceId()
    }).then(() => {
        console.log('✅ تم إضافة المشترك');
    }).catch(error => {
        console.error('❌ خطأ في إضافة المشترك:', error);
    });
}

// ==================== إرسال الإشعارات ====================
function sendNotificationToAll(title, message) {
    if (!firebaseDb) return;

    const notificationRef = firebaseDb.ref('notifications').push();
    notificationRef.set({
        title: title,
        message: message,
        timestamp: new Date().toISOString(),
        read: false
    }).then(() => {
        console.log('✅ تم إرسال الإشعار');
        
        // إرسال إشعار محلي أيضاً
        showNotificationPopup(title, message);
    }).catch(error => {
        console.error('❌ خطأ في إرسال الإشعار:', error);
    });
}

// ==================== رفع الصور ====================
function uploadImage(file, path) {
    return new Promise((resolve, reject) => {
        if (!firebaseStorage) {
            reject(new Error('Firebase Storage غير مهيأ'));
            return;
        }

        // التحقق من نوع الملف
        if (!file.type.startsWith('image/')) {
            reject(new Error('الملف يجب أن يكون صورة'));
            return;
        }

        // التحقق من حجم الملف (أقصى 5 MB)
        if (file.size > 5 * 1024 * 1024) {
            reject(new Error('حجم الصورة كبير جداً (أقصى 5 MB)'));
            return;
        }

        const fileName = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const storageRef = firebaseStorage.ref(`${path}/${fileName}`);

        const uploadTask = storageRef.put(file);

        uploadTask.on('state_changed',
            snapshot => {
                const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                console.log(`📤 تقدم رفع الصورة: ${progress.toFixed(2)}%`);
            },
            error => {
                console.error('❌ خطأ في رفع الصورة:', error);
                reject(error);
            },
            () => {
                uploadTask.snapshot.ref.getDownloadURL().then(downloadURL => {
                    console.log('✅ تم رفع الصورة:', downloadURL);
                    resolve(downloadURL);
                }).catch(error => {
                    console.error('❌ خطأ في الحصول على رابط الصورة:', error);
                    reject(error);
                });
            }
        );
    });
}

// ==================== رفع الفيديوهات ====================
function uploadVideo(file, path) {
    return new Promise((resolve, reject) => {
        if (!firebaseStorage) {
            reject(new Error('Firebase Storage غير مهيأ'));
            return;
        }

        // التحقق من نوع الملف
        if (!file.type.startsWith('video/')) {
            reject(new Error('الملف يجب أن يكون فيديو'));
            return;
        }

        // التحقق من حجم الملف (أقصى 100 MB)
        if (file.size > 100 * 1024 * 1024) {
            reject(new Error('حجم الفيديو كبير جداً (أقصى 100 MB)'));
            return;
        }

        const fileName = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const storageRef = firebaseStorage.ref(`${path}/${fileName}`);

        const uploadTask = storageRef.put(file);

        uploadTask.on('state_changed',
            snapshot => {
                const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                console.log(`🎥 تقدم رفع الفيديو: ${progress.toFixed(2)}%`);
            },
            error => {
                console.error('❌ خطأ في رفع الفيديو:', error);
                reject(error);
            },
            () => {
                uploadTask.snapshot.ref.getDownloadURL().then(downloadURL => {
                    console.log('✅ تم رفع الفيديو:', downloadURL);
                    resolve(downloadURL);
                }).catch(error => {
                    console.error('❌ خطأ في الحصول على رابط الفيديو:', error);
                    reject(error);
                });
            }
        );
    });
}

// ==================== مزامنة البيانات إلى Firebase ====================
function syncDataToFirebase() {
    if (!firebaseDb) {
        console.error('❌ Firebase Database غير متصل');
        return Promise.reject(new Error('Firebase Database غير متصل'));
    }

    const data = exportAllData();
    const dbRef = firebaseDb.ref('appData');

    return dbRef.set(data).then(() => {
        console.log('✅ تم مزامنة البيانات مع Firebase');
        return true;
    }).catch(error => {
        console.error('❌ خطأ في المزامنة:', error);
        return false;
    });
}

// ==================== جلب البيانات من Firebase ====================
function syncDataFromFirebase() {
    if (!firebaseDb) {
        console.error('❌ Firebase Database غير متصل');
        return Promise.reject(new Error('Firebase Database غير متصل'));
    }

    const dbRef = firebaseDb.ref('appData');

    return dbRef.once('value').then(snapshot => {
        const data = snapshot.val();
        if (data) {
            importAllData(data);
            console.log('✅ تم تحديث البيانات من Firebase');
            return true;
        } else {
            console.log('⚠️ لا توجد بيانات في Firebase');
            return false;
        }
    }).catch(error => {
        console.error('❌ خطأ في جلب البيانات:', error);
        return false;
    });
}

// ==================== الاستماع للتغييرات في الوقت الفعلي ====================
function listenToDataChanges(callback) {
    if (!firebaseDb) {
        console.error('❌ Firebase Database غير متصل');
        return;
    }

    const dbRef = firebaseDb.ref('appData');

    dbRef.on('value', snapshot => {
        const data = snapshot.val();
        if (data) {
            console.log('🔄 تم تحديث البيانات من Firebase');
            callback(data);
        }
    }, error => {
        console.error('❌ خطأ في الاستماع للتغييرات:', error);
    });
}

// ==================== إيقاف الاستماع للتغييرات ====================
function stopListeningToDataChanges() {
    if (!firebaseDb) return;

    const dbRef = firebaseDb.ref('appData');
    dbRef.off('value');
    console.log('✅ تم إيقاف الاستماع للتغييرات');
}

// ==================== حفظ البيانات في Realtime Database ====================
function saveDataToFirebase(path, data) {
    if (!firebaseDb) {
        console.error('❌ Firebase Database غير متصل');
        return Promise.reject(new Error('Firebase Database غير متصل'));
    }

    const dbRef = firebaseDb.ref(path);

    return dbRef.set(data).then(() => {
        console.log(`✅ تم حفظ البيانات في ${path}`);
        return true;
    }).catch(error => {
        console.error(`❌ خطأ في حفظ البيانات في ${path}:`, error);
        return false;
    });
}

// ==================== جلب البيانات من Realtime Database ====================
function getDataFromFirebase(path) {
    if (!firebaseDb) {
        console.error('❌ Firebase Database غير متصل');
        return Promise.reject(new Error('Firebase Database غير متصل'));
    }

    const dbRef = firebaseDb.ref(path);

    return dbRef.once('value').then(snapshot => {
        const data = snapshot.val();
        console.log(`✅ تم جلب البيانات من ${path}`);
        return data;
    }).catch(error => {
        console.error(`❌ خطأ في جلب البيانات من ${path}:`, error);
        return null;
    });
}

// ==================== حذف البيانات من Realtime Database ====================
function deleteDataFromFirebase(path) {
    if (!firebaseDb) {
        console.error('❌ Firebase Database غير متصل');
        return Promise.reject(new Error('Firebase Database غير متصل'));
    }

    const dbRef = firebaseDb.ref(path);

    return dbRef.remove().then(() => {
        console.log(`✅ تم حذف البيانات من ${path}`);
        return true;
    }).catch(error => {
        console.error(`❌ خطأ في حذف البيانات من ${path}:`, error);
        return false;
    });
}

// ==================== تحديث البيانات في Realtime Database ====================
function updateDataInFirebase(path, updates) {
    if (!firebaseDb) {
        console.error('❌ Firebase Database غير متصل');
        return Promise.reject(new Error('Firebase Database غير متصل'));
    }

    const dbRef = firebaseDb.ref(path);

    return dbRef.update(updates).then(() => {
        console.log(`✅ تم تحديث البيانات في ${path}`);
        return true;
    }).catch(error => {
        console.error(`❌ خطأ في تحديث البيانات في ${path}:`, error);
        return false;
    });
}

// ==================== التحقق من اتصال Firebase ====================
function checkFirebaseConnection() {
    if (!firebaseDb) {
        console.error('❌ Firebase Database غير متصل');
        return false;
    }

    const connectedRef = firebaseDb.ref('.info/connected');
    connectedRef.on('value', snapshot => {
        if (snapshot.val() === true) {
            console.log('✅ متصل بـ Firebase');
        } else {
            console.log('❌ غير متصل بـ Firebase');
        }
    });

    return true;
}

// ==================== تهيئة عند التحميل ====================
document.addEventListener('DOMContentLoaded', () => {
    initializeFirebase();
    registerServiceWorker();
    checkFirebaseConnection();
});

// ==================== معالجة الأخطاء ====================
window.addEventListener('error', (event) => {
    console.error('❌ خطأ عام:', event.error);
});

window.addEventListener('unhandledrejection', (event) => {
    console.error('❌ Promise مرفوضة بدون معالج:', event.reason);
});

console.log('✅ تم تحميل firebase.js');
