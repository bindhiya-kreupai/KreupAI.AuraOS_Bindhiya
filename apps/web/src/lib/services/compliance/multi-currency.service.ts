/**
 * Multi-Currency Service for GCC and APAC Payroll
 * Supports AED, SAR, BHD, QAR, OMR, KWD, and INR
 *
 * Key Features:
 * - Real-time and fixed exchange rates
 * - Currency conversion for payroll
 * - Rounding rules per currency
 * - Historical rate tracking
 * - Multi-currency payroll support
 */

import { SupportedCountryCode, COUNTRY_CURRENCIES } from './types';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export type CurrencyCode = 'AED' | 'SAR' | 'BHD' | 'QAR' | 'OMR' | 'KWD' | 'INR' | 'USD' | 'EUR' | 'GBP';

export interface CurrencyConfiguration {
  code: CurrencyCode;
  name: string;
  nameAr: string;
  symbol: string;
  symbolPosition: 'before' | 'after';
  decimalPlaces: number;
  thousandSeparator: string;
  decimalSeparator: string;
  isoNumeric: string;
  countryCode: string;
}

export interface ExchangeRate {
  baseCurrency: CurrencyCode;
  targetCurrency: CurrencyCode;
  rate: number;
  inverseRate: number;
  effectiveDate: Date;
  expiryDate?: Date;
  source: 'CENTRAL_BANK' | 'MARKET' | 'FIXED' | 'CUSTOM';
  lastUpdated: Date;
}

export interface CurrencyConversionResult {
  originalAmount: number;
  originalCurrency: CurrencyCode;
  convertedAmount: number;
  targetCurrency: CurrencyCode;
  exchangeRate: number;
  rateDate: Date;
  roundedAmount: number;
  roundingDifference: number;
}

export interface MultiCurrencyPayrollItem {
  employeeId: string;
  description: string;
  originalCurrency: CurrencyCode;
  originalAmount: number;
  targetCurrency: CurrencyCode;
  convertedAmount: number;
  exchangeRate: number;
}

export interface CurrencyFormatOptions {
  showSymbol?: boolean;
  showCode?: boolean;
  useGrouping?: boolean;
  minimumFractionDigits?: number;
  maximumFractionDigits?: number;
  locale?: 'en' | 'ar';
}

// ============================================================================
// CURRENCY CONFIGURATIONS
// ============================================================================

