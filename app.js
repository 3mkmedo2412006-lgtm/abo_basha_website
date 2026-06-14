let currentModalProduct = null;
let lastSeenPriceNotice = Number(localStorage.getItem('aboBashaLastPriceNotice') || 0);
let selectedOrderCategoryId = null;
let allCategories = [];

/*
 * مهم:
 * يجب وضع Web Push VAPID Key من Firebase Console هنا.
 * Firebase Console → Project settings → Cloud Messaging → Web Push certificates
 */
const FIREBASE_VAPID_KEY = 'ضع_هنا_VAPID_KEY_من_Firebase';

document.addEventListener('DOMContentLoaded', () => {
    renderDate();
    renderSocialLinks();
    renderContactPhones();
    renderGoogleMapsLink();

    initMobileNav();
    initDynamicItems();
    initOrderCategoryTabs();
    initSearchBox();
    initCustomerCodeLookup();
    initWhatsAppForm();
    initPushNotifications();
    initPriceUpdateNotice();

    if (CloudStorage.isReady()) {
        CloudStorage.listenMedia(data => renderMediaData(data));
        CloudStorage.listenProducts(data => renderPricesData(data));
        CloudStorage.listenCategories(data => {
            allCategories = data;
            renderCategoriesData(data);
            renderFooterCategoriesData(data);
            renderOrderCategoryTabs(data);
        });

        console.log('🔄 Real-time sync active');
    } else {
        renderMediaData(Storage.getMedia());
        renderPricesData(Storage.getProducts());

        const categories = Storage.getCategories();
        allCategories = categories;
        renderCategoriesData(categories);
        renderFooterCategoriesData(categories);
        renderOrderCategoryTabs(categories);
    }
});

function renderDate() {
    const el = document.getElementById('today-date');
    if (!el) return;

    const opts = {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    };

    el.textContent = `أسعار يوم ${toArabicDigits(new Date().toLocaleDateString('ar-EG', opts))}`;
}

function renderMediaData(media = {}) {
    const setImg = (id, src, areaClass) => {
        const el = document.getElementById(id);
        if (!el) return;

        const area = areaClass ? el.closest('.' + areaClass) : null;

        if (src && src.length > 10) {
            const safe = safeImageSrc(src);

            if (safe) {
                el.src = safe;
                el.style.display = '';
                if (area) area.classList.remove('hero-no-image');
                return;
            }
        }

        el.removeAttribute('src');
        el.style.display = 'none';
        if (area) area.classList.add('hero-no-image');
    };

    setImg('nav-logo-img', media.navLogo);
    setImg('hero-main-img', media.heroImage, 'hero-image-area');
    setImg('footer-logo-img', media.footerLogo);
}

function renderSocialLinks() {
    document.querySelectorAll('.js-whatsapp-link').forEach(link => {
        link.href = `https://wa.me/${WHATSAPP_NUMBER}`;
        link.rel = 'noopener noreferrer';
    });

    document.querySelectorAll('.js-facebook-link').forEach(link => {
        link.href = FACEBOOK_URL;
        link.rel = 'noopener noreferrer';
    });

    document.querySelectorAll('.js-tel-primary').forEach(link => {
        link.href = `tel:+${PHONE_NUMBERS[0]}`;
        link.setAttribute('aria-label', `اتصل بنا ${formatPhoneDisplay(PHONE_NUMBERS[0])}`);
    });

    const primaryEl = document.querySelector('.js-primary-phone-display');
    if (primaryEl) primaryEl.textContent = formatPhoneDisplay(PHONE_NUMBERS[0]);
}

function renderContactPhones() {
    const ul = document.getElementById('contact-phones-list');
    if (!ul) return;

    ul.innerHTML = PHONE_NUMBERS.map(num => `
        <li>
            <a href="tel:+${num}" class="phone-link">
                <i class="fas fa-phone-volume"></i>
                <span>${formatPhoneDisplay(num)}</span>
            </a>
        </li>
    `).join('') + `
        <li>
            <a href="https://wa.me/${WHATSAPP_NUMBER}" target="_blank" class="phone-link whatsapp js-whatsapp-link">
                <i class="fab fa-whatsapp"></i>
                <span>تواصل واتساب</span>
            </a>
        </li>
    `;

    renderSocialLinks();
}

