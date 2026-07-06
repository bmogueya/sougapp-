import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  fr: {
    translation: {
      "dashboard": "Tableau de bord",
      "users": "Utilisateurs",
      "merchants": "Marchands",
      "zones": "Zones",
      "settings": "Paramètres",
      "orders": "Commandes",
      "drivers": "Livreurs",
      "finance": "Finances",
      "promotions_nav": "Promotions",
      "dispatch": "Dispatch",
      "modules_nav": "Modules",
      "logout": "Déconnexion",
      "language": "Langue",
      "welcome": "Bienvenue sur SougApp",
      "analytics": {
        "paymentMethods": "Paiements",
        "cities": "Villes",
        "modules": "Modules",
        "ordersCount": "commandes"
      },
      "console": {
        "city": "Nouakchott",
        "liveMarket": "Marché en direct",
        "subtitle": "Neuf services, un seul souk — en temps réel"
      },
      "kpi": {
        "gmv": "Volume d'affaires",
        "orders": "Commandes",
        "activeDrivers": "Livreurs actifs",
        "newUsers": "Nouveaux clients",
        "today": "aujourd'hui"
      },
      "board": {
        "title": "Le souk en direct",
        "caption": "Neuf services, classés par activité du jour",
        "rank": "Rang",
        "service": "Service",
        "ordersCol": "Commandes",
        "revenueCol": "Revenus",
        "trend": "Tendance",
        "live": "en direct",
        "paused": "en pause",
        "unitOrders": "cmd"
      },
      "revenue": {
        "title": "Revenus — 14 jours",
        "caption": "MRU (milliers) · commandes",
        "revenue": "Revenus",
        "ordersLine": "Commandes"
      },
      "flux": {
        "title": "Flux en direct",
        "caption": "Dernières commandes du souk",
        "minsAgo": "il y a {{count}} min",
        "viewAll": "Voir toutes les commandes"
      },
      "modules": {
        "food": "Restauration",
        "grocery": "Épicerie",
        "marketplace": "Marketplace",
        "pharmacy": "Pharmacie",
        "parcel": "Colis",
        "taxi": "Taxi",
        "wallet": "Portefeuille",
        "billing": "Factures",
        "booking": "Réservations"
      },
      "status": {
        "delivered": "Livrée",
        "onTheWay": "En route",
        "preparing": "En préparation",
        "pending": "En attente",
        "cancelled": "Annulée"
      }
    }
  },
  en: {
    translation: {
      "dashboard": "Dashboard",
      "users": "Users",
      "merchants": "Merchants",
      "zones": "Zones",
      "settings": "Settings",
      "orders": "Orders",
      "drivers": "Drivers",
      "finance": "Finance",
      "promotions_nav": "Promotions",
      "dispatch": "Dispatch",
      "modules_nav": "Modules",
      "logout": "Logout",
      "language": "Language",
      "welcome": "Welcome to SougApp",
      "analytics": {
        "paymentMethods": "Payments",
        "cities": "Cities",
        "modules": "Modules",
        "ordersCount": "orders"
      },
      "console": {
        "city": "Nouakchott",
        "liveMarket": "Market live",
        "subtitle": "Nine services, one souk — in real time"
      },
      "kpi": {
        "gmv": "Gross volume",
        "orders": "Orders",
        "activeDrivers": "Active drivers",
        "newUsers": "New customers",
        "today": "today"
      },
      "board": {
        "title": "The souk, live",
        "caption": "Nine services, ranked by today's activity",
        "rank": "Rank",
        "service": "Service",
        "ordersCol": "Orders",
        "revenueCol": "Revenue",
        "trend": "Trend",
        "live": "live",
        "paused": "paused",
        "unitOrders": "ord"
      },
      "revenue": {
        "title": "Revenue — 14 days",
        "caption": "MRU (thousands) · orders",
        "revenue": "Revenue",
        "ordersLine": "Orders"
      },
      "flux": {
        "title": "Live feed",
        "caption": "Latest orders across the souk",
        "minsAgo": "{{count}} min ago",
        "viewAll": "View all orders"
      },
      "modules": {
        "food": "Food",
        "grocery": "Grocery",
        "marketplace": "Marketplace",
        "pharmacy": "Pharmacy",
        "parcel": "Parcel",
        "taxi": "Taxi",
        "wallet": "Wallet",
        "billing": "Billing",
        "booking": "Booking"
      },
      "status": {
        "delivered": "Delivered",
        "onTheWay": "On the way",
        "preparing": "Preparing",
        "pending": "Pending",
        "cancelled": "Cancelled"
      }
    }
  },
  ar: {
    translation: {
      "dashboard": "لوحة القيادة",
      "users": "المستخدمين",
      "merchants": "التجار",
      "zones": "المناطق",
      "settings": "الإعدادات",
      "orders": "الطلبات",
      "drivers": "السائقون",
      "finance": "المالية",
      "promotions_nav": "العروض",
      "dispatch": "المرسل",
      "modules_nav": "الوحدات",
      "logout": "تسجيل الخروج",
      "language": "اللغة",
      "welcome": "مرحبًا بكم في سوق آب",
      "analytics": {
        "paymentMethods": "طرق الدفع",
        "cities": "المدن",
        "modules": "الوحدات",
        "ordersCount": "طلب"
      },
      "console": {
        "city": "نواكشوط",
        "liveMarket": "السوق مباشر",
        "subtitle": "تسع خدمات، سوق واحد — في الوقت الحقيقي"
      },
      "kpi": {
        "gmv": "إجمالي المبيعات",
        "orders": "الطلبات",
        "activeDrivers": "السائقون النشطون",
        "newUsers": "عملاء جدد",
        "today": "اليوم"
      },
      "board": {
        "title": "السوق مباشر",
        "caption": "تسع خدمات، مرتبة حسب نشاط اليوم",
        "rank": "الترتيب",
        "service": "الخدمة",
        "ordersCol": "الطلبات",
        "revenueCol": "الإيرادات",
        "trend": "الاتجاه",
        "live": "مباشر",
        "paused": "متوقف",
        "unitOrders": "طلب"
      },
      "revenue": {
        "title": "الإيرادات — ١٤ يومًا",
        "caption": "أوقية (بالآلاف) · الطلبات",
        "revenue": "الإيرادات",
        "ordersLine": "الطلبات"
      },
      "flux": {
        "title": "البث المباشر",
        "caption": "أحدث طلبات السوق",
        "minsAgo": "قبل {{count}} دقيقة",
        "viewAll": "عرض كل الطلبات"
      },
      "modules": {
        "food": "المطاعم",
        "grocery": "البقالة",
        "marketplace": "المتجر",
        "pharmacy": "الصيدلية",
        "parcel": "الطرود",
        "taxi": "سيارات الأجرة",
        "wallet": "المحفظة",
        "billing": "الفواتير",
        "booking": "الحجوزات"
      },
      "status": {
        "delivered": "تم التوصيل",
        "onTheWay": "في الطريق",
        "preparing": "قيد التحضير",
        "pending": "قيد الانتظار",
        "cancelled": "ملغاة"
      }
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: "fr", // langue par défaut
    fallbackLng: "fr",
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;
