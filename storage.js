const STORAGE_KEYS = {
    products: 'aboBashaProducts_v3',
    categories: 'aboBashaCategories_v3',
    media: 'aboBashaMedia_v3',
    customers: 'aboBashaCustomers_v3'
};

const Storage = {
    get(key, fallback) {
        try {
            const raw = localStorage.getItem(key);
            if (!raw) return cloneData(fallback);

            const parsed = JSON.parse(raw);

            if (Array.isArray(parsed) && parsed.length === 0) return cloneData(fallback);

            if (
                parsed &&
                typeof parsed === 'object' &&
                !Array.isArray(parsed) &&
                Object.keys(parsed).length === 0
            ) {
                return cloneData(fallback);
            }

            return parsed;
        } catch {
            return cloneData(fallback);
        }
    },

    set(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (e) {
            console.error('Storage.set failed:', e);
            return false;
        }
    },

    getProducts() {
        return this.get(STORAGE_KEYS.products, initialProductsData).map(product => ({
            ...product,
            previousPrice: product.previousPrice ?? product.price,
            categoryId: product.categoryId || guessCategoryId(product.name)
        }));
    },

    setProducts(value) {
        return this.set(STORAGE_KEYS.products, value);
    },

    getCategories() {
        return this.get(STORAGE_KEYS.categories, initialCategoriesData);
    },

    setCategories(value) {
        return this.set(STORAGE_KEYS.categories, value);
    },

    getMedia() {
        return this.get(STORAGE_KEYS.media, initialMediaData);
    },

    setMedia(value) {
        return this.set(STORAGE_KEYS.media, value);
    },

    getCustomers() {
        return this.get(STORAGE_KEYS.customers, initialCustomersData);
    },

    setCustomers(value) {
        return this.set(STORAGE_KEYS.customers, value);
    },

    resetAll() {
        Object.values(STORAGE_KEYS).forEach(key => localStorage.removeItem(key));
    }
};

function cloneData(value) {
    return JSON.parse(JSON.stringify(value));
}

function guessCategoryId(name) {
    const text = String(name || '');

    if (text.includes('بط')) return 'c2';
    if (text.includes('رومي')) return 'c3';
    if (text.includes('وز')) return 'c4';
    if (text.includes('سمان')) return 'c5';
    if (text.includes('علف') || text.includes('أعلاف')) return 'c6';
    if (text.includes('دواء') || text.includes('أدوية') || text.includes('بيطري')) return 'c7';
    if (text.includes('مستلزمات') || text.includes('أرنب') || text.includes('حمام')) return 'c8';

    return 'c1';
}

/* ===== دعم كتابة الأرقام عربي أو إنجليزي ===== */
function normalizeArabicDigits(value) {
    return String(value ?? '')
        .replace(/[٠-٩]/g, digit => String('٠١٢٣٤٥٦٧٨٩'.indexOf(digit)))
        .replace(/[۰-۹]/g, digit => String('۰۱۲۳۴۵۶۷۸۹'.indexOf(digit)));
}

function toEnglishDigits(value) {
    return normalizeArabicDigits(value);
}

function toArabicDigits(value) {
    return String(value ?? '').replace(/\d/g, digit => '٠١٢٣٤٥٦٧٨٩'[digit]);
}

function formatOrderIndex(index) {
    const icons = ['0️⃣', '1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣'];
    const value = String(index);

    if (value.length === 1 && icons[Number(value)]) {
        return icons[Number(value)];
    }

    return toArabicDigits(value);
}

function formatArabicPrice(value) {
    const number = Number(toEnglishDigits(value)) || 0;
    return toArabicDigits(number.toFixed(2));
}

function formatPhoneDisplay(num) {
    const english = toEnglishDigits(num);
    const phone = String(english).replace(/^\+?20/, '0');

    return phone.length === 11
        ? `${phone.slice(0, 3)} ${phone.slice(3, 7)} ${phone.slice(7)}`
        : phone;
}

/* محفوظة للتوافق فقط — لا يتم عرض أسهم الأسعار */
function calcPriceChange(product) {
    const cur = Number(product.price) || 0;
    const prev = Number(product.previousPrice ?? cur) || cur;
    const diff = cur - prev;

    if (Math.abs(diff) < 0.01) {
        return { status: 'same', change: '0.00', diff: 0 };
    }

    return {
        status: diff > 0 ? 'up' : 'down',
        change: Math.abs(diff).toFixed(2),
        diff
    };
}

function formatPriceIndicator() {
    return '';
}

function escHtml(value) {
    return String(value ?? '').replace(/[&<>"']/g, char => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
    }[char]));
}

function escAttr(value) {
    return String(value ?? '')
        .replace(/&/g, '&amp;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;')
        .replace(/</g, '&lt;');
}

function safeImageSrc(src) {
    if (!src || typeof src !== 'string') return '';

    const value = src.trim();

    if (
        value.startsWith('data:image/') ||
        value.startsWith('https://') ||
        value.startsWith('http://') ||
        value.startsWith('assets/') ||
        value.startsWith('./')
    ) {
        return value;
    }

    return '';
}

const ImageUtils = {
    async fileToBase64(file, options = {}) {
        const { maxWidth = 1600, maxSizeKB = 400, quality = 0.85 } = options;

        return new Promise((resolve, reject) => {
            const reader = new FileReader();

            reader.onerror = () => reject(new Error('فشل قراءة الملف'));

            reader.onload = event => {
                const img = new Image();

                img.onerror = () => reject(new Error('ملف الصورة غير صالح'));

                img.onload = () => {
                    let { width, height } = img;

                    if (width > maxWidth) {
                        height = Math.round(height * (maxWidth / width));
                        width = maxWidth;
                    }

                    const canvas = document.createElement('canvas');
                    canvas.width = width;
                    canvas.height = height;

                    canvas.getContext('2d').drawImage(img, 0, 0, width, height);

                    const useJpeg = !(file.type === 'image/png' || file.type === 'image/webp' || file.type === 'image/gif');
                    const mime = useJpeg ? 'image/jpeg' : 'image/png';

                    let dataUrl = canvas.toDataURL(mime, quality);
                    let currentQuality = quality;

                    while (Math.round((dataUrl.length * 3 / 4) / 1024) > maxSizeKB && currentQuality > 0.4) {
                        currentQuality -= 0.1;
                        dataUrl = canvas.toDataURL('image/jpeg', currentQuality);
                    }

                    resolve(dataUrl);
                };

                img.src = event.target.result;
            };

            reader.readAsDataURL(file);
        });
    }
};
