"use client";

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

import { defaultLocale, t, type CopyKey, type Locale } from "@/lib/i18n";

type LanguageContextValue = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  text: (key: CopyKey) => string;
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(defaultLocale);

  useEffect(() => {
    const savedLocale = window.localStorage.getItem("victus-locale");
    if (savedLocale === "en" || savedLocale === "ta") {
      setLocaleState(savedLocale);
    }
  }, []);

  const value = useMemo<LanguageContextValue>(() => {
    return {
      locale,
      setLocale(nextLocale) {
        window.localStorage.setItem("victus-locale", nextLocale);
        setLocaleState(nextLocale);
      },
      text(key) {
        return t(key, locale);
      },
    };
  }, [locale]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage(): LanguageContextValue {
  const value = useContext(LanguageContext);
  if (!value) {
    throw new Error("useLanguage must be used inside LanguageProvider.");
  }
  return value;
}
