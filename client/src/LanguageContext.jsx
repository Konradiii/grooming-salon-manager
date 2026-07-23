import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { translations, translateApiError } from './translations.js';

const LanguageContext = createContext(null);

function getInitialLanguage() {
  const stored = typeof localStorage !== 'undefined' ? localStorage.getItem('language') : null;
  return stored === 'pl' || stored === 'en' ? stored : 'en';
}

export function LanguageProvider({ children }) {
  const [language, setLanguageState] = useState(getInitialLanguage);

  const setLanguage = useCallback((lang) => {
    setLanguageState(lang);
    localStorage.setItem('language', lang);
  }, []);

  const t = useCallback(
    (key, ...args) => {
      const entry = translations[language]?.[key] ?? translations.en[key] ?? key;
      return typeof entry === 'function' ? entry(...args) : entry;
    },
    [language]
  );

  const tError = useCallback((message) => translateApiError(message, language), [language]);

  const value = useMemo(
    () => ({ language, setLanguage, t, tError }),
    [language, setLanguage, t, tError]
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used within a LanguageProvider');
  return ctx;
}