export const CURRENCIES: Record<CurrencyCode, CurrencyConfiguration> = {
  AED: {
    code: 'AED',
    name: 'UAE Dirham',
    nameAr: 'درهم إماراتي',
    symbol: 'د.إ',
    symbolPosition: 'after',
    decimalPlaces: 2,
    thousandSeparator: ',',
    decimalSeparator: '.',
    isoNumeric: '784',
    countryCode: 'AE',
  },
  SAR: {
    code: 'SAR',
    name: 'Saudi Riyal',
    nameAr: 'ريال سعودي',
    symbol: 'ر.س',
    symbolPosition: 'after',
    decimalPlaces: 2,
    thousandSeparator: ',',
    decimalSeparator: '.',
    isoNumeric: '682',
    countryCode: 'SA',
  },
  BHD: {
    code: 'BHD',
    name: 'Bahraini Dinar',
    nameAr: 'دينار بحريني',
    symbol: 'د.ب',
    symbolPosition: 'after',
    decimalPlaces: 3,
    thousandSeparator: ',',
    decimalSeparator: '.',
    isoNumeric: '048',
    countryCode: 'BH',
  },
  QAR: {
    code: 'QAR',
    name: 'Qatari Riyal',
    nameAr: 'ريال قطري',
    symbol: 'ر.ق',
    symbolPosition: 'after',
    decimalPlaces: 2,
    thousandSeparator: ',',
    decimalSeparator: '.',
    isoNumeric: '634',
    countryCode: 'QA',
  },
  OMR: {
    code: 'OMR',
    name: 'Omani Rial',
    nameAr: 'ريال عماني',
    symbol: 'ر.ع',
    symbolPosition: 'after',
    decimalPlaces: 3,
    thousandSeparator: ',',
    decimalSeparator: '.',
    isoNumeric: '512',
    countryCode: 'OM',
  },
  KWD: {
    code: 'KWD',
    name: 'Kuwaiti Dinar',
    nameAr: 'دينار كويتي',
    symbol: 'د.ك',
    symbolPosition: 'after',
    decimalPlaces: 3,
    thousandSeparator: ',',
    decimalSeparator: '.',
    isoNumeric: '414',
    countryCode: 'KW',
  },
  INR: {
    code: 'INR',
    name: 'Indian Rupee',
    nameAr: 'روبية هندية',
    symbol: '₹',
    symbolPosition: 'before',
    decimalPlaces: 2,
    thousandSeparator: ',',
    decimalSeparator: '.',
    isoNumeric: '356',
    countryCode: 'IN',
  },
  USD: {
    code: 'USD',
    name: 'US Dollar',
    nameAr: 'دولار أمريكي',
    symbol: '$',
    symbolPosition: 'before',
    decimalPlaces: 2,
    thousandSeparator: ',',
    decimalSeparator: '.',
    isoNumeric: '840',
    countryCode: 'US',
  },
  EUR: {
    code: 'EUR',
    name: 'Euro',
    nameAr: 'يورو',
    symbol: '€',
    symbolPosition: 'before',
    decimalPlaces: 2,
    thousandSeparator: ',',
    decimalSeparator: '.',
    isoNumeric: '978',
    countryCode: 'EU',
  },
  GBP: {
    code: 'GBP',
    name: 'British Pound',
    nameAr: 'جنيه إسترليني',
    symbol: '£',
    symbolPosition: 'before',
    decimalPlaces: 2,
    thousandSeparator: ',',
    decimalSeparator: '.',
    isoNumeric: '826',
    countryCode: 'GB',
  },
};

// Fixed exchange rates to USD (GCC currencies are pegged)
export const FIXED_USD_RATES: Record<CurrencyCode, number> = {
  AED: 3.6725,     // Fixed peg since 1997
  SAR: 3.75,       // Fixed peg since 1986
  BHD: 0.376,      // Fixed peg since 1980
  QAR: 3.64,       // Fixed peg since 2001
  OMR: 0.3845,     // Fixed peg since 1986
  KWD: 0.3066,     // Managed float (approximate)
  INR: 83.50,      // Floating (market rate - example)
  USD: 1.0,        // Base currency
  EUR: 0.92,       // Floating (approximate)
  GBP: 0.79,       // Floating (approximate)
};

// ============================================================================
// MULTI-CURRENCY SERVICE
// ============================================================================

export class MultiCurrencyService {
  private static exchangeRates: Map<string, ExchangeRate> = new Map();

  /**
   * Initialize exchange rates with default values
   */
  static initialize(): void {
    const currencies = Object.keys(FIXED_USD_RATES) as CurrencyCode[];

    currencies.forEach(from => {
      currencies.forEach(to => {
        if (from !== to) {
          const key = `${from}_${to}`;
          const fromRate = FIXED_USD_RATES[from];
          const toRate = FIXED_USD_RATES[to];
          const rate = fromRate / toRate;

          this.exchangeRates.set(key, {
            baseCurrency: from,
            targetCurrency: to,
            rate,
            inverseRate: 1 / rate,
            effectiveDate: new Date(),
            source: 'FIXED',
            lastUpdated: new Date(),
          });
        }
      });
    });
  }

  /**
   * Get exchange rate between two currencies
   */
  static getExchangeRate(
    baseCurrency: CurrencyCode,
    targetCurrency: CurrencyCode
  ): ExchangeRate | null {
    if (baseCurrency === targetCurrency) {
      return {
        baseCurrency,
        targetCurrency,
        rate: 1,
        inverseRate: 1,
        effectiveDate: new Date(),
        source: 'FIXED',
        lastUpdated: new Date(),
      };
    }

    // Ensure rates are initialized
    if (this.exchangeRates.size === 0) {
      this.initialize();
    }

    const key = `${baseCurrency}_${targetCurrency}`;
    return this.exchangeRates.get(key) || null;
  }

