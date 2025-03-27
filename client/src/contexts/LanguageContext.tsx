import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import enTranslations from '../locale/en.json';
import zhTranslations from '../locale/zh.json';

// Define the supported languages
export type SupportedLanguage = 'en' | 'zh';

// Define the type for the language context
type LanguageContextType = {
  language: SupportedLanguage;
  setLanguage: (language: SupportedLanguage) => void;
  t: (key: string) => string; // translation function
};

// Create the initial context value
const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Translation dictionary with imported JSON files
const translations: Record<SupportedLanguage, Record<string, any>> = {
  en: enTranslations,
  zh: zhTranslations
};

// Provider component
export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Try to get saved language from localStorage, default to 'en'
  const [language, setLanguage] = useState<SupportedLanguage>(() => {
    const saved = localStorage.getItem('language') as SupportedLanguage;
    return saved && (saved === 'en' || saved === 'zh') ? saved : 'en';
  });

  // Save language preference to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('language', language);
  }, [language]);

  // Translation function that handles nested keys like "nav.home"
  const t = (key: string): string => {
    const keys = key.split('.');
    let result: any = translations[language];
    
    for (const k of keys) {
      if (result && typeof result === 'object' && k in result) {
        result = result[k];
      } else {
        return key; // Return the key if translation not found
      }
    }
    
    return typeof result === 'string' ? result : key;
  };

  const value = {
    language,
    setLanguage,
    t
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

// Custom hook to use the language context
export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};