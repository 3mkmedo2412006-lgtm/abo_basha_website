// ==================== متغيرات عامة ====================
let allProducts = [];
let allCategories = [];
let allVideos = [];
let allCustomers = {};
let shoppingCart = [];

// ==================== تهيئة الموقع ====================
document.addEventListener('DOMContentLoaded', () => {
    console.log('📱 تم تحميل الموقع');
    
    // تحميل البيانات
    loadWebsiteData();
    
    // إعداد المستمعات
    setupEventListeners();
    
    // تحديث الواجهة
    updateUI();
    
    // طلب إذن الإشعارات
    requestNotificationPermission();
});

// ==================== تحميل البيانات ====================
function loadWebsiteData() {
    allProducts = getProducts();
    allCategories = getCategories();
    allVideos = getVideos();
    allCustomers = getCustomers();
    shoppingCart = getCart();
    
    console.log('📦 المنتجات:', allProducts.length);
    console.log('📂 الفئات:', allCategories.length);
    console.log('🎥 الفيديوهات:', allVideos.length);
}

// ==================== إعداد المستمعات ====================
function setupEventListeners() {
    // القائمة الجانبية
    const menuToggle = document.querySelector('.menu-toggle');
    const navMenu = document.querySelector('.nav-menu');
    
    if (menuToggle && navMenu) {
        menuToggle.addEventListener('click', () => {
            navMenu.classList.toggle('open');
        });
        
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', () => {
                navMenu.classList.remove('open');
            });
        });
    }
    
    // البحث
    const searchInput = document.querySelector('.search-input');
    if (searchInput) {
        searchInput.addEventListener('input', handleSearch);
    }
    
    // نموذج الاشتراك
    const subscriptionForm = document.querySelector('#subscription-form');
    if (subscriptionForm) {
        subscriptionForm.addEventListener('submit', handleSubscription);
    }
    
    // إغلاق النافذة
    const modal = document.querySelector('.modal');
    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.remove('show');
            }
        });
    }
}

// ==================== طلب إذن الإشعارات ====================
function requestNotificationPermission() {
    if ('Notification' in window && Notification.permission === 'default') {
        const message = 'هل تريد تفعيل الإشعارات للحصول على آخر الأسعار؟';
        if (confirm(message)) {
            Notification.requestPermission().then(permission => {
                if (permission === 'granted') {
                    showNotification('✅ تم تفعيل الإشعارات بنجاح');
                }
            });
        }
    }
}

// ==================== البحث ====================
function handleSearch(e) {
    const query = e.target.value.trim().toLowerCase();
    const searchResults = document.querySelector('.search-results');
    
    if (query.length < 2) {
        searchResults.classList.remove('show');
        return;
    }
    
    const results = allProducts.filter(product => 
        product.name.toLowerCase().includes(query)
    );
    
    if (results.length === 0) {
        searchResults.innerHTML = '<div class="search-result-item">لا توجد نتائج</div>';
    } else {
        searchResults.innerHTML = results.map(product => `
            <div class="search-result-item" onclick="openProductModal('${product.id}')">
                <strong>${product.name}</strong>
                <div style="font-size: 12px; color: #64748b;">
                    ${getCategoryName(product.categoryId)} - ${toArabicDigits(product.price.toFixed(2))} ج.م
                </div>
            </div>
        `).join('');
    }
    
    searchResults.classList.add('show');
}

// ==================== الفئات ====================
function displayCategories() {
    const container = document.querySelector('.categories-grid');
    if (!container) return;
    
    container.innerHTML = allCategories.map(category => `
        <div class="category-card" onclick="selectCategory('${category.id}')">
            <div class="category-icon">${category.icon}</div>
            <h3>${category.name}</h3>
            <p>${allProducts.filter(p => p.categoryId === category.id).length} منتج</p>
        </div>
    `).join('');
}

function selectCategory(categoryId) {
    const filtered = allProducts.filter(p => p.categoryId === categoryId);
    displayProductsFiltered(filtered);
    
    const categoryName = getCategoryName(categoryId);
    showNotification(`✅ تم اختيار: ${categoryName}`);
    
    document.querySelector('#prices').scrollIntoView({ behavior: 'smooth' });
}

