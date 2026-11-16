import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { translations, DEFAULT_LANGUAGE, SUPPORTED_LANGUAGES } from '../i18n/translations';

const STORAGE_KEY = 'agencyflow_lang';
const LanguageContext = createContext(null);

function getStoredLanguage() {
  const stored = localStorage.getItem(STORAGE_KEY);
  return translations[stored] ? stored : DEFAULT_LANGUAGE;
}

// Resolves a dotted key like "clients.statusLabel.ACTIVE" against the active language.
function resolve(dict, key) {
  return key.split('.').reduce((acc, part) => (acc == null ? acc : acc[part]), dict);
}

export function LanguageProvider({ children }) {
  const [language, setLanguageState] = useState(getStoredLanguage);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, language);
    document.documentElement.lang = language;
  }, [language]);

  const setLanguage = useCallback((lang) => {
    if (translations[lang]) setLanguageState(lang);
  }, []);

  const t = useCallback(
    (key, fallback) => {
      const value = resolve(translations[language], key);
      return value === undefined ? fallback ?? key : value;
    },
    [language]
  );

  const value = useMemo(
    () => ({ language, setLanguage, t, languages: SUPPORTED_LANGUAGES }),
    [language, setLanguage, t]
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used within a LanguageProvider');
  return ctx;
}
