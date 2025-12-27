import { describe, it, expect, beforeEach, vi } from 'vitest';
import { MultiCurrencyService } from '../multi-currency.service';

// Mock external exchange rate API
vi.mock('@/lib/external/exchange-rate-api', () => ({
  ExchangeRateAPI: {
    getRate: vi.fn(),
    getRates: vi.fn(),
  },
}));

describe('MultiCurrencyService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('convert', () => {
    it('should convert amount from one currency to another', () => {
      const result = MultiCurrencyService.convert(1000, 'USD', 'SAR', 3.75);

      expect(result.fromAmount).toBe(1000);
      expect(result.fromCurrency).toBe('USD');
      expect(result.toAmount).toBe(3750); // 1000 * 3.75
      expect(result.toCurrency).toBe('SAR');
      expect(result.exchangeRate).toBe(3.75);
    });

    it('should handle same currency conversion', () => {
      const result = MultiCurrencyService.convert(1000, 'SAR', 'SAR', 1);

      expect(result.toAmount).toBe(1000);
      expect(result.exchangeRate).toBe(1);
    });

    it('should round to 2 decimal places', () => {
      const result = MultiCurrencyService.convert(1000, 'USD', 'SAR', 3.7512345);

      expect(result.toAmount).toBe(3751.23); // Rounded
    });

    it('should handle zero amount', () => {
      const result = MultiCurrencyService.convert(0, 'USD', 'SAR', 3.75);

      expect(result.toAmount).toBe(0);
    });

    it('should throw error for invalid exchange rate', () => {
      expect(() => {
        MultiCurrencyService.convert(1000, 'USD', 'SAR', 0);
      }).toThrow('Invalid exchange rate');
    });
  });

  describe('getExchangeRate', () => {
    it('should return cached exchange rate if available', async () => {
      // Seed cache
      await MultiCurrencyService.updateExchangeRate('USD', 'SAR', 3.75);

      const result = await MultiCurrencyService.getExchangeRate('USD', 'SAR');

      expect(result.rate).toBe(3.75);
      expect(result.cached).toBe(true);
    });

    it('should fetch live rate if not cached', async () => {
      const { ExchangeRateAPI } = await import('@/lib/external/exchange-rate-api');
      vi.mocked(ExchangeRateAPI.getRate).mockResolvedValue(3.75);

      const result = await MultiCurrencyService.getExchangeRate('USD', 'SAR');

      expect(result.rate).toBe(3.75);
      expect(result.cached).toBe(false);
      expect(ExchangeRateAPI.getRate).toHaveBeenCalledWith('USD', 'SAR');
    });

    it('should return 1 for same currency', async () => {
      const result = await MultiCurrencyService.getExchangeRate('SAR', 'SAR');

      expect(result.rate).toBe(1);
      expect(result.cached).toBe(true);
    });

    it('should handle API errors gracefully', async () => {
      const { ExchangeRateAPI } = await import('@/lib/external/exchange-rate-api');
      vi.mocked(ExchangeRateAPI.getRate).mockRejectedValue(new Error('API Error'));

      await expect(
        MultiCurrencyService.getExchangeRate('USD', 'XXX')
      ).rejects.toThrow('Failed to fetch exchange rate');
    });
  });

  describe('convertWithLiveRate', () => {
    it('should fetch live rate and convert', async () => {
      const { ExchangeRateAPI } = await import('@/lib/external/exchange-rate-api');
      vi.mocked(ExchangeRateAPI.getRate).mockResolvedValue(3.75);

      const result = await MultiCurrencyService.convertWithLiveRate(1000, 'USD', 'SAR');

      expect(result.toAmount).toBe(3750);
      expect(result.exchangeRate).toBe(3.75);
    });
  });

  describe('getSupportedCurrencies', () => {
    it('should return list of supported currencies', () => {
      const currencies = MultiCurrencyService.getSupportedCurrencies();

      expect(currencies).toContain('SAR'); // Saudi Riyal
      expect(currencies).toContain('AED'); // UAE Dirham
      expect(currencies).toContain('KWD'); // Kuwaiti Dinar
      expect(currencies).toContain('BHD'); // Bahraini Dinar
      expect(currencies).toContain('OMR'); // Omani Rial
      expect(currencies).toContain('QAR'); // Qatari Riyal
      expect(currencies).toContain('USD'); // US Dollar
      expect(currencies).toContain('EUR'); // Euro
      expect(currencies).toContain('GBP'); // British Pound
      expect(currencies).toContain('INR'); // Indian Rupee
    });

    it('should return GCC currencies only', () => {
      const gccCurrencies = MultiCurrencyService.getGCCCurrencies();

      expect(gccCurrencies).toEqual(['SAR', 'AED', 'KWD', 'BHD', 'OMR', 'QAR']);
    });
  });

  describe('getCurrencyInfo', () => {
    it('should return currency information', () => {
      const info = MultiCurrencyService.getCurrencyInfo('SAR');

      expect(info.code).toBe('SAR');
      expect(info.name).toBe('Saudi Riyal');
      expect(info.symbol).toBe('﷼');
      expect(info.decimalPlaces).toBe(2);
    });

    it('should handle currency with 3 decimal places', () => {
      const info = MultiCurrencyService.getCurrencyInfo('KWD');

      expect(info.decimalPlaces).toBe(3); // Kuwaiti Dinar uses 3 decimals
    });

    it('should throw error for unsupported currency', () => {
      expect(() => {
        MultiCurrencyService.getCurrencyInfo('XXX');
      }).toThrow('Unsupported currency');
    });
  });

  describe('formatAmount', () => {
    it('should format amount with currency symbol', () => {
      const formatted = MultiCurrencyService.formatAmount(1000, 'SAR');

      expect(formatted).toContain('1,000');
      expect(formatted).toContain('SAR');
    });

    it('should format with 3 decimal places for KWD', () => {
      const formatted = MultiCurrencyService.formatAmount(1000.123, 'KWD');

      expect(formatted).toContain('1,000.123');
    });

    it('should format with locale-specific separators', () => {
      const formatted = MultiCurrencyService.formatAmount(1234567.89, 'USD', 'en-US');

      expect(formatted).toContain('1,234,567.89');
    });

    it('should handle Arabic locale', () => {
      const formatted = MultiCurrencyService.formatAmount(1000, 'SAR', 'ar-SA');

      expect(formatted).toBeDefined();
    });
  });

  describe('convertSalary', () => {
    it('should convert salary with all components', () => {
      const salary = {
        basicSalary: 10000,
        housingAllowance: 4000,
        transportAllowance: 1000,
      };

      const result = MultiCurrencyService.convertSalary(salary, 'SAR', 'USD', 0.27);

      expect(result.basicSalary).toBe(2700); // 10000 * 0.27
      expect(result.housingAllowance).toBe(1080); // 4000 * 0.27
      expect(result.transportAllowance).toBe(270); // 1000 * 0.27
      expect(result.totalSalary).toBe(4050);
    });

    it('should handle missing allowances', () => {
      const salary = {
        basicSalary: 10000,
      };

      const result = MultiCurrencyService.convertSalary(salary, 'SAR', 'USD', 0.27);

      expect(result.basicSalary).toBe(2700);
      expect(result.totalSalary).toBe(2700);
    });
  });

  describe('getBulkExchangeRates', () => {
    it('should return exchange rates for multiple currencies', async () => {
      const { ExchangeRateAPI } = await import('@/lib/external/exchange-rate-api');
      vi.mocked(ExchangeRateAPI.getRates).mockResolvedValue({
        SAR: 3.75,
        AED: 3.67,
        EUR: 0.92,
      });

      const result = await MultiCurrencyService.getBulkExchangeRates('USD', ['SAR', 'AED', 'EUR']);

      expect(result.USD_SAR).toBe(3.75);
      expect(result.USD_AED).toBe(3.67);
      expect(result.USD_EUR).toBe(0.92);
    });
  });

  describe('calculateCrossRate', () => {
    it('should calculate cross rate via base currency', () => {
      // EUR to SAR via USD
      // USD/EUR = 0.92, USD/SAR = 3.75
      // EUR/SAR = 3.75 / 0.92 = 4.076
      const result = MultiCurrencyService.calculateCrossRate('EUR', 'SAR', {
        EUR_USD: 1.09, // EUR to USD
        USD_SAR: 3.75, // USD to SAR
      });

      expect(result).toBeCloseTo(4.09, 1); // EUR/SAR = 1.09 * 3.75
    });
  });

  describe('updateExchangeRate', () => {
    it('should update exchange rate in cache', async () => {
      await MultiCurrencyService.updateExchangeRate('USD', 'SAR', 3.75);

      const result = await MultiCurrencyService.getExchangeRate('USD', 'SAR');

      expect(result.rate).toBe(3.75);
      expect(result.cached).toBe(true);
    });

    it('should store timestamp with rate', async () => {
      await MultiCurrencyService.updateExchangeRate('USD', 'SAR', 3.75);

      const result = await MultiCurrencyService.getExchangeRate('USD', 'SAR');

      expect(result.updatedAt).toBeDefined();
      expect(result.updatedAt).toBeInstanceOf(Date);
    });
  });

  describe('isStaleRate', () => {
    it('should detect stale rates older than threshold', () => {
      const oldDate = new Date();
      oldDate.setHours(oldDate.getHours() - 25); // 25 hours ago

      const result = MultiCurrencyService.isStaleRate(oldDate, 24); // 24 hour threshold

      expect(result).toBe(true);
    });

    it('should not flag fresh rates', () => {
      const recentDate = new Date();
      recentDate.setHours(recentDate.getHours() - 1); // 1 hour ago

      const result = MultiCurrencyService.isStaleRate(recentDate, 24);

      expect(result).toBe(false);
    });
  });

  describe('getHistoricalRate', () => {
    it('should fetch historical exchange rate for date', async () => {
      const { ExchangeRateAPI } = await import('@/lib/external/exchange-rate-api');
      vi.mocked(ExchangeRateAPI.getHistoricalRate).mockResolvedValue(3.72);

      const result = await MultiCurrencyService.getHistoricalRate(
        'USD',
        'SAR',
        new Date('2024-01-01')
      );

      expect(result.rate).toBe(3.72);
      expect(result.date).toEqual(new Date('2024-01-01'));
    });
  });

  describe('calculateGainLoss', () => {
    it('should calculate currency gain/loss', () => {
      const originalAmount = 1000; // USD
      const originalRate = 3.75; // USD to SAR
      const currentRate = 3.80; // New rate

      const result = MultiCurrencyService.calculateGainLoss(
        originalAmount,
        'USD',
        'SAR',
        originalRate,
        currentRate
      );

      // Original: 1000 * 3.75 = 3750 SAR
      // Current: 1000 * 3.80 = 3800 SAR
      // Gain: 50 SAR
      expect(result.originalValue).toBe(3750);
      expect(result.currentValue).toBe(3800);
      expect(result.gainLoss).toBe(50);
      expect(result.gainLossPercentage).toBeCloseTo(1.33, 1);
    });

    it('should show loss when rate decreases', () => {
      const result = MultiCurrencyService.calculateGainLoss(
        1000,
        'USD',
        'SAR',
        3.75,
        3.70 // Lower rate
      );

      expect(result.gainLoss).toBe(-50); // Loss
      expect(result.gainLossPercentage).toBeLessThan(0);
    });
  });

  describe('Edge Cases', () => {
    it('should handle very small amounts', () => {
      const result = MultiCurrencyService.convert(0.01, 'USD', 'SAR', 3.75);

      expect(result.toAmount).toBeCloseTo(0.04, 2);
    });

    it('should handle very large amounts', () => {
      const result = MultiCurrencyService.convert(1000000, 'USD', 'SAR', 3.75);

      expect(result.toAmount).toBe(3750000);
    });

    it('should handle negative amounts', () => {
      const result = MultiCurrencyService.convert(-1000, 'USD', 'SAR', 3.75);

      expect(result.toAmount).toBe(-3750);
    });
  });
});
