const ADMIN_USERNAME = 'admin';
const ADMIN_PASSWORD = '01070780092';

let adminProducts = [];
let adminCategories = [];
let adminMedia = {};
let adminCustomers = {};
let newProductImg = null;
let newCategoryImg = null;
let savingInProgress = false;

document.addEventListener('DOMContentLoaded', async () => {
    initTabs();
    initForms();

    const canLoadAdmin = initAdminAuth();

    if (canLoadAdmin) {
        await loadAll();
        updateCloudBadge();
    }
});

function initAdminAuth() {
    const loginScreen = document.getElementById('admin-login-screen');
    const adminPanel = document.getElementById('admin-panel');
    const loginForm = document.getElementById('admin-login-form');
    const errorEl = document.getElementById('admin-login-error');

    if (!loginScreen || !adminPanel || !loginForm) return true;

    const isLoggedIn = sessionStorage.getItem('aboBashaAdminAuth') === 'true';

    if (isLoggedIn) {
        loginScreen.style.display = 'none';
        adminPanel.hidden = false;
        return true;
    }

    loginScreen.style.display = 'grid';
    adminPanel.hidden = true;

    loginForm.addEventListener('submit', async event => {
        event.preventDefault();

        const username = document.getElementById('admin-username').value.trim();
        const password = document.getElementById('admin-password').value.trim();

        if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
            sessionStorage.setItem('aboBashaAdminAuth', 'true');
            loginScreen.style.display = 'none';
            adminPanel.hidden = false;
            errorEl.textContent = '';

            await loadAll();
            updateCloudBadge();
        } else {
            errorEl.textContent = 'بيانات الدخول غير صحيحة';
        }
    });

    return false;
}

function logoutAdmin() {
    sessionStorage.removeItem('aboBashaAdminAuth');
    location.reload();
}

function updateCloudBadge() {
    const header = document.querySelector('.admin-header h1');
    if (!header || header.querySelector('.cloud-badge')) return;

    const badge = document.createElement('span');
    badge.className = 'cloud-badge';
    badge.style.cssText = 'font-size:13px;padding:4px 10px;border-radius:6px;margin-inline-start:10px;font-weight:700;';

    if (CloudStorage.isReady()) {
        badge.textContent = '☁️ متصل بالسحابة';
        badge.style.background = '#dcfce7';
        badge.style.color = '#166534';
    } else {
        badge.textContent = '⚠️ تخزين محلي فقط';
        badge.style.background = '#fef3c7';
        badge.style.color = '#92400e';
    }

    header.appendChild(badge);
}

async function loadAll() {
    if (CloudStorage.isReady()) {
        adminProducts = await CloudStorage.getProducts();
        adminCategories = await CloudStorage.getCategories();
        adminMedia = await CloudStorage.getMedia();
        adminCustomers = await CloudStorage.getCustomers();
    } else {
        adminProducts = Storage.getProducts();
        adminCategories = Storage.getCategories();
        adminMedia = Storage.getMedia();
        adminCustomers = Storage.getCustomers();
    }

    adminProducts = adminProducts.map(product => ({
        ...product,
        categoryId: product.categoryId || guessCategoryId(product.name)
    }));

    renderProducts();
    renderCategories();
    renderMedia();
    renderCustomers();
    renderCategoryOptions();
}

function initTabs() {
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));

            btn.classList.add('active');
            document.getElementById('tab-' + btn.dataset.tab).classList.add('active');
        });
    });
}

function renderCategoryOptions() {
    const select = document.getElementById('np-category');
    if (!select) return;

    select.innerHTML = adminCategories.map(category => `
        <option value="${escAttr(category.id)}">${escHtml(category.name)}</option>
    `).join('');
}

