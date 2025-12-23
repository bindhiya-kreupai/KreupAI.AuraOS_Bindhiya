/**
 * Internationalization (i18n) Service
 * Provides translation and localization support for English and Arabic
 */

import en from './locales/en.json';
import ar from './locales/ar.json';

export type Locale = 'en' | 'ar';
export type Direction = 'ltr' | 'rtl';

export interface LocaleConfig {
  code: Locale;
  name: string;
  nativeName: string;
  direction: Direction;
  dateFormat: string;
  timeFormat: string;
  numberFormat: {
    decimal: string;
    thousands: string;
  };
  calendar: 'gregorian' | 'hijri';
}

export const LOCALE_CONFIGS: Record<Locale, LocaleConfig> = {
  en: {
    code: 'en',
    name: 'English',
    nativeName: 'English',
    direction: 'ltr',
    dateFormat: 'DD/MM/YYYY',
    timeFormat: 'HH:mm',
    numberFormat: {
      decimal: '.',
      thousands: ',',
    },
    calendar: 'gregorian',
  },
  ar: {
    code: 'ar',
    name: 'Arabic',
    nativeName: 'العربية',
    direction: 'rtl',
    dateFormat: 'YYYY/MM/DD',
    timeFormat: 'HH:mm',
    numberFormat: {
      decimal: '٫',
      thousands: '٬',
    },
    calendar: 'hijri',
  },
};

// Translation dictionaries
const translations: Record<Locale, typeof en> = {
  en,
  ar,
};

/**
 * Get a nested translation value by key path
 */
function getNestedValue(obj: unknown, path: string): string | undefined {
  const keys = path.split('.');
  let current: unknown = obj;

  for (const key of keys) {
    if (current === null || current === undefined) {
      return undefined;
    }
    current = (current as Record<string, unknown>)[key];
  }

  return typeof current === 'string' ? current : undefined;
}

/**
 * Replace template variables in a string
 */
function replaceVariables(text: string, variables?: Record<string, string | number>): string {
  if (!variables) return text;

  return text.replace(/\{\{(\w+)\}\}/g, (_, key) => {
    return variables[key]?.toString() ?? `{{${key}}}`;
  });
}

/**
 * I18n Service Class
 */
export class I18nService {
  private locale: Locale = 'en';
  private fallbackLocale: Locale = 'en';

  constructor(locale?: Locale) {
    if (locale) {
      this.locale = locale;
    }
  }

  /**
   * Set the current locale
   */
  setLocale(locale: Locale): void {
    this.locale = locale;
  }

  /**
   * Get the current locale
   */
  getLocale(): Locale {
    return this.locale;
  }

  /**
   * Get locale configuration
   */
  getLocaleConfig(): LocaleConfig {
    return LOCALE_CONFIGS[this.locale];
  }

  /**
   * Get text direction
   */
  getDirection(): Direction {
    return LOCALE_CONFIGS[this.locale].direction;
  }

  /**
   * Translate a key
   */
  t(key: string, variables?: Record<string, string | number>): string {
    let translation = getNestedValue(translations[this.locale], key);

    if (!translation && this.locale !== this.fallbackLocale) {
      translation = getNestedValue(translations[this.fallbackLocale], key);
    }

    if (!translation) {
      console.warn(`Translation missing for key: ${key}`);
      return key;
    }

    return replaceVariables(translation, variables);
  }

  /**
   * Format a number according to locale
   */
  formatNumber(value: number, options?: Intl.NumberFormatOptions): string {
    const localeCode = this.locale === 'ar' ? 'ar-SA' : 'en-US';
    return new Intl.NumberFormat(localeCode, options).format(value);
  }

  /**
   * Format currency
   */
  formatCurrency(value: number, currency: string): string {
    const localeCode = this.locale === 'ar' ? 'ar-SA' : 'en-US';
    return new Intl.NumberFormat(localeCode, {
      style: 'currency',
      currency,
    }).format(value);
  }

  /**
   * Format a date according to locale
   */
  formatDate(date: Date | string, options?: Intl.DateTimeFormatOptions): string {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    const localeCode = this.locale === 'ar' ? 'ar-SA' : 'en-US';

    const defaultOptions: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    };

    return new Intl.DateTimeFormat(localeCode, options || defaultOptions).format(dateObj);
  }

  /**
   * Format date in Hijri calendar
   */
  formatHijriDate(date: Date | string): string {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return new Intl.DateTimeFormat('ar-SA-u-ca-islamic', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(dateObj);
  }

  /**
   * Format time according to locale
   */
  formatTime(date: Date | string, options?: Intl.DateTimeFormatOptions): string {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    const localeCode = this.locale === 'ar' ? 'ar-SA' : 'en-US';

    const defaultOptions: Intl.DateTimeFormatOptions = {
      hour: '2-digit',
      minute: '2-digit',
    };

    return new Intl.DateTimeFormat(localeCode, options || defaultOptions).format(dateObj);
  }

  /**
   * Get relative time (e.g., "2 days ago")
   */
  formatRelativeTime(date: Date | string): string {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - dateObj.getTime()) / 1000);

    const localeCode = this.locale === 'ar' ? 'ar-SA' : 'en-US';
    const rtf = new Intl.RelativeTimeFormat(localeCode, { numeric: 'auto' });

    if (diffInSeconds < 60) {
      return rtf.format(-diffInSeconds, 'second');
    } else if (diffInSeconds < 3600) {
      return rtf.format(-Math.floor(diffInSeconds / 60), 'minute');
    } else if (diffInSeconds < 86400) {
      return rtf.format(-Math.floor(diffInSeconds / 3600), 'hour');
    } else if (diffInSeconds < 2592000) {
      return rtf.format(-Math.floor(diffInSeconds / 86400), 'day');
    } else if (diffInSeconds < 31536000) {
      return rtf.format(-Math.floor(diffInSeconds / 2592000), 'month');
    } else {
      return rtf.format(-Math.floor(diffInSeconds / 31536000), 'year');
    }
  }

  /**
   * Convert Arabic numerals to Western numerals
   */
  toWesternNumerals(str: string): string {
    const arabicNumerals = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
    let result = str;
    arabicNumerals.forEach((num, index) => {
      result = result.replace(new RegExp(num, 'g'), index.toString());
    });
    return result;
  }

  /**
   * Convert Western numerals to Arabic numerals
   */
  toArabicNumerals(str: string): string {
    const arabicNumerals = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
    return str.replace(/[0-9]/g, (digit) => arabicNumerals[parseInt(digit)]);
  }
}

// Create a singleton instance
export const i18n = new I18nService();

// Export translations for direct access if needed
export { en, ar };

// Helper function to create a translation function for a specific locale
export function createTranslator(locale: Locale) {
  const service = new I18nService(locale);
  return service.t.bind(service);
}

// React hook for using translations (to be used with React context)
export function useI18n() {
  return i18n;
}

export default i18n;
