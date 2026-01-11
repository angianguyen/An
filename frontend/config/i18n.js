/**
 * i18n Configuration for React App
 * Supports Vietnamese (vi) and English (en)
 * Uses localStorage to persist language preference
 */

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import translation files
import translationEN from '../locales/en.json';
import translationVI from '../locales/vi.json';

// Translation resources
const resources = {
  en: {
    translation: translationEN
  },
  vi: {
    translation: translationVI
  }
};

// Initialize i18next
i18n
  // Detect user language
  .use(LanguageDetector)
  // Pass the i18n instance to react-i18next
  .use(initReactI18next)
  // Init i18next
  .init({
    resources,
    fallbackLng: 'vi', // Default to Vietnamese
    lng: typeof window !== 'undefined' ? localStorage.getItem('language') || 'vi' : 'vi',
    debug: process.env.NODE_ENV === 'development',
    
    // Detection options
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
      lookupLocalStorage: 'language'
    },
    
    interpolation: {
      escapeValue: false // React already does escaping
    },
    
    // Namespace configuration
    ns: ['translation'],
    defaultNS: 'translation',
    
    react: {
      useSuspense: false // Disable suspense for Next.js compatibility
    }
  });

// Save language to localStorage when changed
i18n.on('languageChanged', (lng) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('language', lng);
    document.documentElement.lang = lng;
  }
});

export default i18n;
