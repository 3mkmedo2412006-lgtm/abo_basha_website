// ==================== التخزين المحلي ====================

function getStorageData(key) {
    try {
        const data = localStorage.getItem(`abobasha_${key}`);
        return data ? JSON.parse(data) : null;
    } catch (error) {
        console.error(`❌ خطأ في قراءة ${key}:`, error);
        return null;
    }
}

function saveStorageData(key, data) {
    try {
        localStorage.setItem(`abobasha_${key}`, JSON.stringify(data));
        console.log(`✅ تم حفظ ${key}`);
        return true;
    } catch (error) {
        console.error(`❌ خطأ في حفظ ${key}:`, error);
        return false;
    }
}

// ==================== المنتجات ====================
function getProducts() {
    const stored = getStorageData('products');
    return stored && stored.length > 0 ? stored : initialProductsData;
}

function saveProducts(products) {
    return saveStorageData('products', products);
}

function addProduct(product) {
    const products = getProducts();
    products.push(product);
    return saveProducts(products);
}

function updateProduct(productId, updates) {
    const products = getProducts();
    const index = products.findIndex(p => p.id === productId);
    if (index !== -1) {
        products[index] = { ...products[index], ...updates };
        return saveProducts(products);
    }
    return false;
}

function deleteProduct(productId) {
    const products = getProducts();
    const filtered = products.filter(p => p.id !== productId);
    return saveProducts(filtered);
}

// ==================== الفئات ====================
function getCategories() {
    const stored = getStorageData('categories');
    return stored && stored.length > 0 ? stored : initialCategoriesData;
}

function saveCategories(categories) {
    return saveStorageData('categories', categories);
}

function addCategory(category) {
    const categories = getCategories();
    categories.push(category);
    return saveCategories(categories);
}

function deleteCategory(categoryId) {
    const categories = getCategories();
    const filtered = categories.filter(c => c.id !== categoryId);
    return saveCategories(filtered);
}

// ==================== الفيديوهات ====================
function getVideos() {
    const stored = getStorageData('videos');
    return stored && stored.length > 0 ? stored : initialVideosData;
}

function saveVideos(videos) {
    return saveStorageData('videos', videos);
}

function addVideo(video) {
    const videos = getVideos();
    videos.push(video);
    return saveVideos(videos);
}

function deleteVideo(videoId) {
    const videos = getVideos();
    const filtered = videos.filter(v => v.id !== videoId);
    return saveVideos(filtered);
}

// ==================== العملاء ====================
function getCustomers() {
    const stored = getStorageData('customers');
    return stored ? stored : initialCustomersData;
}

function saveCustomers(customers) {
    return saveStorageData('customers', customers);
}

function addCustomer(customerId, customerData) {
    const customers = getCustomers();
    customers[customerId] = customerData;
    return saveCustomers(customers);
}

function deleteCustomer(customerId) {
    const customers = getCustomers();
    delete customers[customerId];
    return saveCustomers(customers);
}

// ==================== سلة التسوق ====================
function getCart() {
    const stored = getStorageData('cart');
    return stored && Array.isArray(stored) ? stored : [];
}

function saveCart(cart) {
    return saveStorageData('cart', cart);
}

function clearCart() {
    return saveCart([]);
}

// ==================== الإشعارات ====================
function getNotificationSubscribers() {
    const stored = getStorageData('notificationSubscribers');
    return stored ? stored : [];
}

function saveNotificationSubscribers(subscribers) {
    return saveStorageData('notificationSubscribers', subscribers);
}

function addNotificationSubscriber(deviceId) {
    const subscribers = getNotificationSubscribers();
    if (!subscribers.includes(deviceId)) {
        subscribers.push(deviceId);
        saveNotificationSubscribers(subscribers);
    }
}

// ==================== النسخ الاحتياطية ====================
function exportAllData() {
    return {
        products: getProducts(),
        categories: getCategories(),
        videos: getVideos(),
        customers: getCustomers(),
        cart: getCart(),
        exportDate: new Date().toISOString()
    };
}

function importAllData(data) {
    try {
        if (data.products) saveProducts(data.products);
        if (data.categories) saveCategories(data.categories);
        if (data.videos) saveVideos(data.videos);
        if (data.customers) saveCustomers(data.customers);
        if (data.cart) saveCart(data.cart);
        return true;
    } catch (error) {
        console.error('❌ خطأ في استيراد البيانات:', error);
        return false;
    }
}

function resetToDefaults() {
    saveProducts(initialProductsData);
    saveCategories(initialCategoriesData);
    saveVideos(initialVideosData);
    saveCustomers(initialCustomersData);
    clearCart();
    return true;
}

console.log('✅ تم تحميل storage.js');
