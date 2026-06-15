// ==================== ثوابت عامة ====================
const WHATSAPP_NUMBER = '201070780092';
const PHONE_NUMBERS = ['201001887670', '201062720723', '201211635266'];
const BUSINESS_ADDRESS = 'الشرقية - فاقوس - الديدامون';

// ==================== البيانات الافتراضية ====================
const initialProductsData = [
    { id: "1", name: "كتكوت تسمين شركات", categoryId: "c1", price: 30.00, previousPrice: 31.00, image: "" },
    { id: "2", name: "كتكوت ساسو شيفر", categoryId: "c1", price: 28.00, previousPrice: 29.00, image: "" },
    { id: "3", name: "كتكوت بلدي مشعر", categoryId: "c1", price: 5.50, previousPrice: 6.00, image: "" },
    { id: "4", name: "بط مولار", categoryId: "c2", price: 22.00, previousPrice: 21.00, image: "" },
    { id: "5", name: "بط مسكوفي", categoryId: "c2", price: 35.00, previousPrice: 33.00, image: "" },
    { id: "6", name: "كتكوت رومي أبيض", categoryId: "c3", price: 45.00, previousPrice: 42.50, image: "" },
    { id: "7", name: "كتكوت وز أبيض", categoryId: "c4", price: 55.00, previousPrice: 56.50, image: "" },
    { id: "8", name: "علف تسمين (25 كجم)", categoryId: "c6", price: 180.00, previousPrice: 175.00, image: "" },
    { id: "9", name: "علف بياض (25 كجم)", categoryId: "c6", price: 165.00, previousPrice: 160.00, image: "" },
    { id: "10", name: "فيتامينات A+D+E", categoryId: "c7", price: 25.00, previousPrice: 24.00, image: "" }
];

const initialCategoriesData = [
    { id: "c1", name: "الكتاكيت", icon: "🐤" },
    { id: "c2", name: "البط", icon: "🦆" },
    { id: "c3", name: "الرومي", icon: "🦃" },
    { id: "c4", name: "الوز", icon: "🦢" },
    { id: "c5", name: "السمان", icon: "🐦" },
    { id: "c6", name: "الأعلاف", icon: "🌾" },
    { id: "c7", name: "الأدوية البيطرية", icon: "💊" },
    { id: "c8", name: "مستلزمات المزارع", icon: "🏗️" }
];

const initialVideosData = [
    { id: "vid_1", title: "كيفية تربية الكتاكيت", description: "شرح مفصل لتربية الكتاكيت من البداية", videoUrl: "" },
    { id: "vid_2", title: "أمراض الدواجن الشائعة", description: "تعرف على أمراض الدواجن والوقاية منها", videoUrl: "" }
];

const initialCustomersData = {};

// ==================== دوال مساعدة ====================
function toArabicDigits(num) {
    const arabicNumbers = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
    return String(num).replace(/\d/g, d => arabicNumbers[d]);
}

function getCategoryName(categoryId) {
    const category = initialCategoriesData.find(c => c.id === categoryId);
    return category ? category.name : 'غير محدد';
}

function getCategoryIcon(categoryId) {
    const category = initialCategoriesData.find(c => c.id === categoryId);
    return category ? category.icon : '📦';
}

function calculatePriceDifference(currentPrice, previousPrice) {
    const difference = currentPrice - previousPrice;
    const percentage = ((difference / previousPrice) * 100).toFixed(2);
    return {
        difference: difference.toFixed(2),
        percentage: percentage,
        isIncrease: difference > 0,
        isDecrease: difference < 0,
        isUnchanged: difference === 0
    };
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

function getDeviceId() {
    let deviceId = localStorage.getItem('aboBashaDeviceId');
    if (!deviceId) {
        deviceId = 'device_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        localStorage.setItem('aboBashaDeviceId', deviceId);
    }
    return deviceId;
}

function generateCustomerId() {
    return 'customer_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5);
}

console.log('✅ تم تحميل data.js');