function renderGoogleMapsLink() {
    const link = document.getElementById('google-maps-link');
    if (!link || typeof GOOGLE_MAPS_URL === 'undefined') return;

    link.href = GOOGLE_MAPS_URL;
}

function renderPricesData(products) {
    const container = document.getElementById('prices-container');
    if (!container) return;

    const normalizedProducts = (products || []).map(product => ({
        ...product,
        categoryId: product.categoryId || guessCategoryId(product.name)
    }));

    window.latestProductsData = normalizedProducts;
    container.innerHTML = '';

    updateProductDropdown(normalizedProducts);

    if (!normalizedProducts.length) {
        container.innerHTML = '<p style="text-align:center;color:#64748b;padding:40px;grid-column:1/-1;">لا توجد أصناف حالياً</p>';
        return;
    }

    normalizedProducts.forEach(product => {
        const safeSrc = safeImageSrc(product.image);

        const imgHtml = safeSrc
            ? `<img src="${escAttr(safeSrc)}" alt="${escHtml(product.name)}" class="product-img" loading="lazy" decoding="async">`
            : `<div class="product-img-placeholder" aria-hidden="true"><i class="fas fa-feather"></i></div>`;

        container.insertAdjacentHTML('beforeend', `
            <button class="price-card anti-gravity-card" type="button" onclick="openProductDetails('${escAttr(product.id || product.name)}')">
                ${imgHtml}
                <h3>${escHtml(product.name)}</h3>
                <div class="day-label">السعر اليومي</div>
                <div class="price-box">
                    <span class="price-number">${formatArabicPrice(product.price)}</span>
                    <span class="currency">جنيه</span>
                </div>
                <div class="update-time">آخر تحديث: اليوم</div>
            </button>
        `);
    });
}

function renderCategoriesData(categories = []) {
    const container = document.getElementById('categories-container');
    if (!container) return;

    container.innerHTML = '';

    categories.forEach(category => {
        const icon = String(category.icon || 'fa-box').replace(/[^a-z0-9-]/gi, '') || 'fa-box';
        const safeSrc = safeImageSrc(category.image);

        const imgHtml = safeSrc
            ? `<img src="${escAttr(safeSrc)}" alt="${escHtml(category.name)}" loading="lazy" decoding="async">`
            : `<div class="cat-icon-placeholder" aria-hidden="true"><i class="fas ${icon}"></i></div>`;

        container.insertAdjacentHTML('beforeend', `
            <button class="category-card" type="button" onclick="filterProductsByCategory('${escAttr(category.id)}')">
                <div class="cat-img-box">${imgHtml}</div>
                <div class="cat-footer">
                    <span>${escHtml(category.name)}</span>
                    <i class="fas ${icon} cat-icon" aria-hidden="true"></i>
                </div>
            </button>
        `);
    });
}

function renderFooterCategoriesData(categories = []) {
    const ul = document.getElementById('footer-categories-list');
    if (!ul) return;

    ul.innerHTML = categories.slice(0, 6).map(category => `
        <li><a href="#categories">${escHtml(category.name)}</a></li>
    `).join('');
}

function filterProductsByCategory(categoryId) {
    const products = window.latestProductsData || [];
    const filtered = products.filter(product => String(product.categoryId || guessCategoryId(product.name)) === String(categoryId));

    if (filtered.length) {
        renderPricesData(filtered);
        document.getElementById('prices')?.scrollIntoView({ behavior: 'smooth' });
    } else {
        showToast('لا توجد منتجات داخل هذه الفئة حالياً');
    }
}

function initMobileNav() {
    const toggle = document.getElementById('nav-toggle');
    const menu = document.getElementById('nav-mobile-menu');

    if (!toggle || !menu) return;

    toggle.addEventListener('click', () => {
        const open = menu.classList.toggle('open');

        toggle.classList.toggle('open', open);
        toggle.setAttribute('aria-expanded', String(open));
        toggle.setAttribute('aria-label', open ? 'إغلاق القائمة' : 'فتح القائمة');
    });

    menu.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            menu.classList.remove('open');
            toggle.classList.remove('open');
            toggle.setAttribute('aria-expanded', 'false');
        });
    });
}

