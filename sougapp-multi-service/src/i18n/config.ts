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
      "logout": "Déconnexion",
      "language": "Langue",
      "welcome": "Bienvenue sur SougApp"
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
      "logout": "Logout",
      "language": "Language",
      "welcome": "Welcome to SougApp"
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
      "logout": "تسجيل الخروج",
      "language": "اللغة",
      "welcome": "مرحبًا بكم في سوق آب"
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
