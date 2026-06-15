// ==================== متغيرات عامة ====================
let isLoggedIn = false;
let adminProducts = [];
let adminCategories = [];
let adminVideos = [];
let adminCustomers = {};

// ==================== تهيئة لوحة التحكم ====================
document.addEventListener('DOMContentLoaded', () => {
    console.log('🎛️ تم تحميل لوحة التحكم');
    
    checkLoginStatus();
    setupAdminEventListeners();
});

// ==================== التحقق من تسجيل الدخول ====================
function checkLoginStatus() {
    const loginToken = localStorage.getItem('abobasha_admin_token');
    
    if (loginToken === 'admin_logged_in') {
        isLoggedIn = true;
        showAdminPanel();
        loadAdminData();
    } else {
        isLoggedIn = false;
        showLoginModal();
    }
}

function showLoginModal() {
    const modal = document.querySelector('#login-modal');
    if (modal) {
        modal.classList.add('show');
    }
}

function showAdminPanel() {
    const modal = document.querySelector('#login-modal');
    if (modal) {
        modal.classList.remove('show');
    }
}

function handleLogin(e) {
    e.preventDefault();
    
    const username = document.querySelector('#login-username').value.trim();
    const password = document.querySelector('#login-password').value.trim();
    
    // التحقق من بيانات الدخول
    if (username === 'admin' && password === '01070780092') {
        localStorage.setItem('abobasha_admin_token', 'admin_logged_in');
        isLoggedIn = true;
        
        showAdminPanel();
        loadAdminData();
        showAdminNotification('✅ تم تسجيل الدخول بنجاح');
        
        document.querySelector('#login-form').reset();
    } else {
        showAdminNotification('❌ بيانات غير صحيحة');
    }
}

function handleLogout() {
    if (confirm('هل تريد تسجيل الخروج؟')) {
        localStorage.removeItem('abobasha_admin_token');
        location.reload();
    }
}