function initCustomerCodeLookup() {
    const input = document.getElementById('customer-code');
    if (!input) return;

    let timer;

    input.addEventListener('input', () => {
        clearTimeout(timer);

        timer = setTimeout(async () => {
            const code = toEnglishDigits(input.value.trim()).toUpperCase();

            const customers = CloudStorage.isReady()
                ? await CloudStorage.getCustomers()
                : Storage.getCustomers();

            if (code && customers[code]) {
                document.getElementById('customer-name').value = customers[code].name;
                document.getElementById('customer-address').value = customers[code].address;

                if (customers[code].phone) {
                    document.getElementById('customer-phone').value = customers[code].phone;
                }

                showToast(`تم التعرف على: ${customers[code].name}`);
            }
        }, 400);
    });
}

function initDynamicItems() {
    const addBtn = document.getElementById('add-item-btn');
    const container = document.getElementById('dynamic-items-container');

    if (!addBtn || !container) return;

    addBtn.addEventListener('click', () => {
        const row = document.createElement('div');
        row.className = 'order-item-row';

        const firstSelect = container.querySelector('.product-select');
        const select = firstSelect.cloneNode(true);
        select.value = '';

        const qty = document.createElement('input');
        qty.type = 'text';
        qty.className = 'product-qty';
        qty.inputMode = 'numeric';
        qty.placeholder = 'الكمية';
        qty.required = true;

        const removeBtn = document.createElement('button');
        removeBtn.type = 'button';
        removeBtn.className = 'remove-item-btn';
        removeBtn.innerHTML = '✕';
        removeBtn.title = 'حذف';
        removeBtn.setAttribute('aria-label', 'حذف هذا المنتج');

        removeBtn.addEventListener('click', () => {
            row.style.animation = 'slideOut 0.3s ease-in forwards';
            setTimeout(() => {
                row.remove();
                updateOrderSummary();
            }, 300);
        });

        row.appendChild(select);
        row.appendChild(qty);
        row.appendChild(removeBtn);

        container.appendChild(row);
        attachOrderRowListeners(row);
        row.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        updateOrderSummary();
    });

    // Attach listeners to any existing rows on load
    Array.from(container.querySelectorAll('.order-item-row')).forEach(r => attachOrderRowListeners(r));
}

function renderOrderCategoryTabs(categories = []) {
    const tabsContainer = document.getElementById('order-categories-tabs');
    if (!tabsContainer) return;

    tabsContainer.innerHTML = '';

    const allBtn = document.createElement('button');
    allBtn.type = 'button';
    allBtn.className = 'order-category-tab';
    allBtn.textContent = '📦 جميع المنتجات';
    allBtn.dataset.categoryId = 'all';
    allBtn.style.cssText = 'padding: 10px 16px; border-radius: 8px; border: 2px solid #0a1b35; background: #0a1b35; color: white; font-weight: 700; cursor: pointer; transition: 0.2s;';
    allBtn.addEventListener('click', () => {
        selectedOrderCategoryId = null;
        renderOrderCategoryTabs(categories);
        filterOrderProducts();
    });
    tabsContainer.appendChild(allBtn);

    categories.forEach(category => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'order-category-tab';
        btn.textContent = category.name;
        btn.dataset.categoryId = category.id;
        btn.style.cssText = 'padding: 10px 16px; border-radius: 8px; border: 2px solid #64748b; background: #f1f5f9; color: #0a1b35; font-weight: 700; cursor: pointer; transition: 0.2s; font-size: 13px;';
        btn.addEventListener('click', () => {
            selectedOrderCategoryId = category.id;
            renderOrderCategoryTabs(categories);
            filterOrderProducts();
        });
        tabsContainer.appendChild(btn);
    });

    // Update active state
    tabsContainer.querySelectorAll('.order-category-tab').forEach(tab => {
        if (!selectedOrderCategoryId && tab.dataset.categoryId === 'all') {
            tab.style.background = '#0a1b35';
            tab.style.borderColor = '#0a1b35';
            tab.style.color = 'white';
        } else if (selectedOrderCategoryId && String(tab.dataset.categoryId) === String(selectedOrderCategoryId)) {
            tab.style.background = '#0a1b35';
            tab.style.borderColor = '#0a1b35';
            tab.style.color = 'white';
        } else {
            tab.style.background = '#f1f5f9';
            tab.style.borderColor = '#64748b';
            tab.style.color = '#0a1b35';
        }
    });
}