  /**
   * Set custom exchange rate
   */
  static setExchangeRate(
    baseCurrency: CurrencyCode,
    targetCurrency: CurrencyCode,
    rate: number,
    source: ExchangeRate['source'] = 'CUSTOM'
  ): void {
    const key = `${baseCurrency}_${targetCurrency}`;
    const inverseKey = `${targetCurrency}_${baseCurrency}`;

    this.exchangeRates.set(key, {
      baseCurrency,
      targetCurrency,
      rate,
      inverseRate: 1 / rate,
      effectiveDate: new Date(),
      source,
      lastUpdated: new Date(),
    });

    // Also set the inverse rate
    this.exchangeRates.set(inverseKey, {
      baseCurrency: targetCurrency,
      targetCurrency: baseCurrency,
      rate: 1 / rate,
      inverseRate: rate,
      effectiveDate: new Date(),
      source,
      lastUpdated: new Date(),
    });
  }

  /**
   * Convert amount between currencies
   */
  static convert(
    amount: number,
    fromCurrency: CurrencyCode,
    toCurrency: CurrencyCode
  ): CurrencyConversionResult {
    const exchangeRate = this.getExchangeRate(fromCurrency, toCurrency);

    if (!exchangeRate) {
      throw new Error(`Exchange rate not found for ${fromCurrency} to ${toCurrency}`);
    }

    const convertedAmount = amount * exchangeRate.rate;
    const targetConfig = CURRENCIES[toCurrency];
    const roundedAmount = this.round(convertedAmount, targetConfig.decimalPlaces);

    return {
      originalAmount: amount,
      originalCurrency: fromCurrency,
      convertedAmount,
      targetCurrency: toCurrency,
      exchangeRate: exchangeRate.rate,
      rateDate: exchangeRate.effectiveDate,
      roundedAmount,
      roundingDifference: convertedAmount - roundedAmount,
    };
  }

  /**
   * Convert multiple amounts (payroll items)
   */
  static convertBulk(
    items: Array<{ amount: number; fromCurrency: CurrencyCode }>,
    toCurrency: CurrencyCode
  ): CurrencyConversionResult[] {
    return items.map(item => this.convert(item.amount, item.fromCurrency, toCurrency));
  }

  /**
   * Format currency amount for display
   */
  static format(
    amount: number,
    currencyCode: CurrencyCode,
    options: CurrencyFormatOptions = {}
  ): string {
    const config = CURRENCIES[currencyCode];
    const {
      showSymbol = true,
      showCode = false,
      useGrouping = true,
      minimumFractionDigits = config.decimalPlaces,
      maximumFractionDigits = config.decimalPlaces,
      locale = 'en',
    } = options;

    // Format number
    let formatted = amount.toLocaleString(locale === 'ar' ? 'ar-SA' : 'en-US', {
      minimumFractionDigits,
      maximumFractionDigits,
      useGrouping,
    });

    // Add symbol or code
    if (showSymbol) {
      const symbol = locale === 'ar' ? config.symbol : config.symbol;
      formatted = config.symbolPosition === 'before'
        ? `${symbol}${formatted}`
        : `${formatted} ${symbol}`;
    } else if (showCode) {
      formatted = `${formatted} ${currencyCode}`;
    }

    return formatted;
  }

  /**
   * Parse formatted currency string to number
   */
  static parse(formattedAmount: string, currencyCode: CurrencyCode): number {
    const config = CURRENCIES[currencyCode];

    // Remove currency symbol and code
    let cleaned = formattedAmount
      .replace(config.symbol, '')
      .replace(currencyCode, '')
      .trim();

    // Replace thousand separators and normalize decimal
    cleaned = cleaned
      .replace(new RegExp(`\\${config.thousandSeparator}`, 'g'), '')
      .replace(config.decimalSeparator, '.');

    return parseFloat(cleaned) || 0;
  }

