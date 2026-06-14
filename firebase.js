/**
 * firebase.js — Firebase Realtime Database + Messaging
 * مجموعة أبو باشا
 */

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

let firebaseApp = null;
let firebaseDB = null;
let firebaseMessaging = null;
let firebaseReady = false;

try {
    if (typeof firebase !== 'undefined') {
        firebaseApp = firebase.apps && firebase.apps.length
            ? firebase.app()
            : firebase.initializeApp(firebaseConfig);

        firebaseDB = firebase.database();

        if (typeof firebase.messaging === 'function') {
            firebaseMessaging = firebase.messaging();
        }

        firebaseReady = true;
        console.log('✅ Firebase initialized');
    } else {
        console.warn('⚠️ Firebase SDK not loaded — using localStorage fallback');
    }
} catch (error) {
    console.error('❌ Firebase init failed:', error);
}

function cloneFallback(value) {
    return JSON.parse(JSON.stringify(value));
}

function isEmptyFirebaseValue(value) {
    return (
        value === null ||
        value === undefined ||
        (Array.isArray(value) && value.length === 0) ||
        (typeof value === 'object' && !Array.isArray(value) && Object.keys(value).length === 0)
    );
}

const CloudStorage = {
    isReady() {
        return Boolean(firebaseReady && firebaseDB);
    },

    async get(path, fallback) {
        if (!this.isReady()) {
            const fnName = `get${path.charAt(0).toUpperCase() + path.slice(1)}`;
            return Storage[fnName]?.() ?? cloneFallback(fallback);
        }

        try {
            const snapshot = await firebaseDB.ref(path).once('value');
            const value = snapshot.val();

            return isEmptyFirebaseValue(value)
                ? cloneFallback(fallback)
                : value;
        } catch (error) {
            console.error(`CloudStorage.get(${path}) failed:`, error);
            return cloneFallback(fallback);
        }
    },

    async set(path, value) {
        if (!this.isReady()) {
            const fnName = `set${path.charAt(0).toUpperCase() + path.slice(1)}`;
            return Storage[fnName]?.(value) ?? false;
        }

        try {
            await firebaseDB.ref(path).set(value);
            return true;
        } catch (error) {
            console.error(`CloudStorage.set(${path}) failed:`, error);
            return false;
        }
    },

    listen(path, callback, fallback) {
        if (!this.isReady()) {
            callback(cloneFallback(fallback));
            return null;
        }

        const ref = firebaseDB.ref(path);

        ref.on('value', snapshot => {
            const value = snapshot.val();

            callback(
                isEmptyFirebaseValue(value)
                    ? cloneFallback(fallback)
                    : value
            );
        }, error => {
            console.error(`CloudStorage.listen(${path}) failed:`, error);
            callback(cloneFallback(fallback));
        });

        return ref;
    },

    getProducts() {
        return this.get('products', initialProductsData);
    },

    setProducts(value) {
        return this.set('products', value);
    },

    getCategories() {
        return this.get('categories', initialCategoriesData);
    },

    setCategories(value) {
        return this.set('categories', value);
    },

    getMedia() {
        return this.get('media', initialMediaData);
    },

    setMedia(value) {
        return this.set('media', value);
    },

    getCustomers() {
        return this.get('customers', initialCustomersData);
    },

    setCustomers(value) {
        return this.set('customers', value);
    },

    listenProducts(callback) {
        return this.listen('products', callback, initialProductsData);
    },

    listenCategories(callback) {
        return this.listen('categories', callback, initialCategoriesData);
    },

    listenMedia(callback) {
        return this.listen('media', callback, initialMediaData);
    },

    listenCustomers(callback) {
        return this.listen('customers', callback, initialCustomersData);
    },

    async saveNotificationToken(token) {
        if (!this.isReady() || !token) return false;

        try {
            const safeKey = token.replace(/[.#$[\]/]/g, '_');

            await firebaseDB.ref(`notificationTokens/${safeKey}`).set({
                token,
                createdAt: Date.now(),
                userAgent: navigator.userAgent || ''
            });

            return true;
        } catch (error) {
            console.error('saveNotificationToken failed:', error);
            return false;
        }
    },

    async setPriceUpdateNotice() {
        return this.set('notices/priceUpdate', {
            title: 'تم تحديث أسعار مجموعة أبو باشا',
            message: 'انقر للاطلاع على أحدث الأسعار',
            target: `${location.origin}${location.pathname}#prices`,
            updatedAt: Date.now()
        });
    },

    listenPriceUpdateNotice(callback) {
        return this.listen('notices/priceUpdate', callback, null);
    },

    async resetAll() {
        if (!this.isReady()) return false;

        try {
            await Promise.all([
                firebaseDB.ref('products').set(initialProductsData),
                firebaseDB.ref('categories').set(initialCategoriesData),
                firebaseDB.ref('media').set(initialMediaData),
                firebaseDB.ref('customers').set(initialCustomersData)
            ]);

            return true;
        } catch (error) {
            console.error('CloudStorage.resetAll failed:', error);
            return false;
        }
    }
};