function filterOrderProducts() {
    const products = window.latestProductsData || [];
    let filtered = products;

    if (selectedOrderCategoryId) {
        filtered = products.filter(p => String(p.categoryId) === String(selectedOrderCategoryId));
    }

    updateProductDropdown(filtered);
}

function updateProductDropdown(products = []) {
    const select = document.querySelector('.product-select');
    if (!select) return;

    const currentValue = select.value;
    select.innerHTML = '<option value="">-- اختر منتج --</option>';

    if (products.length === 0) {
        const opt = document.createElement('option');
        opt.textContent = 'لا توجد منتجات';
        opt.disabled = true;
        select.appendChild(opt);
        return;
    }

    products.forEach(p => {
        const opt = document.createElement('option');
        opt.value = p.name;
        opt.textContent = `${p.name} - ${formatArabicPrice(p.price)} جنيه`;
        select.appendChild(opt);
    });

    if (currentValue && select.querySelector(`option[value="${currentValue}"]`)) {
        select.value = currentValue;
    }
}

function initOrderCategoryTabs() {
    const categories = allCategories.length > 0 ? allCategories : Storage.getCategories();
    if (categories.length > 0) {
        renderOrderCategoryTabs(categories);
    }
}

function initSearchBox() {
    const searchInput = document.getElementById('nav-search-input');
    const resultsDropdown = document.getElementById('search-results-dropdown');
    if (!searchInput) return;

    searchInput.addEventListener('input', () => {
        const query = searchInput.value.trim().toLowerCase();
        if (!query) {
            resultsDropdown.style.display = 'none';
            return;
        }

        const products = window.latestProductsData || [];
        const filtered = products.filter(p => p.name.includes(query)).slice(0, 8);

        if (filtered.length === 0) {
            resultsDropdown.innerHTML = '<div style="padding: 12px; text-align: center; color: #64748b;">لا توجد نتائج</div>';
            resultsDropdown.style.display = '';
            return;
        }

        resultsDropdown.innerHTML = filtered.map(p => `
            <button type="button" onclick="openProductDetails('${escAttr(p.id || p.name)}'); document.getElementById('nav-search-input').value = ''; document.getElementById('search-results-dropdown').style.display = 'none';" style="display: block; width: 100%; text-align: right; padding: 10px 12px; border: none; background: none; border-bottom: 1px solid #f1f5f9; cursor: pointer; transition: 0.1s;" onmouseover="this.style.background = '#f8fafc'" onmouseout="this.style.background = 'none'">
                <strong>${escHtml(p.name)}</strong><br>
                <small style="color: #64748b;">${formatArabicPrice(p.price)} جنيه</small>
            </button>
        `).join('');
        resultsDropdown.style.display = '';
    });

    document.addEventListener('click', (e) => {
        if (!searchInput.contains(e.target) && !resultsDropdown.contains(e.target)) {
            resultsDropdown.style.display = 'none';
        }
    });
}

