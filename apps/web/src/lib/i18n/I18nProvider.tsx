'use client';

/**
 * I18n Context Provider for React
 * Provides translation and localization throughout the app
 */

import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { I18nService, Locale, LocaleConfig, LOCALE_CONFIGS, Direction } from './index';

interface I18nContextValue {
  locale: Locale;
  direction: Direction;
  config: LocaleConfig;
  setLocale: (locale: Locale) => void;
  t: (key: string, variables?: Record<string, string | number>) => string;
  formatNumber: (value: number, options?: Intl.NumberFormatOptions) => string;
  formatCurrency: (value: number, currency: string) => string;
  formatDate: (date: Date | string, options?: Intl.DateTimeFormatOptions) => string;
  formatHijriDate: (date: Date | string) => string;
  formatTime: (date: Date | string, options?: Intl.DateTimeFormatOptions) => string;
  formatRelativeTime: (date: Date | string) => string;
  isRTL: boolean;
}

const I18nContext = createContext<I18nContextValue | null>(null);

interface I18nProviderProps {
  children: ReactNode;
  defaultLocale?: Locale;
}

export function I18nProvider({ children, defaultLocale = 'en' }: I18nProviderProps) {
  const [locale, setLocaleState] = useState<Locale>(defaultLocale);
  const [i18nService] = useState(() => new I18nService(defaultLocale));

  const setLocale = useCallback((newLocale: Locale) => {
    setLocaleState(newLocale);
    i18nService.setLocale(newLocale);

    // Update document direction
    if (typeof document !== 'undefined') {
      document.documentElement.dir = LOCALE_CONFIGS[newLocale].direction;
      document.documentElement.lang = newLocale;
    }

    // Store preference
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('locale', newLocale);
    }
  }, [i18nService]);

  // Load saved locale on mount
  useEffect(() => {
    if (typeof localStorage !== 'undefined') {
      const savedLocale = localStorage.getItem('locale') as Locale | null;
      if (savedLocale && (savedLocale === 'en' || savedLocale === 'ar')) {
        setLocale(savedLocale);
      }
    }
  }, [setLocale]);

  // Update document direction on locale change
  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.dir = LOCALE_CONFIGS[locale].direction;
      document.documentElement.lang = locale;
    }
  }, [locale]);

  const contextValue: I18nContextValue = {
    locale,
    direction: LOCALE_CONFIGS[locale].direction,
    config: LOCALE_CONFIGS[locale],
    setLocale,
    t: useCallback((key: string, variables?: Record<string, string | number>) => {
      return i18nService.t(key, variables);
    }, [i18nService]),
    formatNumber: useCallback((value: number, options?: Intl.NumberFormatOptions) => {
      return i18nService.formatNumber(value, options);
    }, [i18nService]),
    formatCurrency: useCallback((value: number, currency: string) => {
      return i18nService.formatCurrency(value, currency);
    }, [i18nService]),
    formatDate: useCallback((date: Date | string, options?: Intl.DateTimeFormatOptions) => {
      return i18nService.formatDate(date, options);
    }, [i18nService]),
    formatHijriDate: useCallback((date: Date | string) => {
      return i18nService.formatHijriDate(date);
    }, [i18nService]),
    formatTime: useCallback((date: Date | string, options?: Intl.DateTimeFormatOptions) => {
      return i18nService.formatTime(date, options);
    }, [i18nService]),
    formatRelativeTime: useCallback((date: Date | string) => {
      return i18nService.formatRelativeTime(date);
    }, [i18nService]),
    isRTL: LOCALE_CONFIGS[locale].direction === 'rtl',
  };

  return (
    <I18nContext.Provider value={contextValue}>
      {children}
    </I18nContext.Provider>
  );
}

/**
 * Hook to use i18n in components
 */
export function useI18n(): I18nContextValue {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return context;
}

/**
 * Higher-order component for class components
 */
export function withI18n<P extends object>(
  WrappedComponent: React.ComponentType<P & I18nContextValue>
) {
  return function WithI18nComponent(props: P) {
    const i18n = useI18n();
    return <WrappedComponent {...props} {...i18n} />;
  };
}

/**
 * Language Switcher Component
 */
export function LanguageSwitcher({ className }: { className?: string }) {
  const { locale, setLocale } = useI18n();

  return (
    <button
      onClick={() => setLocale(locale === 'en' ? 'ar' : 'en')}
      className={className || 'px-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors'}
      title={locale === 'en' ? 'التبديل إلى العربية' : 'Switch to English'}
    >
      {locale === 'en' ? 'العربية' : 'English'}
    </button>
  );
}

export default I18nProvider;