  /**
   * Round amount according to currency rules
   */
  static round(amount: number, decimalPlaces?: number): number {
    const places = decimalPlaces ?? 2;
    const multiplier = Math.pow(10, places);
    return Math.round(amount * multiplier) / multiplier;
  }

  /**
   * Get currency configuration
   */
  static getCurrency(code: CurrencyCode): CurrencyConfiguration {
    return { ...CURRENCIES[code] };
  }

  /**
   * Get currency by country code
   */
  static getCurrencyByCountry(countryCode: SupportedCountryCode): CurrencyConfiguration {
    const currencyCode = COUNTRY_CURRENCIES[countryCode] as CurrencyCode;
    return this.getCurrency(currencyCode);
  }

  /**
   * Get all supported currencies
   */
  static getAllCurrencies(): CurrencyConfiguration[] {
    return Object.values(CURRENCIES);
  }

  /**
   * Get GCC currencies only
   */
  static getGCCCurrencies(): CurrencyConfiguration[] {
    const gccCodes: CurrencyCode[] = ['AED', 'SAR', 'BHD', 'QAR', 'OMR', 'KWD'];
    return gccCodes.map(code => CURRENCIES[code]);
  }

  /**
   * Calculate payroll in multiple currencies
   */
  static calculateMultiCurrencyPayroll(
    items: MultiCurrencyPayrollItem[]
  ): {
    items: MultiCurrencyPayrollItem[];
    totalsByCurrency: Record<CurrencyCode, number>;
  } {
    const totalsByCurrency: Partial<Record<CurrencyCode, number>> = {};

    items.forEach(item => {
      const target = item.targetCurrency;
      totalsByCurrency[target] = (totalsByCurrency[target] || 0) + item.convertedAmount;
    });

    return {
      items,
      totalsByCurrency: totalsByCurrency as Record<CurrencyCode, number>,
    };
  }

  /**
   * Create exchange rate table for display
   */
  static getExchangeRateTable(baseCurrency: CurrencyCode): Array<{
    currency: CurrencyConfiguration;
    rate: number;
    formatted: string;
  }> {
    // Ensure rates are initialized
    if (this.exchangeRates.size === 0) {
      this.initialize();
    }

    return Object.values(CURRENCIES)
      .filter(c => c.code !== baseCurrency)
      .map(currency => {
        const rate = this.getExchangeRate(baseCurrency, currency.code as CurrencyCode);
        return {
          currency,
          rate: rate?.rate || 0,
          formatted: rate ? `1 ${baseCurrency} = ${this.format(rate.rate, currency.code as CurrencyCode)}` : 'N/A',
        };
      });
  }

  /**
   * Validate currency code
   */
  static isValidCurrency(code: string): code is CurrencyCode {
    return code in CURRENCIES;
  }

  /**
   * Get cross rates between GCC currencies
   */
  static getGCCCrossRates(): Record<CurrencyCode, Record<CurrencyCode, number>> {
    const gccCodes: CurrencyCode[] = ['AED', 'SAR', 'BHD', 'QAR', 'OMR', 'KWD'];
    const crossRates: Partial<Record<CurrencyCode, Record<CurrencyCode, number>>> = {};

    // Ensure rates are initialized
    if (this.exchangeRates.size === 0) {
      this.initialize();
    }

    gccCodes.forEach(from => {
      crossRates[from] = {} as Record<CurrencyCode, number>;
      gccCodes.forEach(to => {
        const rate = this.getExchangeRate(from, to);
        crossRates[from]![to] = rate?.rate || (from === to ? 1 : 0);
      });
    });

    return crossRates as Record<CurrencyCode, Record<CurrencyCode, number>>;
  }
}

// Initialize exchange rates on module load
MultiCurrencyService.initialize();

export default MultiCurrencyService;
