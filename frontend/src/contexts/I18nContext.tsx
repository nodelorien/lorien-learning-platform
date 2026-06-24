'use client';

import { createContext, useContext, useState, ReactNode } from 'react';
import { Language } from '@/lib/i18n';

interface I18nContextType {
  lang: Language;
  setLang: (lang: Language) => void;
}

const I18nContext = createContext<I18nContextType>({
  lang: 'es',
  setLang: () => {},
});

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Language>('es');
  return <I18nContext value={{ lang, setLang }}>{children}</I18nContext>;
}

export function useI18n() {
  return useContext(I18nContext);
}