// ==================== إعداد المستمعات ====================
function setupAdminEventListeners() {
    // تسجيل الدخول
    const loginForm = document.querySelector('#login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
    
    // تسجيل الخروج
    const logoutBtn = document.querySelector('#logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }
    
    // التنقل بين التبويبات
    document.querySelectorAll('.sidebar-item').forEach(item => {
        item.addEventListener('click', (e) => {
            const tabName = e.currentTarget.getAttribute('data-tab');
            switchTab(tabName);
        });
    });
    
    // المنتجات
    const addProductBtn = document.querySelector('#add-product-btn');
    if (addProductBtn) {
        addProductBtn.addEventListener('click', showProductForm);
    }
    
    const productForm = document.querySelector('#product-form');
    if (productForm) {
        productForm.addEventListener('submit', handleProductSubmit);
    }
    
    // الفئات
    const addCategoryBtn = document.querySelector('#add-category-btn');
    if (addCategoryBtn) {
        addCategoryBtn.addEventListener('click', showCategoryForm);
    }
    
    const categoryForm = document.querySelector('#category-form');
    if (categoryForm) {
        categoryForm.addEventListener('submit', handleCategorySubmit);
    }
    
    // الفيديوهات
    const addVideoBtn = document.querySelector('#add-video-btn');
    if (addVideoBtn) {
        addVideoBtn.addEventListener('click', showVideoForm);
    }
    
    const videoForm = document.querySelector('#video-form');
    if (videoForm) {
        videoForm.addEventListener('submit', handleVideoSubmit);
    }
    
    // الإشعارات
    const notificationForm = document.querySelector('#notification-form');
    if (notificationForm) {
        notificationForm.addEventListener('submit', handleNotificationSubmit);
    }
    
    // الإعدادات
    const movePricesBtn = document.querySelector('#move-prices-btn');
    if (movePricesBtn) {
        movePricesBtn.addEventListener('click', movePricesToYesterday);
    }
    
    const exportDataBtn = document.querySelector('#export-data-btn');
    if (exportDataBtn) {
        exportDataBtn.addEventListener('click', exportData);
    }
    
    const importDataBtn = document.querySelector('#import-data-btn');
    if (importDataBtn) {
        importDataBtn.addEventListener('click', () => {
            document.querySelector('#import-file-input').click();
        });
    }
    
    const importInput = document.querySelector('#import-file-input');
    if (importInput) {
        importInput.addEventListener('change', handleFileImport);
    }
    
    const resetDataBtn = document.querySelector('#reset-data-btn');
    if (resetDataBtn) {
        resetDataBtn.addEventListener('click', resetToDefaultsData);
    }
    
    const clearStorageBtn = document.querySelector('#clear-storage-btn');
    if (clearStorageBtn) {
        clearStorageBtn.addEventListener('click', clearAllStorage);
    }

    // أزرار الأعلى
    const syncBtn = document.querySelector('#sync-btn');
    if (syncBtn) {
        syncBtn.addEventListener('click', syncDataToFirebase);
    }

    const exportBtn = document.querySelector('#export-btn');
    if (exportBtn) {
        exportBtn.addEventListener('click', exportData);
    }

    const importBtn = document.querySelector('#import-btn');
    if (importBtn) {
        importBtn.addEventListener('click', () => {
            document.querySelector('#import-file-input').click();
        });
    }
}

// ==================== التنقل بين التبويبات ====================
function switchTab(tabName) {
    document.querySelectorAll('.admin-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    
    document.querySelectorAll('.sidebar-item').forEach(item => {
        item.classList.remove('active');
    });
    
    const selectedTab = document.querySelector(`#${tabName}-tab`);
    if (selectedTab) {
        selectedTab.classList.add('active');
    }
    
    const activeItem = document.querySelector(`[data-tab="${tabName}"]`);
    if (activeItem) {
        activeItem.classList.add('active');
    }
    
    if (tabName === 'dashboard') {
        updateDashboard();
    } else if (tabName === 'products') {
        displayProductsTable();
    } else if (tabName === 'categories') {
        displayCategoriesTable();
    } else if (tabName === 'videos') {
        displayVideosTable();
    } else if (tabName === 'customers') {
        displayCustomersTable();
    } else if (tabName === 'notifications') {
        updateNotificationStats();
    }
}

// ==================== لوحة المعلومات ====================
function updateDashboard() {
    document.querySelector('#stat-products').textContent = toArabicDigits(adminProducts.length);
    document.querySelector('#stat-categories').textContent = toArabicDigits(adminCategories.length);
    document.querySelector('#stat-customers').textContent = toArabicDigits(Object.keys(adminCustomers).length);
    document.querySelector('#stat-videos').textContent = toArabicDigits(adminVideos.length);
}

// ==================== المنتجات ====================
function showProductForm() {
    const container = document.querySelector('#product-form-container');
    if (container) {
        container.style.display = 'block';
        document.querySelector('#product-form').reset();
        
        const categorySelect = document.querySelector('#product-category');
        categorySelect.innerHTML = adminCategories.map(cat => 
            `<option value="${cat.id}">${cat.name}</option>`
        ).join('');
    }
}

function cancelProductForm() {
    const container = document.querySelector('#product-form-container');
    if (container) {
        container.style.display = 'none';
    }
}

function handleProductSubmit(e) {
    e.preventDefault();
    
    const name = document.querySelector('#product-name').value.trim();
    const categoryId = document.querySelector('#product-category').value;
    const price = parseFloat(document.querySelector('#product-price').value);
    const imageFile = document.querySelector('#product-image').files[0];
    
    if (!name || !categoryId || !price) {
        showAdminNotification('⚠️ أدخل جميع البيانات');
        return;
    }
    
    let imageUrl = '';
    
    if (imageFile) {
        // تحويل الصورة إلى Base64
        const reader = new FileReader();
        reader.onload = (event) => {
            imageUrl = event.target.result;
            createProduct(name, categoryId, price, imageUrl);
        };
        reader.readAsDataURL(imageFile);
    } else {
        createProduct(name, categoryId, price, imageUrl);
    }
}

function createProduct(name, categoryId, price, imageUrl) {
    const product = {
        id: `product_${Date.now()}`,
        name: name,
        categoryId: categoryId,
        price: price,
        previousPrice: price,
        image: imageUrl
    };
    
    adminProducts.push(product);
    saveProducts(adminProducts);
    
    cancelProductForm();
    displayProductsTable();
    showAdminNotification('✅ تم إضافة المنتج');
    
    // إرسال إشعار للعملاء
    sendNotificationToAll('تم إضافة منتج جديد', `تم إضافة ${name} إلى قائمة المنتجات`);
}

function displayProductsTable() {
    const tbody = document.querySelector('#products-tbody');
    if (!tbody) return;
    
    tbody.innerHTML = adminProducts.map(product => `
        <tr>
            <td>${product.name}</td>
            <td>${getCategoryName(product.categoryId)}</td>
            <td>${toArabicDigits(product.price.toFixed(2))} ج.م</td>
            <td>${product.image ? '✅' : '❌'}</td>
            <td>
                <button class="btn-sm btn-primary" onclick="editProduct('${product.id}')">تعديل</button>
                <button class="btn-sm btn-danger" onclick="deleteProduct('${product.id}')">حذف</button>
            </td>
        </tr>
    `).join('');
}

function editProduct(productId) {
    const product = adminProducts.find(p => p.id === productId);
    if (!product) return;
    
    document.querySelector('#product-name').value = product.name;
    document.querySelector('#product-category').value = product.categoryId;
    document.querySelector('#product-price').value = product.price;
    
    const container = document.querySelector('#product-form-container');
    if (container) {
        container.style.display = 'block';
    }
    
    // تحديث الزر
    const form = document.querySelector('#product-form');
    const oldOnSubmit = form.onsubmit;
    
    form.onsubmit = (e) => {
        e.preventDefault();
        
        const name = document.querySelector('#product-name').value.trim();
        const categoryId = document.querySelector('#product-category').value;
        const price = parseFloat(document.querySelector('#product-price').value);
        const imageFile = document.querySelector('#product-image').files[0];
        
        if (!name || !categoryId || !price) {
            showAdminNotification('⚠️ أدخل جميع البيانات');
            return;
        }
        
        if (imageFile) {
            const reader = new FileReader();
            reader.onload = (event) => {
                const imageUrl = event.target.result;
                updateProductData(productId, { name, categoryId, price, image: imageUrl });
            };
            reader.readAsDataURL(imageFile);
        } else {
            updateProductData(productId, { name, categoryId, price });
        }
    };
}

function updateProductData(productId, updates) {
    const index = adminProducts.findIndex(p => p.id === productId);
    if (index !== -1) {
        adminProducts[index] = { ...adminProducts[index], ...updates };
        saveProducts(adminProducts);
        
        cancelProductForm();
        displayProductsTable();
        showAdminNotification('✅ تم تحديث المنتج');
        
        // إرسال إشعار للعملاء
        sendNotificationToAll('تم تحديث الأسعار', 'تم تحديث أسعار مجموعة أبو باشا. انقر للاطلاع على آخر الأسعار');
        
        // استعادة الدالة الأصلية
        const form = document.querySelector('#product-form');
        form.onsubmit = handleProductSubmit;
    }
}

function deleteProduct(productId) {
    if (confirm('هل تريد حذف هذا المنتج؟')) {
        adminProducts = adminProducts.filter(p => p.id !== productId);
        saveProducts(adminProducts);
        displayProductsTable();
        showAdminNotification('✅ تم حذف المنتج');
    }
}

// ==================== الفئات ====================
function showCategoryForm() {
    const container = document.querySelector('#category-form-container');
    if (container) {
        container.style.display = 'block';
        document.querySelector('#category-form').reset();
    }
}

function cancelCategoryForm() {
    const container = document.querySelector('#category-form-container');
    if (container) {
        container.style.display = 'none';
    }
}

function handleCategorySubmit(e) {
    e.preventDefault();
    
    const name = document.querySelector('#category-name').value.trim();
    const icon = document.querySelector('#category-icon').value.trim();
    
    if (!name || !icon) {
        showAdminNotification('⚠️ أدخل جميع البيانات');
        return;
    }
    
    const category = {
        id: `category_${Date.now()}`,
        name: name,
        icon: icon
    };
    
    adminCategories.push(category);
    saveCategories(adminCategories);
    
    cancelCategoryForm();
    displayCategoriesTable();
    showAdminNotification('✅ تم إضافة الفئة');
}

function displayCategoriesTable() {
    const tbody = document.querySelector('#categories-tbody');
    if (!tbody) return;
    
    tbody.innerHTML = adminCategories.map(category => `
        <tr>
            <td>${category.name}</td>
            <td>${category.icon}</td>
            <td>
                <button class="btn-sm btn-danger" onclick="deleteCategory('${category.id}')">حذف</button>
            </td>
        </tr>
    `).join('');
}

function deleteCategory(categoryId) {
    if (confirm('هل تريد حذف هذه الفئة؟')) {
        adminCategories = adminCategories.filter(c => c.id !== categoryId);
        saveCategories(adminCategories);
        displayCategoriesTable();
        showAdminNotification('✅ تم حذف الفئة');
    }
}

// ==================== الفيديوهات ====================
function showVideoForm() {
    const container = document.querySelector('#video-form-container');
    if (container) {
        container.style.display = 'block';
        document.querySelector('#video-form').reset();
    }
}

function cancelVideoForm() {
    const container = document.querySelector('#video-form-container');
    if (container) {
        container.style.display = 'none';
    }
}

function handleVideoSubmit(e) {
    e.preventDefault();
    
    const title = document.querySelector('#video-title').value.trim();
    const description = document.querySelector('#video-description').value.trim();
    const videoFile = document.querySelector('#video-file').files[0];
    
    if (!title || !description || !videoFile) {
        showAdminNotification('⚠️ أدخل جميع البيانات');
        return;
    }
    
    // التحقق من نوع الملف
    if (!videoFile.type.startsWith('video/')) {
        showAdminNotification('❌ الملف يجب أن يكون فيديو');
        return;
    }
    
    // التحقق من حجم الملف (أقصى 100 MB)
    if (videoFile.size > 100 * 1024 * 1024) {
        showAdminNotification('❌ حجم الفيديو كبير جداً (أقصى 100 MB)');
        return;
    }
    
    showAdminNotification('📤 جاري رفع الفيديو...');
    
    // تحويل الفيديو إلى Base64
    const reader = new FileReader();
    reader.onload = (event) => {
        const videoUrl = event.target.result;
        
        const video = {
            id: `video_${Date.now()}`,
            title: title,
            description: description,
            videoUrl: videoUrl
        };
        
        adminVideos.push(video);
        saveVideos(adminVideos);
        
        cancelVideoForm();
        displayVideosTable();
        showAdminNotification('✅ تم إضافة الفيديو');
    };
    
    reader.onerror = () => {
        showAdminNotification('❌ خطأ في قراءة الفيديو');
    };
    
    reader.readAsDataURL(videoFile);
}

function displayVideosTable() {
    const tbody = document.querySelector('#videos-tbody');
    if (!tbody) return;
    
    tbody.innerHTML = adminVideos.map(video => `
        <tr>
            <td>${video.title}</td>
            <td>${video.description.substring(0, 50)}...</td>
            <td><button class="btn-sm btn-primary" onclick="previewVideo('${video.id}')">عرض</button></td>
            <td>
                <button class="btn-sm btn-danger" onclick="deleteVideo('${video.id}')">حذف</button>
            </td>
        </tr>
    `).join('');
}

function previewVideo(videoId) {
    const video = adminVideos.find(v => v.id === videoId);
    if (!video) return;
    
    const modal = document.createElement('div');
    modal.className = 'modal show';
    modal.innerHTML = `
        <div class="modal-content" style="max-width: 600px;">
            <div class="modal-header">
                <h2>${video.title}</h2>
                <button class="modal-close" onclick="this.closest('.modal').remove()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="modal-body">
                <video width="100%" controls style="border-radius: 8px;">
                    <source src="${video.videoUrl}" type="video/mp4">
                    متصفحك لا يدعم الفيديو
                </video>
                <p style="margin-top: 15px; color: #64748b;">${video.description}</p>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.remove();
        }
    });
}

function deleteVideo(videoId) {
    if (confirm('هل تريد حذف هذا الفيديو؟')) {
        adminVideos = adminVideos.filter(v => v.id !== videoId);
        saveVideos(adminVideos);
        displayVideosTable();
        showAdminNotification('✅ تم حذف الفيديو');
    }
}

// ==================== العملاء ====================
function displayCustomersTable() {
    const tbody = document.querySelector('#customers-tbody');
    if (!tbody) return;
    
    const customers = Object.entries(adminCustomers).map(([id, customer]) => ({
        id,
        ...customer
    }));
    
    if (customers.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; padding: 20px; color: #64748b;">لا توجد عملاء</td></tr>';
        return;
    }
    
    tbody.innerHTML = customers.map(customer => `
        <tr>
            <td>${customer.name}</td>
            <td>${customer.phone}</td>
            <td>${customer.address || '-'}</td>
            <td>${formatDateArabic(customer.subscribedAt)}</td>
            <td>
                <button class="btn-sm btn-danger" onclick="deleteCustomerData('${customer.id}')">حذف</button>
            </td>
        </tr>
    `).join('');
}

function deleteCustomerData(customerId) {
    if (confirm('هل تريد حذف هذا العميل؟')) {
        delete adminCustomers[customerId];
        saveCustomers(adminCustomers);
        displayCustomersTable();
        showAdminNotification('✅ تم حذف العميل');
    }
}

// ==================== الإشعارات ====================
function handleNotificationSubmit(e) {
    e.preventDefault();
    
    const title = document.querySelector('#notification-title').value.trim();
    const message = document.querySelector('#notification-message').value.trim();
    
    if (!title || !message) {
        showAdminNotification('⚠️ أدخل العنوان والرسالة');
        return;
    }
    
    // إرسال الإشعار
    sendNotificationToAll(title, message);
    
    // حفظ آخر إشعار
    localStorage.setItem('abobasha_last_notification', JSON.stringify({
        title: title,
        message: message,
        timestamp: new Date().toISOString()
    }));
    
    document.querySelector('#notification-form').reset();
    updateNotificationStats();
    showAdminNotification('✅ تم إرسال الإشعار');
}

function updateNotificationStats() {
    const subscribersCount = Object.keys(adminCustomers).length;
    document.querySelector('#notification-subscribers').textContent = toArabicDigits(subscribersCount);
    
    const lastNotification = localStorage.getItem('abobasha_last_notification');
    if (lastNotification) {
        const data = JSON.parse(lastNotification);
        document.querySelector('#last-notification-time').textContent = formatDateArabic(data.timestamp);
    } else {
        document.querySelector('#last-notification-time').textContent = 'لم يتم إرسال';
    }
}

// ==================== الإعدادات ====================
function movePricesToYesterday() {
    if (confirm('هل تريد نقل الأسعار الحالية إلى أسعار الأمس؟')) {
        adminProducts.forEach(product => {
            product.previousPrice = product.price;
        });
        saveProducts(adminProducts);
        showAdminNotification('✅ تم نقل الأسعار');
    }
}

function exportData() {
    const data = exportAllData();
    const dataStr = JSON.stringify(data, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `abobasha_backup_${Date.now()}.json`;
    link.click();
    
    URL.revokeObjectURL(url);
    showAdminNotification('✅ تم تصدير البيانات');
}

function handleFileImport(e) {
    const file = e.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (event) => {
        try {
            const data = JSON.parse(event.target.result);
            
            if (confirm('هل تريد استيراد هذه البيانات؟ سيتم استبدال جميع البيانات الحالية.')) {
                importAllData(data);
                loadAdminData();
                showAdminNotification('✅ تم استيراد البيانات');
            }
        } catch (error) {
            showAdminNotification('❌ خطأ في الملف - تأكد من أنه ملف JSON صحيح');
            console.error(error);
        }
    };
    reader.readAsText(file);
}

function resetToDefaultsData() {
    if (confirm('هل تريد استعادة الإعدادات الافتراضية؟ سيتم حذف جميع البيانات المخصصة.')) {
        resetToDefaults();
        loadAdminData();
        showAdminNotification('✅ تم استعادة الإعدادات الافتراضية');
    }
}

function clearAllStorage() {
    if (confirm('هل تريد حذف جميع البيانات؟ هذا الإجراء لا يمكن التراجع عنه!')) {
        adminProducts = [];
        adminCategories = [];
        adminVideos = [];
        adminCustomers = {};
        
        saveProducts(adminProducts);
        saveCategories(adminCategories);
        saveVideos(adminVideos);
        saveCustomers(adminCustomers);
        
        updateDashboard();
        showAdminNotification('✅ تم حذف جميع البيانات');
    }
}

// ==================== مزامنة Firebase ====================
function syncDataToFirebase() {
    showAdminNotification('📤 جاري المزامنة...');
    
    try {
        if (firebaseInitialized && firebaseDb) {
            const data = exportAllData();
            const dbRef = firebaseDb.ref('appData');
            
            dbRef.set(data).then(() => {
                showAdminNotification('✅ تم مزامنة البيانات مع Firebase');
            }).catch(error => {
                showAdminNotification('❌ خطأ في المزامنة: ' + error.message);
                console.error(error);
            });
        } else {
            showAdminNotification('⚠️ Firebase غير متصل');
        }
    } catch (error) {
        showAdminNotification('❌ خطأ في المزامنة');
        console.error(error);
    }
}

// ==================== حفظ وتحميل البيانات ====================
function loadAdminData() {
    adminProducts = getProducts();
    adminCategories = getCategories();
    adminVideos = getVideos();
    adminCustomers = getCustomers();
    
    updateDashboard();
    updateNotificationStats();
}

// ==================== الإشعارات ====================
function showAdminNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'toast-notification show';
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// ==================== دوال مساعدة ====================
function toArabicDigits(num) {
    const arabicNumbers = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
    return String(num).replace(/\d/g, d => arabicNumbers[d]);
}

function getCategoryName(categoryId) {
    const category = adminCategories.find(c => c.id === categoryId);
    return category ? category.name : 'غير محدد';
}

function formatDateArabic(date) {
    const options = { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    };
    return new Date(date).toLocaleDateString('ar-EG', options);
}

// ==================== إرسال الإشعارات ====================
function sendNotificationToAll(title, message) {
    try {
        // إرسال إشعار محلي
        if ('Notification' in window && Notification.permission === 'granted') {
            new Notification(title, {
                body: message,
                icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y="75" font-size="75">🐔</text></svg>',
                badge: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y="75" font-size="75">🐔</text></svg>'
            });
        }
        
        // حفظ الإشعار في localStorage
        const notifications = JSON.parse(localStorage.getItem('abobasha_notifications') || '[]');
        notifications.push({
            title: title,
            message: message,
            timestamp: new Date().toISOString()
        });
        localStorage.setItem('abobasha_notifications', JSON.stringify(notifications));
        
        console.log('✅ تم إرسال الإشعار');
    } catch (error) {
        console.error('❌ خطأ في إرسال الإشعار:', error);
    }
}

console.log('✅ تم تحميل admin.js');