function renderProducts() {
    const list = document.getElementById('products-list');
    if (!list) return;

    list.innerHTML = '';

    if (!adminProducts.length) {
        list.innerHTML = '<p style="text-align:center;color:#64748b;padding:30px;">لا توجد أصناف.</p>';
        return;
    }

    adminProducts.forEach((product, index) => {
        const imgSrc = safeImageSrc(product.image) || 'https://placehold.co/110x90/f8fafc/64748b?text=بدون+صورة';

        const categoryOptions = adminCategories.map(category => `
            <option value="${escAttr(category.id)}" ${String(product.categoryId) === String(category.id) ? 'selected' : ''}>
                ${escHtml(category.name)}
            </option>
        `).join('');

        const div = document.createElement('div');
        div.className = 'item-card product';

        div.innerHTML = `
            <div class="img-cell">
                <img class="thumb" src="${escAttr(imgSrc)}" id="prod-img-${index}" alt="">
                <input type="file" accept="image/*" onchange="handleProductImage(event, ${index})">
            </div>

            <div>
                <label>اسم الصنف</label>
                <input type="text" value="${escHtml(product.name)}" onchange="updateProductField(${index}, 'name', this.value)">
            </div>

            <div>
                <label>الفئة</label>
                <select onchange="updateProductField(${index}, 'categoryId', this.value)">
                    ${categoryOptions}
                </select>
            </div>

            <div>
                <label>السعر الحالي</label>
                <input type="number" step="0.01" value="${Number(product.price) || 0}" onchange="updateProductField(${index}, 'price', this.value)">
            </div>

            <div>
                <label>سعر أمس</label>
                <input type="number" step="0.01" value="${Number(product.previousPrice ?? product.price) || 0}" onchange="updateProductField(${index}, 'previousPrice', this.value)">
            </div>

            <div>
                <button class="btn btn-danger" onclick="deleteProduct(${index})" aria-label="حذف الصنف">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;

        list.appendChild(div);
    });
}

function updateProductField(index, field, value) {
    if (field === 'price' || field === 'previousPrice') {
        adminProducts[index][field] = parseFloat(value) || 0;
    } else {
        adminProducts[index][field] = value;
    }
}

async function handleProductImage(event, index) {
    const file = event.target.files[0];
    if (!file) return;

    try {
        const dataUrl = await ImageUtils.fileToBase64(file, { maxWidth: 700, maxSizeKB: 230 });
        adminProducts[index].image = dataUrl;
        document.getElementById(`prod-img-${index}`).src = dataUrl;
        showToast('✅ تم تحديث الصورة — اضغط حفظ ونشر للسحابة');
    } catch {
        showToast('⚠️ فشل تحميل الصورة');
    }
}

function deleteProduct(index) {
    if (!confirm('حذف هذا الصنف؟')) return;
    adminProducts.splice(index, 1);
    renderProducts();
}

function publishTodayPrices() {
    if (!adminProducts.length) return showToast('⚠️ لا توجد أصناف لنشر أسعارها');

    if (!confirm('سيتم نقل الأسعار الحالية إلى «سعر أمس» لكل الأصناف. تابع؟')) return;

    adminProducts.forEach(product => {
        product.previousPrice = Number(product.price) || 0;
    });

    renderProducts();
    showToast('✅ تم نقل الأسعار الحالية إلى سعر أمس');
}

function renderCategories() {
    const list = document.getElementById('categories-list');
    if (!list) return;

    list.innerHTML = '';

    if (!adminCategories.length) {
        list.innerHTML = '<p style="text-align:center;color:#64748b;padding:30px;">لا توجد فئات.</p>';
        return;
    }

    adminCategories.forEach((category, index) => {
        const imgSrc = safeImageSrc(category.image) || 'https://placehold.co/110x90/f8fafc/64748b?text=بدون+صورة';

        const div = document.createElement('div');
        div.className = 'item-card category';

        div.innerHTML = `
            <div class="img-cell">
                <img class="thumb" src="${escAttr(imgSrc)}" id="cat-img-${index}" alt="">
                <input type="file" accept="image/*" onchange="handleCategoryImage(event, ${index})">
            </div>

            <div>
                <label>اسم الفئة</label>
                <input type="text" value="${escHtml(category.name)}" onchange="updateCategoryField(${index}, 'name', this.value)">
            </div>

            <div>
                <label>أيقونة</label>
                <input type="text" value="${escHtml(category.icon)}" onchange="updateCategoryField(${index}, 'icon', this.value)">
            </div>

            <div>
                <button class="btn btn-danger" onclick="deleteCategory(${index})">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;

        list.appendChild(div);
    });

    renderCategoryOptions();
}

function updateCategoryField(index, field, value) {
    adminCategories[index][field] = value;
    renderCategoryOptions();
}

async function handleCategoryImage(event, index) {
    const file = event.target.files[0];
    if (!file) return;

    try {
        const dataUrl = await ImageUtils.fileToBase64(file, { maxWidth: 600, maxSizeKB: 200 });
        adminCategories[index].image = dataUrl;
        document.getElementById(`cat-img-${index}`).src = dataUrl;
        showToast('✅ تم تحديث الصورة — اضغط حفظ ونشر للسحابة');
    } catch {
        showToast('⚠️ فشل تحميل الصورة');
    }
}

function deleteCategory(index) {
    if (!confirm('حذف هذه الفئة؟')) return;

    const deletedId = adminCategories[index].id;
    adminCategories.splice(index, 1);

    adminProducts = adminProducts.map(product => {
        if (product.categoryId === deletedId) {
            return { ...product, categoryId: adminCategories[0]?.id || 'c1' };
        }

        return product;
    });

    renderCategories();
    renderProducts();
}