function initWhatsAppForm() {
    const form = document.getElementById('whatsapp-order-form');
    if (!form) return;

    form.addEventListener('submit', event => {
        event.preventDefault();

        const name = document.getElementById('customer-name').value.trim();
        const phone = toEnglishDigits(document.getElementById('customer-phone').value.trim());
        const address = document.getElementById('customer-address').value.trim();
        const codeInput = document.getElementById('customer-code').value.trim();
        const code = toEnglishDigits(codeInput) || 'عميل جديد';

        let valid = true;
        let itemsLines = [];
        let grandTotal = 0;

        document.querySelectorAll('.order-item-row').forEach((row, index) => {
            const select = row.querySelector('.product-select');
            const qtyInput = row.querySelector('.product-qty');

            const productName = select ? select.value : '';
            const quantity = qtyInput ? Number(toEnglishDigits(qtyInput.value.trim())) || 0 : 0;

            if (!productName || !quantity) {
                valid = false;
                return;
            }

            const product = (window.latestProductsData || []).find(p => p.name === productName) || {};
            const unit = Number(product.price || 0);
            const lineTotal = unit * quantity;
            grandTotal += lineTotal;

            itemsLines.push(`${formatOrderIndex(index + 1)} ${productName} — الكمية: ${quantity} — سعر الوحدة: ${formatArabicPrice(unit)} جنيه — الإجمالي: ${formatArabicPrice(lineTotal)} جنيه`);
        });

        if (!valid || !itemsLines.length) return showToast('اختر الأصناف وحدد الكميات');
        if (!name || !phone || !address) return showToast('أدخل الاسم والهاتف والعنوان');

        const itemsText = itemsLines.map(l => `  ${l}`).join('\n');

        const message =
            `📦 *طلب جديد من موقع مجموعة أبو باشا*\n` +
            `=========================\n` +
            `👤 *الاسم:* ${name}\n` +
            `🔑 *كود العميل:* ${code}\n` +
            `📞 *الهاتف:* ${phone}\n` +
            `📍 *العنوان:* ${address}\n` +
            `=========================\n` +
            `🛒 *الطلبية:*\n${itemsText}\n` +
            `-------------------------\n` +
            `💰 *الإجمالي الكلي:* ${formatArabicPrice(grandTotal)} جنيه\n` +
            `📌 ملاحظة: أجر التوصيل يتم الاتفاق عليه مع الدعم الفني للمعمل.` +
            `\n=========================\n` +
            `⏳ _تم إرسال الطلب من الموقع_`;

        window.open(`https://api.whatsapp.com/send?phone=${WHATSAPP_NUMBER}&text=${encodeURIComponent(message)}`, '_blank');
        showToast('تم فتح الواتساب لإرسال طلبك!');
    });
}

function openProductDetails(productId) {
    const products = window.latestProductsData || Storage.getProducts();
    const product = products.find(item => String(item.id || item.name) === String(productId));

    if (!product) {
        showToast('تعذر فتح تفاصيل المنتج');
        return;
    }

    currentModalProduct = product;

    const modal = document.getElementById('product-modal');
    const imageBox = document.getElementById('product-modal-image');
    const title = document.getElementById('product-modal-title');
    const price = document.getElementById('product-modal-price');
    const whatsapp = document.getElementById('product-modal-whatsapp');

    if (!modal || !imageBox || !title || !price || !whatsapp) return;

    const safeSrc = safeImageSrc(product.image);

    imageBox.innerHTML = safeSrc
        ? `<img src="${escAttr(safeSrc)}" alt="${escHtml(product.name)}">`
        : `<div class="product-modal-placeholder"><i class="fas fa-feather"></i></div>`;

    title.textContent = product.name;
    price.textContent = `السعر اليومي: ${formatArabicPrice(product.price)} جنيه`;

    const message = `السلام عليكم، أريد الاستفسار عن المنتج: ${product.name} - السعر ${Number(product.price).toFixed(2)} جنيه`;

    whatsapp.href = `https://api.whatsapp.com/send?phone=${WHATSAPP_NUMBER}&text=${encodeURIComponent(message)}`;

    // wire quantity input inside modal to add/update order row
    const modalQty = document.getElementById('product-modal-qty');
    if (modalQty) {
        modalQty.value = '';
        const handler = () => {
            const q = toEnglishDigits(modalQty.value.trim());
            if (q && Number(q) > 0) {
                addOrUpdateOrderItem(product.name, q);
            }
        };

        modalQty.removeEventListener('input', modalQty._handler || handler);
        modalQty._handler = handler;
        modalQty.addEventListener('input', handler);
    }

    modal.classList.add('show');
    modal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('modal-open');
}

function closeProductDetails() {
    const modal = document.getElementById('product-modal');
    if (!modal) return;

    modal.classList.remove('show');
    modal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('modal-open');
}

