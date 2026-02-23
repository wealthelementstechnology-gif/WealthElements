import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import en from './locales/en/translation.json';
import hi from './locales/hi/translation.json';
import bn from './locales/bn/translation.json';
import te from './locales/te/translation.json';
import mr from './locales/mr/translation.json';
import ta from './locales/ta/translation.json';
import gu from './locales/gu/translation.json';
import kn from './locales/kn/translation.json';
import ml from './locales/ml/translation.json';

// Font families for each language script
const LANG_FONTS = {
  hi: "'Noto Sans Devanagari', sans-serif",
  mr: "'Noto Sans Devanagari', sans-serif",
  bn: "'Noto Sans Bengali', sans-serif",
  te: "'Noto Sans Telugu', sans-serif",
  ta: "'Noto Sans Tamil', sans-serif",
  gu: "'Noto Sans Gujarati', sans-serif",
  kn: "'Noto Sans Kannada', sans-serif",
  ml: "'Noto Sans Malayalam', sans-serif",
  en: "inherit",
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      hi: { translation: hi },
      bn: { translation: bn },
      te: { translation: te },
      mr: { translation: mr },
      ta: { translation: ta },
      gu: { translation: gu },
      kn: { translation: kn },
      ml: { translation: ml },
    },
    fallbackLng: 'en',
    lng: localStorage.getItem('i18nextLng') || 'en',
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
    },
  });

// Switch font when language changes
const applyFont = (lng) => {
  const baseLang = lng.split('-')[0];
  document.body.style.fontFamily = LANG_FONTS[baseLang] || 'inherit';
};

i18n.on('languageChanged', applyFont);
applyFont(i18n.language);

export default i18n;