function renderMedia() {
    const set = (id, src, fallback) => {
        const el = document.getElementById(id);
        if (el) el.src = safeImageSrc(src) || fallback;
    };

    set('media-nav-preview', adminMedia.navLogo, 'https://placehold.co/80x80/0a1b35/fff?text=Logo');
    set('media-hero-preview', adminMedia.heroImage, 'https://placehold.co/600x500/f4f7f6/1e293b?text=Hero+Image');
    set('media-footer-preview', adminMedia.footerLogo, 'https://placehold.co/80x80/0a1b35/fff?text=Logo');
}

async function handleMediaUpload(event, key, previewId) {
    const file = event.target.files[0];
    if (!file) return;

    const options = key === 'heroImage'
        ? { maxWidth: 1400, maxSizeKB: 380 }
        : { maxWidth: 350, maxSizeKB: 140 };

    try {
        const dataUrl = await ImageUtils.fileToBase64(file, options);
        adminMedia[key] = dataUrl;
        document.getElementById(previewId).src = dataUrl;
        showToast('✅ تم تحديث الصورة — اضغط حفظ ونشر للسحابة');
    } catch {
        showToast('⚠️ فشل تحميل الصورة');
    }
}

function renderCustomers() {
    const list = document.getElementById('customers-list');
    if (!list) return;

    list.innerHTML = '';

    const entries = Object.entries(adminCustomers);

    if (!entries.length) {
        list.innerHTML = '<p style="text-align:center;color:#64748b;padding:30px;">لا يوجد عملاء.</p>';
        return;
    }

    entries.forEach(([code, customer]) => {
        const codeJs = JSON.stringify(code);

        const div = document.createElement('div');
        div.className = 'item-card customer';

        div.innerHTML = `
            <div>
                <label>الكود</label>
                <input type="text" value="${escHtml(code)}" disabled style="background:#f1f5f9;">
            </div>

            <div>
                <label>الاسم</label>
                <input type="text" value="${escHtml(customer.name)}" onchange="updateCustomerField(${codeJs}, 'name', this.value)">
            </div>

            <div>
                <label>العنوان</label>
                <input type="text" value="${escHtml(customer.address)}" onchange="updateCustomerField(${codeJs}, 'address', this.value)">
            </div>

            <div>
                <label>الهاتف</label>
                <input type="tel" value="${escHtml(customer.phone || '')}" onchange="updateCustomerField(${codeJs}, 'phone', this.value)">
            </div>

            <div>
                <button type="button" class="btn btn-danger" onclick="deleteCustomer(${codeJs})">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;

        list.appendChild(div);
    });
}

function updateCustomerField(code, field, value) {
    adminCustomers[code][field] = value;
}

function deleteCustomer(code) {
    if (!confirm(`حذف العميل ${code}؟`)) return;
    delete adminCustomers[code];
    renderCustomers();
}

function openModal(id) {
    document.getElementById(id).classList.add('show');
    renderCategoryOptions();
}

function closeModal(id) {
    document.getElementById(id).classList.remove('show');

    const form = document.querySelector(`#${id} form`);
    if (form) form.reset();

    if (id === 'addProductModal') {
        newProductImg = null;
        document.getElementById('np-image-preview').src = 'https://placehold.co/100x100?text=صورة';
    }

    if (id === 'addCategoryModal') {
        newCategoryImg = null;
        document.getElementById('nc-image-preview').src = 'https://placehold.co/100x100?text=صورة';
    }
}

async function previewNewImage(event, previewId, holder) {
    const file = event.target.files[0];
    if (!file) return;

    try {
        const dataUrl = await ImageUtils.fileToBase64(file, { maxWidth: 800, maxSizeKB: 260 });
        document.getElementById(previewId).src = dataUrl;

        if (holder === 'newProductImg') newProductImg = dataUrl;
        if (holder === 'newCategoryImg') newCategoryImg = dataUrl;
    } catch {
        showToast('⚠️ فشل تحميل الصورة');
    }
}

function initForms() {
    document.getElementById('add-product-form')?.addEventListener('submit', event => {
        event.preventDefault();

        const price = parseFloat(document.getElementById('np-price').value) || 0;
        const previousPrice = parseFloat(document.getElementById('np-prev-price').value) || price;
        const categoryId = document.getElementById('np-category')?.value || adminCategories[0]?.id || 'c1';

        adminProducts.push({
            id: Date.now().toString(),
            name: document.getElementById('np-name').value.trim(),
            categoryId,
            price,
            previousPrice,
            image: newProductImg || ''
        });

        renderProducts();
        closeModal('addProductModal');
        showToast('✅ تمت إضافة الصنف — اضغط حفظ ونشر للسحابة');
    });

    document.getElementById('add-category-form')?.addEventListener('submit', event => {
        event.preventDefault();

        adminCategories.push({
            id: 'c' + Date.now(),
            name: document.getElementById('nc-name').value.trim(),
            icon: document.getElementById('nc-icon').value.trim() || 'fa-box',
            image: newCategoryImg || ''
        });

        renderCategories();
        closeModal('addCategoryModal');
        showToast('✅ تمت إضافة الفئة — اضغط حفظ ونشر للسحابة');
    });

    document.getElementById('add-customer-form')?.addEventListener('submit', event => {
        event.preventDefault();

        const code = toEnglishDigits(document.getElementById('ncu-code').value.trim()).toUpperCase();

        if (!code) return showToast('⚠️ أدخل الكود');
        if (adminCustomers[code]) return showToast('⚠️ الكود موجود بالفعل');

        adminCustomers[code] = {
            name: document.getElementById('ncu-name').value.trim(),
            address: document.getElementById('ncu-address').value.trim(),
            phone: toEnglishDigits(document.getElementById('ncu-phone').value.trim())
        };

        renderCustomers();
        closeModal('addCustomerModal');
        showToast('✅ تمت إضافة العميل — اضغط حفظ ونشر للسحابة');
    });

    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', event => {
            if (event.target === modal) closeModal(modal.id);
        });
    });
}