function addProductToOrderFromModal() {
    if (!currentModalProduct) return;

    const modalQtyEl = document.getElementById('product-modal-qty');
    const qty = modalQtyEl ? toEnglishDigits((modalQtyEl.value || '').trim()) : '';

    if (qty && Number(qty) > 0) {
        addOrUpdateOrderItem(currentModalProduct.name, qty);
    } else {
        addOrUpdateOrderItem(currentModalProduct.name, '');
    }

    closeProductDetails();

    document.getElementById('order-section')?.scrollIntoView({ behavior: 'smooth' });
    showToast('تم إضافة المنتج للطلب، اضبط الكمية ثم أرسل الطلب');
}

function addOrUpdateOrderItem(productName, quantity) {
    const container = document.getElementById('dynamic-items-container');
    if (!container || !productName) return;

    // Try to find existing row for this product
    const existing = Array.from(container.querySelectorAll('.order-item-row')).find(row => {
        const s = row.querySelector('.product-select');
        return s && s.value === productName;
    });

    if (existing) {
        const qtyEl = existing.querySelector('.product-qty');
        if (qtyEl) qtyEl.value = quantity || qtyEl.value;
        attachOrderRowListeners(existing);
        updateOrderSummary();
        return;
    }

    // Create a new row (like initDynamicItems does)
    const row = document.createElement('div');
    row.className = 'order-item-row';

    const selectTemplate = container.querySelector('.product-select');
    const select = selectTemplate ? selectTemplate.cloneNode(true) : document.createElement('select');
    select.className = 'product-select';
    select.required = true;

    const qty = document.createElement('input');
    qty.type = 'text';
    qty.className = 'product-qty';
    qty.inputMode = 'numeric';
    qty.placeholder = 'الكمية';
    qty.required = true;
    if (quantity) qty.value = quantity;

    const removeBtn = document.createElement('button');
    removeBtn.type = 'button';
    removeBtn.className = 'remove-item-btn';
    removeBtn.innerHTML = '✕';
    removeBtn.title = 'حذف';
    removeBtn.setAttribute('aria-label', 'حذف هذا المنتج');

    removeBtn.addEventListener('click', () => {
        row.style.animation = 'slideOut 0.3s ease-in forwards';
        setTimeout(() => {
            row.remove();
            updateOrderSummary();
        }, 300);
    });

    row.appendChild(select);
    row.appendChild(qty);
    row.appendChild(removeBtn);

    container.appendChild(row);
    updateProductDropdown(window.latestProductsData);
    select.value = productName;

    attachOrderRowListeners(row);
    row.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    updateOrderSummary();
}

function attachOrderRowListeners(row) {
    if (!row) return;
    const select = row.querySelector('.product-select');
    const qty = row.querySelector('.product-qty');

    if (select && !select._hasListener) {
        select.addEventListener('change', () => updateOrderSummary());
        select._hasListener = true;
    }

    if (qty && !qty._hasListener) {
        qty.addEventListener('input', () => {
            updateOrderSummary();
        });
        qty._hasListener = true;
    }
}

function updateOrderSummary() {
    const container = document.getElementById('dynamic-items-container');
    const summaryBox = document.getElementById('order-summary');
    const linesEl = document.getElementById('order-summary-lines');
    const totalEl = document.getElementById('order-summary-total');

    if (!container || !summaryBox || !linesEl || !totalEl) return;

    const rows = Array.from(container.querySelectorAll('.order-item-row'));
    let total = 0;
    const lines = [];

    rows.forEach((row, idx) => {
        const select = row.querySelector('.product-select');
        const qtyEl = row.querySelector('.product-qty');
        const name = select ? select.value : '';
        const qty = qtyEl ? Number(toEnglishDigits((qtyEl.value || '').trim())) || 0 : 0;
        const product = (window.latestProductsData || []).find(p => p.name === name) || {};
        const unit = Number(product.price || 0);
        const lineTotal = unit * qty;

        if (name && qty > 0) {
            lines.push(`${idx + 1}) ${name} — ${qty} × ${formatArabicPrice(unit)} = ${formatArabicPrice(lineTotal)} جنيه`);
            total += lineTotal;
        }
    });

    if (!lines.length) {
        summaryBox.style.display = 'none';
        linesEl.innerHTML = '';
        totalEl.textContent = '';
        return;
    }

    summaryBox.style.display = '';
    linesEl.innerHTML = lines.map(l => `<div>${escHtml(l)}</div>`).join('');
    totalEl.textContent = `الإجمالي الكلي: ${formatArabicPrice(total)} جنيه`;
}

