import { describe, it, expect, beforeEach } from 'vitest';
import { MultiCurrencyService, CURRENCIES, FIXED_USD_RATES } from '../multi-currency.service';

describe('MultiCurrencyService', () => {
  beforeEach(() => {
    // Re-initialize to ensure clean state
    MultiCurrencyService.initialize();
  });

  describe('initialize', () => {
    it('should populate exchange rates for all currency pairs', () => {
      MultiCurrencyService.initialize();

      // After initialization, getExchangeRate should work for any pair
      const rate = MultiCurrencyService.getExchangeRate('USD', 'SAR');
      expect(rate).not.toBeNull();
      expect(rate!.rate).toBeGreaterThan(0);
    });
  });

  describe('getExchangeRate', () => {
    it('should return rate 1 for same currency', () => {
      const rate = MultiCurrencyService.getExchangeRate('SAR', 'SAR');

      expect(rate).not.toBeNull();
      expect(rate!.rate).toBe(1);
      expect(rate!.inverseRate).toBe(1);
      expect(rate!.source).toBe('FIXED');
    });

    it('should return exchange rate between two currencies', () => {
      const rate = MultiCurrencyService.getExchangeRate('USD', 'SAR');

      expect(rate).not.toBeNull();
      expect(rate!.baseCurrency).toBe('USD');
      expect(rate!.targetCurrency).toBe('SAR');
      // Rate is calculated as fromRate / toRate (FIXED_USD_RATES.USD / FIXED_USD_RATES.SAR)
      expect(rate!.rate).toBeCloseTo(FIXED_USD_RATES.USD / FIXED_USD_RATES.SAR, 4);
    });

    it('should return inverse rate', () => {
      const rate = MultiCurrencyService.getExchangeRate('SAR', 'USD');

      expect(rate).not.toBeNull();
      // SAR->USD rate = FIXED_USD_RATES.SAR / FIXED_USD_RATES.USD = 3.75
      expect(rate!.rate).toBeCloseTo(FIXED_USD_RATES.SAR / FIXED_USD_RATES.USD, 4);
    });

    it('should return effective date and source', () => {
      const rate = MultiCurrencyService.getExchangeRate('AED', 'SAR');

      expect(rate).not.toBeNull();
      expect(rate!.effectiveDate).toBeInstanceOf(Date);
      expect(rate!.lastUpdated).toBeInstanceOf(Date);
      expect(rate!.source).toBe('FIXED');
    });
  });

  describe('setExchangeRate', () => {
    it('should set custom exchange rate', () => {
      MultiCurrencyService.setExchangeRate('USD', 'SAR', 3.80, 'CUSTOM');

      const rate = MultiCurrencyService.getExchangeRate('USD', 'SAR');
      expect(rate).not.toBeNull();
      expect(rate!.rate).toBe(3.80);
      expect(rate!.source).toBe('CUSTOM');
    });

    it('should also set the inverse rate', () => {
      MultiCurrencyService.setExchangeRate('USD', 'SAR', 3.80);

      const inverseRate = MultiCurrencyService.getExchangeRate('SAR', 'USD');
      expect(inverseRate).not.toBeNull();
      expect(inverseRate!.rate).toBeCloseTo(1 / 3.80, 6);
    });
  });

  describe('convert', () => {
    it('should convert amount between currencies', () => {
      const result = MultiCurrencyService.convert(1000, 'USD', 'SAR');

      expect(result.originalAmount).toBe(1000);
      expect(result.originalCurrency).toBe('USD');
      expect(result.targetCurrency).toBe('SAR');
      expect(result.convertedAmount).toBeGreaterThan(0);
      expect(result.exchangeRate).toBeGreaterThan(0);
      expect(result.rateDate).toBeInstanceOf(Date);
    });

    it('should return same amount for same currency', () => {
      const result = MultiCurrencyService.convert(1000, 'SAR', 'SAR');

      expect(result.convertedAmount).toBe(1000);
      expect(result.exchangeRate).toBe(1);
      expect(result.roundedAmount).toBe(1000);
    });

    it('should apply correct rounding for 2 decimal place currencies', () => {
      MultiCurrencyService.setExchangeRate('USD', 'SAR', 3.7512345);
      const result = MultiCurrencyService.convert(1000, 'USD', 'SAR');

      // SAR has 2 decimal places
      expect(result.roundedAmount).toBe(3751.23);
    });

    it('should apply 3 decimal place rounding for BHD', () => {
      const result = MultiCurrencyService.convert(1000, 'USD', 'BHD');

      // BHD has 3 decimal places
      const expectedRounded = MultiCurrencyService.round(result.convertedAmount, 3);
      expect(result.roundedAmount).toBe(expectedRounded);
    });

    it('should calculate rounding difference', () => {
      const result = MultiCurrencyService.convert(1000, 'USD', 'SAR');

      expect(result.roundingDifference).toBeDefined();
      expect(typeof result.roundingDifference).toBe('number');
    });

    it('should handle zero amount', () => {
      const result = MultiCurrencyService.convert(0, 'USD', 'SAR');

      expect(result.convertedAmount).toBe(0);
      expect(result.roundedAmount).toBe(0);
    });

    it('should handle negative amount', () => {
      const result = MultiCurrencyService.convert(-1000, 'USD', 'SAR');

      expect(result.convertedAmount).toBeLessThan(0);
    });

    it('should handle very large amounts', () => {
      const result = MultiCurrencyService.convert(1000000, 'USD', 'SAR');

      expect(result.convertedAmount).toBeGreaterThan(0);
      expect(result.originalAmount).toBe(1000000);
    });
  });

  describe('convertBulk', () => {
    it('should convert multiple items to target currency', () => {
      const items = [
        { amount: 1000, fromCurrency: 'USD' as const },
        { amount: 5000, fromCurrency: 'AED' as const },
        { amount: 2000, fromCurrency: 'EUR' as const },
      ];

      const results = MultiCurrencyService.convertBulk(items, 'SAR');

      expect(results).toHaveLength(3);
      results.forEach(result => {
        expect(result.targetCurrency).toBe('SAR');
        expect(result.convertedAmount).toBeGreaterThan(0);
      });
    });
  });

  describe('format', () => {
    it('should format amount with currency symbol', () => {
      const formatted = MultiCurrencyService.format(1000, 'SAR');

      expect(formatted).toContain('1,000');
      expect(formatted).toContain('ر.س');
    });

    it('should format with symbol before for USD', () => {
      const formatted = MultiCurrencyService.format(1000, 'USD');

      expect(formatted).toContain('$');
      expect(formatted).toContain('1,000');
    });

    it('should respect decimal places for BHD (3 decimals)', () => {
      const formatted = MultiCurrencyService.format(1000.123, 'BHD');

      expect(formatted).toContain('1,000.123');
    });

    it('should format with code instead of symbol when specified', () => {
      const formatted = MultiCurrencyService.format(1000, 'SAR', {
        showSymbol: false,
        showCode: true,
      });

      expect(formatted).toContain('SAR');
    });

    it('should handle Arabic locale', () => {
      const formatted = MultiCurrencyService.format(1000, 'SAR', { locale: 'ar' });

      expect(formatted).toBeDefined();
      expect(formatted.length).toBeGreaterThan(0);
    });
  });

  describe('parse', () => {
    it('should parse formatted currency string to number', () => {
      const result = MultiCurrencyService.parse('1,000.50 ر.س', 'SAR');

      expect(result).toBe(1000.50);
    });

    it('should handle string with currency code', () => {
      const result = MultiCurrencyService.parse('1,000.50 SAR', 'SAR');

      expect(result).toBe(1000.50);
    });

    it('should return 0 for invalid input', () => {
      const result = MultiCurrencyService.parse('invalid', 'SAR');

      expect(result).toBe(0);
    });
  });

  describe('round', () => {
    it('should round to 2 decimal places by default', () => {
      expect(MultiCurrencyService.round(1000.5678)).toBe(1000.57);
    });

    it('should round to specified decimal places', () => {
      expect(MultiCurrencyService.round(1000.5678, 3)).toBe(1000.568);
    });

    it('should handle 0 decimal places', () => {
      expect(MultiCurrencyService.round(1000.5678, 0)).toBe(1001);
    });
  });

  describe('getCurrency', () => {
    it('should return currency configuration', () => {
      const config = MultiCurrencyService.getCurrency('SAR');

      expect(config.code).toBe('SAR');
      expect(config.name).toBe('Saudi Riyal');
      expect(config.nameAr).toBe('ريال سعودي');
      expect(config.symbol).toBe('ر.س');
      expect(config.decimalPlaces).toBe(2);
    });

    it('should return configuration for KWD with 3 decimal places', () => {
      const config = MultiCurrencyService.getCurrency('KWD');

      expect(config.decimalPlaces).toBe(3);
    });
  });

  describe('getAllCurrencies', () => {
    it('should return all supported currencies', () => {
      const currencies = MultiCurrencyService.getAllCurrencies();

      expect(currencies.length).toBe(Object.keys(CURRENCIES).length);
      const codes = currencies.map(c => c.code);
      expect(codes).toContain('SAR');
      expect(codes).toContain('AED');
      expect(codes).toContain('USD');
      expect(codes).toContain('INR');
    });
  });

  describe('getGCCCurrencies', () => {
    it('should return only GCC currencies', () => {
      const gccCurrencies = MultiCurrencyService.getGCCCurrencies();

      expect(gccCurrencies).toHaveLength(6);
      const codes = gccCurrencies.map(c => c.code);
      expect(codes).toContain('AED');
      expect(codes).toContain('SAR');
      expect(codes).toContain('BHD');
      expect(codes).toContain('QAR');
      expect(codes).toContain('OMR');
      expect(codes).toContain('KWD');
      expect(codes).not.toContain('INR');
      expect(codes).not.toContain('USD');
    });
  });

  describe('isValidCurrency', () => {
    it('should return true for supported currencies', () => {
      expect(MultiCurrencyService.isValidCurrency('SAR')).toBe(true);
      expect(MultiCurrencyService.isValidCurrency('AED')).toBe(true);
      expect(MultiCurrencyService.isValidCurrency('USD')).toBe(true);
    });

    it('should return false for unsupported currencies', () => {
      expect(MultiCurrencyService.isValidCurrency('XXX')).toBe(false);
      expect(MultiCurrencyService.isValidCurrency('')).toBe(false);
    });
  });

  describe('getExchangeRateTable', () => {
    it('should return exchange rate table for base currency', () => {
      const table = MultiCurrencyService.getExchangeRateTable('USD');

      expect(table.length).toBe(Object.keys(CURRENCIES).length - 1); // Excludes USD itself
      table.forEach(entry => {
        expect(entry.currency).toBeDefined();
        expect(entry.rate).toBeGreaterThan(0);
        expect(entry.formatted).toBeTruthy();
      });
    });
  });

  describe('getGCCCrossRates', () => {
    it('should return cross rates between GCC currencies', () => {
      const crossRates = MultiCurrencyService.getGCCCrossRates();

      expect(crossRates.AED).toBeDefined();
      expect(crossRates.SAR).toBeDefined();
      expect(crossRates.AED.SAR).toBeGreaterThan(0);
      expect(crossRates.AED.AED).toBe(1);
    });
  });

  describe('calculateMultiCurrencyPayroll', () => {
    it('should calculate totals by currency', () => {
      const items = [
        {
          employeeId: 'emp-1',
          description: 'Salary',
          originalCurrency: 'USD' as const,
          originalAmount: 5000,
          targetCurrency: 'SAR' as const,
          convertedAmount: 18750,
          exchangeRate: 3.75,
        },
        {
          employeeId: 'emp-2',
          description: 'Salary',
          originalCurrency: 'AED' as const,
          originalAmount: 10000,
          targetCurrency: 'SAR' as const,
          convertedAmount: 10204,
          exchangeRate: 1.0204,
        },
      ];

      const result = MultiCurrencyService.calculateMultiCurrencyPayroll(items);

      expect(result.items).toHaveLength(2);
      expect(result.totalsByCurrency.SAR).toBe(18750 + 10204);
    });
  });
});