async function saveAllChanges() {
    if (savingInProgress) return;

    savingInProgress = true;
    showToast('⏳ جاري الحفظ والنشر...');

    let ok = false;

    if (CloudStorage.isReady()) {
        const results = await Promise.all([
            CloudStorage.setProducts(adminProducts),
            CloudStorage.setCategories(adminCategories),
            CloudStorage.setMedia(adminMedia),
            CloudStorage.setCustomers(adminCustomers)
        ]);

        ok = results.every(result => result === true);

        if (ok) {
            Storage.setProducts(adminProducts);
            Storage.setCategories(adminCategories);
            Storage.setMedia(adminMedia);
            Storage.setCustomers(adminCustomers);

            if (typeof CloudStorage.setPriceUpdateNotice === 'function') {
                await CloudStorage.setPriceUpdateNotice();
            }
        }
    } else {
        ok =
            Storage.setProducts(adminProducts) &&
            Storage.setCategories(adminCategories) &&
            Storage.setMedia(adminMedia) &&
            Storage.setCustomers(adminCustomers);
    }

    savingInProgress = false;

    showToast(
        ok
            ? '✅ تم الحفظ والنشر وإرسال إشعار تحديث الأسعار'
            : '⚠️ فشل الحفظ'
    );
}

async function resetAllData() {
    if (!confirm('سيتم حذف كل التعديلات وإعادة الإعدادات الافتراضية. متأكد؟')) return;

    if (CloudStorage.isReady()) {
        await CloudStorage.resetAll();
    }

    Storage.resetAll();
    await loadAll();

    showToast('✅ تمت استعادة الإعدادات الافتراضية');
}

function exportAllData() {
    const payload = {
        products: adminProducts,
        categories: adminCategories,
        media: adminMedia,
        customers: adminCustomers,
        exportedAt: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const link = document.createElement('a');

    link.href = URL.createObjectURL(blob);
    link.download = `abo-basha-backup-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();

    URL.revokeObjectURL(link.href);
    showToast('✅ تم تصدير البيانات');
}

function importAllData(event) {
    const file = event.target.files && event.target.files[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onload = () => {
        try {
            const data = JSON.parse(reader.result);

            if (Array.isArray(data.products)) adminProducts = data.products;
            if (Array.isArray(data.categories)) adminCategories = data.categories;
            if (data.media && typeof data.media === 'object') adminMedia = data.media;
            if (data.customers && typeof data.customers === 'object') adminCustomers = data.customers;

            renderProducts();
            renderCategories();
            renderMedia();
            renderCustomers();
            renderCategoryOptions();

            showToast('✅ تم الاستيراد — اضغط حفظ ونشر للسحابة');
        } catch {
            showToast('⚠️ ملف JSON غير صالح');
        }
    };

    reader.onerror = () => showToast('⚠️ فشل قراءة الملف');
    reader.readAsText(file);
    event.target.value = '';
}

function esc(value) {
    return escHtml(value);
}

function showToast(message) {
    const toast = document.getElementById('toast');
    if (!toast) return;

    toast.textContent = message;
    toast.classList.add('show');

    clearTimeout(window._toastTimer);
    window._toastTimer = setTimeout(() => toast.classList.remove('show'), 3500);
}