async function initPushNotifications() {
    const box = document.getElementById('notification-permission-box');
    const enableBtn = document.getElementById('enable-notifications-btn');
    const dismissBtn = document.getElementById('dismiss-notifications-btn');

    if (!box || !enableBtn || !dismissBtn) return;
    if (!('Notification' in window) || !('serviceWorker' in navigator)) return;
    if (!CloudStorage.isReady() || !firebaseMessaging) return;
    if (!FIREBASE_VAPID_KEY || FIREBASE_VAPID_KEY.includes('ضع_هنا')) return;

    const dismissed = localStorage.getItem('aboBashaNotificationsDismissed') === 'true';

    if (Notification.permission === 'default' && !dismissed) {
        box.hidden = false;
    }

    dismissBtn.addEventListener('click', () => {
        localStorage.setItem('aboBashaNotificationsDismissed', 'true');
        box.hidden = true;
    });

    enableBtn.addEventListener('click', async () => {
        try {
            const permission = await Notification.requestPermission();

            if (permission !== 'granted') {
                showToast('لم يتم تفعيل الإشعارات');
                box.hidden = true;
                return;
            }

            const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');

            const token = await firebaseMessaging.getToken({
                vapidKey: FIREBASE_VAPID_KEY,
                serviceWorkerRegistration: registration
            });

            if (token) {
                await CloudStorage.saveNotificationToken(token);
                localStorage.setItem('aboBashaNotificationsEnabled', 'true');
                box.hidden = true;
                showToast('تم تفعيل إشعارات الأسعار بنجاح');
            }
        } catch (error) {
            console.error('Push notification setup failed:', error);
            showToast('تعذر تفعيل الإشعارات حالياً');
        }
    });
}

function initPriceUpdateNotice() {
    if (!CloudStorage.isReady() || typeof CloudStorage.listenPriceUpdateNotice !== 'function') {
        return;
    }

    CloudStorage.listenPriceUpdateNotice(notice => {
        if (!notice || !notice.updatedAt) return;

        const noticeTime = Number(notice.updatedAt);

        if (noticeTime <= lastSeenPriceNotice) return;

        lastSeenPriceNotice = noticeTime;
        localStorage.setItem('aboBashaLastPriceNotice', String(noticeTime));

        showPriceUpdateNotice(
            `${notice.title || 'تم تحديث الأسعار'} — ${notice.message || 'انقر للاطلاع على أحدث الأسعار'}`,
            '#prices'
        );
    });
}

function showPriceUpdateNotice(message, target) {
    const oldNotice = document.querySelector('.price-update-notice');
    if (oldNotice) oldNotice.remove();

    const notice = document.createElement('button');
    notice.type = 'button';
    notice.className = 'price-update-notice';
    notice.innerHTML = `
        <span class="notice-icon">🔔</span>
        <span>${escHtml(message)}</span>
    `;

    notice.addEventListener('click', () => {
        document.querySelector(target)?.scrollIntoView({ behavior: 'smooth' });
        notice.remove();
    });

    document.body.appendChild(notice);

    requestAnimationFrame(() => {
        notice.classList.add('show');
    });

    setTimeout(() => {
        notice.classList.remove('show');
        setTimeout(() => notice.remove(), 350);
    }, 9000);
}

function showToast(message) {
    const oldToast = document.querySelector('.toast-notification');
    if (oldToast) oldToast.remove();

    const toast = document.createElement('div');
    toast.className = 'toast-notification';
    toast.textContent = message;

    document.body.appendChild(toast);

    requestAnimationFrame(() => {
        toast.classList.add('show');
    });

    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 400);
    }, 3000);
}

const dynamicStyle = document.createElement('style');
dynamicStyle.textContent = `
@keyframes slideOut {
    to {
        opacity: 0;
        transform: translateX(-20px);
        height: 0;
        margin: 0;
        padding: 0;
        overflow: hidden;
    }
}
`;
document.head.appendChild(dynamicStyle);

function escHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

function escAttr(str) {
    return String(str).replace(/["']/g, (c) => `&#${c.charCodeAt(0)};`);
}
