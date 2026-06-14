const WHATSAPP_NUMBER = '201070780092';

const PHONE_NUMBERS = [
    '201001887670',
    '201062720723',
    '201211635266'
];

const FACEBOOK_URL = 'https://www.facebook.com/share/1BYEPYH9uA/?mibextid=wwXIfr';
const INSTAGRAM_URL = '#';

const BUSINESS_ADDRESS = 'الشرقية - فاقوس - الديدامون - الطريق الزراعي بجوار صيدلية أبو باشا';
const GOOGLE_MAPS_URL = 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(BUSINESS_ADDRESS);

// previousPrice محفوظ للتوافق مع البيانات القديمة فقط، ولا يتم عرض أسهم الأسعار
const initialProductsData = [
    { id: "1",  name: "كتكوت تسمين شركات",          categoryId: "c1", price: 30.00, previousPrice: 31.00, image: "" },
    { id: "2",  name: "كتكوت ساسو شيفر",             categoryId: "c1", price: 28.00, previousPrice: 29.00, image: "" },
    { id: "3",  name: "كتكوت بلدي مشعر",              categoryId: "c1", price: 5.50,  previousPrice: 6.00,  image: "" },
    { id: "4",  name: "كتكوت روزي برابر",             categoryId: "c1", price: 7.00,  previousPrice: 7.50,  image: "" },
    { id: "5",  name: "كتكوت روزي ديوك",              categoryId: "c1", price: 15.00, previousPrice: 13.00, image: "" },
    { id: "6",  name: "كتكوت هجين عالي (جيل تاني)",  categoryId: "c1", price: 8.50,  previousPrice: 9.00,  image: "" },
    { id: "7",  name: "بط مولار",                     categoryId: "c2", price: 22.00, previousPrice: 21.00, image: "" },
    { id: "8",  name: "بط مسكوفي",                    categoryId: "c2", price: 35.00, previousPrice: 33.00, image: "" },
    { id: "9",  name: "بط سوداني",                    categoryId: "c2", price: 28.00, previousPrice: 29.00, image: "" },
    { id: "10", name: "كتكوت رومي أبيض",              categoryId: "c3", price: 45.00, previousPrice: 42.50, image: "" },
    { id: "11", name: "كتكوت رومي برونزي",            categoryId: "c3", price: 50.00, previousPrice: 47.00, image: "" },
    { id: "12", name: "كتكوت وز أبيض",                categoryId: "c4", price: 55.00, previousPrice: 56.50, image: "" },
    { id: "13", name: "كتكوت وز رمادي",               categoryId: "c4", price: 60.00, previousPrice: 58.00, image: "" },
    { id: "14", name: "كتكوت سمان",                   categoryId: "c5", price: 4.50,  previousPrice: 4.75,  image: "" },
    { id: "15", name: "بيض سمان (للتفقيس)",           categoryId: "c5", price: 2.00,  previousPrice: 1.90,  image: "" },
    { id: "16", name: "أرنب نيوزيلندي",               categoryId: "c8", price: 80.00, previousPrice: 75.00, image: "" },
    { id: "17", name: "حمام كنج",                     categoryId: "c8", price: 65.00, previousPrice: 62.00, image: "" }
];

const initialCategoriesData = [
    { id: "c1", name: "الكتاكيت",         icon: "fa-kiwi-bird",                   image: "" },
    { id: "c2", name: "البط",             icon: "fa-feather",                     image: "" },
    { id: "c3", name: "الرومي",           icon: "fa-drumstick-bite",              image: "" },
    { id: "c4", name: "الوز",             icon: "fa-feather-pointed",             image: "" },
    { id: "c5", name: "السمان",           icon: "fa-egg",                         image: "" },
    { id: "c6", name: "الأعلاف",          icon: "fa-wheat-awn",                   image: "" },
    { id: "c7", name: "الأدوية البيطرية", icon: "fa-prescription-bottle-medical", image: "" },
    { id: "c8", name: "مستلزمات المزارع", icon: "fa-gear",                        image: "" }
];

const initialMediaData = {
    navLogo: "",
    heroImage: "",
    footerLogo: ""
};

const initialCustomersData = {
    'VIP001': { name: 'مزرعة الأمل - أبو حماد',  address: 'الشرقية - أبو حماد - كفر صقر', phone: '' },
    'VIP002': { name: 'مزرعة النور - فاقوس',     address: 'الشرقية - فاقوس - الحسينية',   phone: '' },
    'VIP003': { name: 'مزرعة البركة - الزقازيق', address: 'الشرقية - الزقازيق - بلبيس',   phone: '' }
};
