'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import { type SupportedLanguage } from '@/lib/api/config';
import { locales, defaultLocale, localeNames, type Locale } from '@/i18n/config';

const UI_STORAGE_KEY = 'resume_matcher_ui_language';

interface LanguageContextValue {
  contentLanguage: SupportedLanguage;
  uiLanguage: Locale;
  isLoading: boolean;
  setUiLanguage: (lang: Locale) => void;
  languageNames: typeof localeNames;
  supportedLanguages: readonly Locale[];
}

const LanguageContext = createContext<LanguageContextValue | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [contentLanguage] = useState<SupportedLanguage>(defaultLocale);
  const [uiLanguage, setUiLanguageState] = useState<Locale>(defaultLocale);
  const [isLoading] = useState(false);

  const setUiLanguage = useCallback((lang: Locale) => {
    if (!locales.includes(lang)) {
      console.error(`Unsupported UI language: ${lang}`);
      return;
    }
    setUiLanguageState(lang);
    localStorage.setItem(UI_STORAGE_KEY, lang);
  }, []);

  return (
    <LanguageContext.Provider
      value={{
        contentLanguage,
        uiLanguage,
        isLoading,
        setUiLanguage,
        languageNames: localeNames,
        supportedLanguages: locales,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