// ==================== المنتجات ====================
function displayProducts() {
    const container = document.querySelector('.products-grid');
    if (!container) return;
    
    container.innerHTML = allProducts.map(product => {
        return `
            <div class="product-card">
                <div class="product-image">
                    ${product.image ? `<img src="${product.image}" alt="${product.name}">` : '📦'}
                </div>
                <div class="product-info">
                    <h3 class="product-name">${product.name}</h3>
                    <div class="product-price">
                        <span class="current-price">${toArabicDigits(product.price.toFixed(2))}</span>
                        <span class="previous-price">${toArabicDigits(product.previousPrice.toFixed(2))}</span>
                    </div>
                    <div class="product-actions">
                        <button class="btn-add" onclick="addToCart('${product.id}')">
                            <i class="fas fa-shopping-cart"></i> أضف
                        </button>
                        <button class="btn-details" onclick="openProductModal('${product.id}')">
                            <i class="fas fa-info-circle"></i> تفاصيل
                        </button>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

function displayProductsFiltered(products) {
    const container = document.querySelector('.products-grid');
    if (!container) return;
    
    container.innerHTML = products.map(product => {
        return `
            <div class="product-card">
                <div class="product-image">
                    ${product.image ? `<img src="${product.image}" alt="${product.name}">` : '📦'}
                </div>
                <div class="product-info">
                    <h3 class="product-name">${product.name}</h3>
                    <div class="product-price">
                        <span class="current-price">${toArabicDigits(product.price.toFixed(2))}</span>
                        <span class="previous-price">${toArabicDigits(product.previousPrice.toFixed(2))}</span>
                    </div>
                    <div class="product-actions">
                        <button class="btn-add" onclick="addToCart('${product.id}')">
                            <i class="fas fa-shopping-cart"></i> أضف
                        </button>
                        <button class="btn-details" onclick="openProductModal('${product.id}')">
                            <i class="fas fa-info-circle"></i> تفاصيل
                        </button>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

function openProductModal(productId) {
    const product = allProducts.find(p => p.id === productId);
    if (!product) return;
    
    const modal = document.querySelector('.modal');
    const modalContent = modal.querySelector('.modal-content');
    
    modalContent.innerHTML = `
        <div class="modal-header">
            <h2>${product.name}</h2>
            <button class="modal-close" onclick="closeProductModal()">
                <i class="fas fa-times"></i>
            </button>
        </div>
        <div class="modal-body">
            <div class="product-detail-image">
                ${product.image ? `<img src="${product.image}" alt="${product.name}">` : '📦'}
            </div>
            <div class="product-detail-info">
                <h3 class="product-detail-name">${product.name}</h3>
                <div class="product-detail-price">
                    <span class="detail-current-price">${toArabicDigits(product.price.toFixed(2))} ج.م</span>
                </div>
                <p style="color: #64748b; margin-bottom: 20px;">
                    الفئة: <strong>${getCategoryName(product.categoryId)}</strong>
                </p>
                <div class="quantity-selector">
                    <label class="quantity-label">الكمية:</label>
                    <input type="number" id="product-quantity" class="quantity-input" value="1" min="1" max="1000">
                </div>
            </div>
            <div class="modal-actions">
                <button class="btn-add" onclick="addToCartFromModal('${product.id}')">
                    <i class="fas fa-shopping-cart"></i> أضف إلى الطلبية
                </button>
                <button class="btn-details" onclick="closeProductModal()">
                    <i class="fas fa-times"></i> إغلاق
                </button>
            </div>
        </div>
    `;
    
    modal.classList.add('show');
}

function closeProductModal() {
    const modal = document.querySelector('.modal');
    modal.classList.remove('show');
}

function addToCart(productId, quantity = 1) {
    const product = allProducts.find(p => p.id === productId);
    if (!product) return;
    
    const existingItem = shoppingCart.find(item => item.id === productId);
    
    if (existingItem) {
        existingItem.quantity += quantity;
    } else {
        shoppingCart.push({
            id: productId,
            name: product.name,
            price: product.price,
            quantity: quantity,
            categoryId: product.categoryId
        });
    }
    
    saveCart(shoppingCart);
    updateOrdersList();
    showNotification(`✅ تم إضافة ${product.name}`);
}

function addToCartFromModal(productId) {
    const quantityInput = document.querySelector('#product-quantity');
    const quantity = parseInt(quantityInput.value) || 1;
    
    addToCart(productId, quantity);
    closeProductModal();
}

// ==================== الطلبيات ====================
function updateOrdersList() {
    const container = document.querySelector('.orders-list');
    if (!container) return;
    
    if (shoppingCart.length === 0) {
        container.innerHTML = '<div style="text-align: center; padding: 20px; color: #64748b;">لا توجد طلبيات</div>';
        return;
    }
    
    const totalPrice = shoppingCart.reduce((total, item) => total + (item.price * item.quantity), 0);
    
    let html = shoppingCart.map((item, index) => `
        <div class="order-item">
            <div class="order-item-info">
                <div class="order-item-name">${item.name}</div>
                <div class="order-item-quantity">الكمية: ${toArabicDigits(item.quantity)}</div>
            </div>
            <div class="order-item-price">${toArabicDigits((item.price * item.quantity).toFixed(2))} ج.م</div>
            <button class="order-item-remove" onclick="removeFromCart(${index})">
                <i class="fas fa-trash"></i>
            </button>
        </div>
    `).join('');
    
    html += `
        <div class="order-total">
            <span class="order-total-label">الإجمالي:</span>
            <span class="order-total-amount">${toArabicDigits(totalPrice.toFixed(2))} ج.م</span>
        </div>
        <div class="order-actions">
            <button class="btn-send-order" onclick="sendOrderViaWhatsApp()">
                <i class="fab fa-whatsapp"></i> إرسال عبر واتساب
            </button>
            <button class="btn-clear-order" onclick="clearCart()">
                <i class="fas fa-trash"></i> مسح الطلبية
            </button>
        </div>
    `;
    
    container.innerHTML = html;
}

function removeFromCart(index) {
    shoppingCart.splice(index, 1);
    saveCart(shoppingCart);
    updateOrdersList();
    showNotification('✅ تم حذف المنتج');
}

function clearCart() {
    if (confirm('هل تريد مسح جميع الطلبيات؟')) {
        shoppingCart = [];
        saveCart(shoppingCart);
        updateOrdersList();
        showNotification('✅ تم مسح الطلبية');
    }
}

function sendOrderViaWhatsApp() {
    if (shoppingCart.length === 0) {
        showNotification('⚠️ الطلبية فارغة');
        return;
    }
    
    const customerName = document.querySelector('#customer-name')?.value || 'عميل';
    const customerPhone = document.querySelector('#customer-phone')?.value || '';
    const customerAddress = document.querySelector('#customer-address')?.value || '';
    
    let message = `📦 طلب جديد من موقع مجموعة أبو باشا\n`;
    message += `${'='.repeat(25)}\n`;
    message += `👤 الاسم: ${customerName}\n`;
    message += `📞 الهاتف: ${customerPhone}\n`;
    message += `📍 العنوان: ${customerAddress}\n`;
    message += `${'='.repeat(25)}\n`;
    message += `🛒 الطلبية:\n`;
    
    const totalPrice = shoppingCart.reduce((total, item) => total + (item.price * item.quantity), 0);
    
    shoppingCart.forEach((item, index) => {
        const itemTotal = (item.price * item.quantity).toFixed(2);
        message += `  ${toArabicDigits(index + 1)}️⃣ ${item.name} ⬅️ الكمية: [ ${toArabicDigits(item.quantity)} ] - السعر: ${toArabicDigits(itemTotal)} ج.م\n`;
    });
    
    message += `${'='.repeat(25)}\n`;
    message += `💰 الإجمالي: ${toArabicDigits(totalPrice.toFixed(2))} ج.م\n`;
    message += `⏳ تم إرسال الطلب من الموقع\n`;
    message += `📌 ملاحظة: أجرة التوصيل يتم الاتفاق عليها مع الدعم الفني\n`;
    message += `شكراً لزيارتك موقعنا 🙏`;
    
    const whatsappNumber = WHATSAPP_NUMBER;
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodedMessage}`;
    
    window.open(whatsappUrl, '_blank');
    
    // حفظ العميل
    if (customerPhone) {
        const customerId = generateCustomerId();
        addCustomer(customerId, {
            name: customerName,
            phone: customerPhone,
            address: customerAddress,
            subscribedAt: new Date().toISOString(),
            source: 'order'
        });
    }
    
    showNotification('✅ تم فتح واتساب');
}

// ==================== الفيديوهات ====================
function displayVideos() {
    const container = document.querySelector('.videos-grid');
    if (!container) return;
    
    container.innerHTML = allVideos.map(video => `
        <div class="video-card">
            <div class="video-frame">
                ${video.videoUrl ? `<video controls><source src="${video.videoUrl}" type="video/mp4"></video>` : '<div style="width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; background: #f0f0f0; font-size: 48px;">🎥</div>'}
            </div>
            <div class="video-info">
                <h3 class="video-title">${video.title}</h3>
                <p class="video-description">${video.description}</p>
            </div>
        </div>
    `).join('');
}

// ==================== الاشتراك ====================
function handleSubscription(e) {
    e.preventDefault();
    
    const name = document.querySelector('#subscriber-name').value.trim();
    const phone = document.querySelector('#subscriber-phone').value.trim();
    
    if (!name || !phone) {
        showNotification('⚠️ أدخل الاسم والهاتف');
        return;
    }
    
    const customerId = generateCustomerId();
    addCustomer(customerId, {
        name: name,
        phone: phone,
        address: '',
        subscribedAt: new Date().toISOString(),
        source: 'subscription'
    });
    
    document.querySelector('#subscription-form').reset();
    showNotification('✅ شكراً لاشتراكك!');
}

// ==================== تحديث الواجهة ====================
function updateUI() {
    displayCategories();
    displayProducts();
    updateOrdersList();
    displayVideos();
}

// ==================== الإشعارات ====================
function showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'toast-notification show';
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

console.log('✅ تم تحميل app.js');
