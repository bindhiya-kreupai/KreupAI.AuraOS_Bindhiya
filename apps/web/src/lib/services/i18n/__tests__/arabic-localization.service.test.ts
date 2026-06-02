import { describe, it, expect, beforeEach } from 'vitest';
import { ArabicLocalizationService } from '../arabic-localization.service';

describe('ArabicLocalizationService.locale state', () => {
  beforeEach(() => ArabicLocalizationService.setLocale('en'));

  it('defaults to English', () => {
    expect(ArabicLocalizationService.getLocale()).toBe('en');
  });

  it('setLocale changes the active locale', () => {
    ArabicLocalizationService.setLocale('ar');
    expect(ArabicLocalizationService.getLocale()).toBe('ar');
  });

  it('getLocaleConfig returns config for current locale', () => {
    ArabicLocalizationService.setLocale('ar');
    const c = ArabicLocalizationService.getLocaleConfig();
    expect(c).toBeDefined();
    expect(c.direction).toBe('rtl');
  });

  it('getLocaleConfig respects explicit locale', () => {
    const en = ArabicLocalizationService.getLocaleConfig('en');
    expect(en.direction).toBe('ltr');
  });

  it('getDirection returns rtl/ltr correctly', () => {
    expect(ArabicLocalizationService.getDirection('en')).toBe('ltr');
    expect(ArabicLocalizationService.getDirection('ar')).toBe('rtl');
  });
});

describe('ArabicLocalizationService.translation', () => {
  beforeEach(() => ArabicLocalizationService.setLocale('en'));

  it('t() returns key when no translation exists', () => {
    expect(ArabicLocalizationService.t('non.existent.key')).toBe('non.existent.key');
  });

  it('tb() returns key/key for unknown keys', () => {
    const r = ArabicLocalizationService.tb('non.existent');
    expect(r.en).toBe('non.existent');
    expect(r.ar).toBe('non.existent');
  });

  it('registerTranslations adds custom translations resolvable via t()', () => {
    ArabicLocalizationService.registerTranslations([
      { key: 'custom.key', en: 'Hello', ar: 'مرحبا' },
    ]);
    expect(ArabicLocalizationService.t('custom.key', 'en')).toBe('Hello');
    expect(ArabicLocalizationService.t('custom.key', 'ar')).toBe('مرحبا');
  });

  it('tb() returns bilingual pair for registered keys', () => {
    ArabicLocalizationService.registerTranslations([{ key: 'bi.key', en: 'X', ar: 'إكس' }]);
    expect(ArabicLocalizationService.tb('bi.key')).toEqual({ en: 'X', ar: 'إكس' });
  });

  it('custom translations override core', () => {
    ArabicLocalizationService.registerTranslations([
      { key: 'override.key', en: 'Custom', ar: 'مخصص' },
    ]);
    expect(ArabicLocalizationService.t('override.key', 'en')).toBe('Custom');
  });
});

describe('ArabicLocalizationService.formatting', () => {
  it('formatNumber formats with locale', () => {
    const en = ArabicLocalizationService.formatNumber(1234.5, 'en');
    const ar = ArabicLocalizationService.formatNumber(1234.5, 'ar');
    expect(en).toBeTruthy();
    expect(ar).toBeTruthy();
  });

  it('formatCurrency formats SAR with locale', () => {
    const r = ArabicLocalizationService.formatCurrency(1000, 'SAR', 'en');
    expect(r).toContain('1');
  });

  it('toArabicDigits converts Western to Arabic digits', () => {
    expect(ArabicLocalizationService.toArabicDigits(123)).toMatch(/[٠١٢٣٤٥٦٧٨٩]/);
  });

  it('fromArabicDigits converts Arabic to Western digits', () => {
    expect(ArabicLocalizationService.fromArabicDigits('١٢٣')).toBe('123');
  });

  it('fromArabicDigits also handles Eastern Arabic digits', () => {
    expect(ArabicLocalizationService.fromArabicDigits('۱۲۳')).toBe('123');
  });

  it('formatDate formats a Date', () => {
    const r = ArabicLocalizationService.formatDate(new Date(2024, 5, 15), 'en');
    expect(r).toBeTruthy();
  });

  it('formatRelativeTime: minutes ago', () => {
    const past = new Date(Date.now() - 5 * 60 * 1000);
    const r = ArabicLocalizationService.formatRelativeTime(past, 'en');
    expect(r).toBeTruthy();
  });

  it('formatRelativeTime: hours ago', () => {
    const past = new Date(Date.now() - 3 * 60 * 60 * 1000);
    const r = ArabicLocalizationService.formatRelativeTime(past, 'en');
    expect(r).toBeTruthy();
  });

  it('formatRelativeTime: days ago', () => {
    const past = new Date(Date.now() - 5 * 24 * 60 * 60 * 1000);
    const r = ArabicLocalizationService.formatRelativeTime(past, 'en');
    expect(r).toBeTruthy();
  });

  it('formatRelativeTime: months ago', () => {
    const past = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000);
    const r = ArabicLocalizationService.formatRelativeTime(past, 'en');
    expect(r).toBeTruthy();
  });

  it('formatRelativeTime: years ago', () => {
    const past = new Date(Date.now() - 400 * 24 * 60 * 60 * 1000);
    const r = ArabicLocalizationService.formatRelativeTime(past, 'en');
    expect(r).toBeTruthy();
  });
});

describe('ArabicLocalizationService.validation — names + IDs', () => {
  it('validateArabicName: accepts Arabic name', () => {
    expect(ArabicLocalizationService.validateArabicName('محمد علي')).toBe(true);
  });

  it('validateArabicName: rejects empty', () => {
    expect(ArabicLocalizationService.validateArabicName('')).toBe(false);
    expect(ArabicLocalizationService.validateArabicName('   ')).toBe(false);
  });

  it('validateArabicName: rejects English chars', () => {
    expect(ArabicLocalizationService.validateArabicName('John Smith')).toBe(false);
  });

  it('validateEmiratesId: accepts valid 784 format', () => {
    expect(ArabicLocalizationService.validateEmiratesId('784-1990-1234567-1')).toBe(true);
  });

  it('validateEmiratesId: rejects bad prefix', () => {
    expect(ArabicLocalizationService.validateEmiratesId('123-1990-1234567-1')).toBe(false);
  });

  it('validateSaudiId: accepts starting with 1 or 2', () => {
    expect(ArabicLocalizationService.validateSaudiId('1234567890')).toBe(true);
    expect(ArabicLocalizationService.validateSaudiId('2345678901')).toBe(true);
  });

  it('validateSaudiId: rejects starting with 3+', () => {
    expect(ArabicLocalizationService.validateSaudiId('9234567890')).toBe(false);
  });

  it('validateBahrainCPR: accepts 9 digits', () => {
    expect(ArabicLocalizationService.validateBahrainCPR('123456789')).toBe(true);
  });

  it('validateBahrainCPR: rejects wrong length', () => {
    expect(ArabicLocalizationService.validateBahrainCPR('12345')).toBe(false);
  });

  it('validateQatarQID: accepts 11 digits', () => {
    expect(ArabicLocalizationService.validateQatarQID('12345678901')).toBe(true);
  });

  it('validateAadhaar: accepts 12 digits starting 2-9', () => {
    expect(ArabicLocalizationService.validateAadhaar('234567890123')).toBe(true);
  });

  it('validateAadhaar: strips whitespace', () => {
    expect(ArabicLocalizationService.validateAadhaar('2345 6789 0123')).toBe(true);
  });

  it('validateAadhaar: rejects starting with 0 or 1', () => {
    expect(ArabicLocalizationService.validateAadhaar('012345678901')).toBe(false);
  });

  it('validatePAN: accepts ABCDE1234F', () => {
    expect(ArabicLocalizationService.validatePAN('ABCDE1234F')).toBe(true);
  });

  it('validatePAN: upper-cases input', () => {
    expect(ArabicLocalizationService.validatePAN('abcde1234f')).toBe(true);
  });

  it('validatePAN: rejects bad shape', () => {
    expect(ArabicLocalizationService.validatePAN('1234567890')).toBe(false);
  });
});

describe('ArabicLocalizationService.validateGCCMobile', () => {
  it('UAE mobile with +971 prefix', () => {
    expect(ArabicLocalizationService.validateGCCMobile('+971501234567', 'AE')).toBe(true);
  });

  it('UAE mobile without country prefix', () => {
    expect(ArabicLocalizationService.validateGCCMobile('501234567', 'AE')).toBe(true);
  });

  it('SA mobile', () => {
    expect(ArabicLocalizationService.validateGCCMobile('+966501234567', 'SA')).toBe(true);
  });

  it('IN mobile starts with 6-9', () => {
    expect(ArabicLocalizationService.validateGCCMobile('+919876543210', 'IN')).toBe(true);
  });

  it('IN mobile rejects starts with 1-5', () => {
    expect(ArabicLocalizationService.validateGCCMobile('+911234567890', 'IN')).toBe(false);
  });

  it('no countryCode: matches any pattern', () => {
    expect(ArabicLocalizationService.validateGCCMobile('+971501234567')).toBe(true);
  });

  it('no countryCode: rejects non-matching number', () => {
    expect(ArabicLocalizationService.validateGCCMobile('+1234')).toBe(false);
  });

  it('strips spaces and dashes', () => {
    expect(ArabicLocalizationService.validateGCCMobile('+971 50-123 4567', 'AE')).toBe(true);
  });
});

describe('ArabicLocalizationService.validateIBAN', () => {
  it('valid UAE IBAN (23 chars, starts AE)', () => {
    const iban = 'AE070331234567890123456';
    expect(ArabicLocalizationService.validateIBAN(iban, 'AE')).toBe(true);
  });

  it('rejects UAE IBAN with wrong length', () => {
    expect(ArabicLocalizationService.validateIBAN('AE12345', 'AE')).toBe(false);
  });

  it('rejects when country code mismatch', () => {
    const iban = 'AE070331234567890123456';
    expect(ArabicLocalizationService.validateIBAN(iban, 'SA')).toBe(false);
  });

  it('strips whitespace and uppercases', () => {
    const iban = 'ae07 0331 2345 6789 0123 456';
    expect(ArabicLocalizationService.validateIBAN(iban, 'AE')).toBe(true);
  });

  it('generic IBAN validation without country code', () => {
    expect(ArabicLocalizationService.validateIBAN('GB82WEST12345698765432')).toBe(true);
  });

  it('rejects junk strings', () => {
    expect(ArabicLocalizationService.validateIBAN('not-an-iban')).toBe(false);
  });
});

describe('ArabicLocalizationService.validateForm', () => {
  it('passes when all rules satisfied', () => {
    const r = ArabicLocalizationService.validateForm(
      { id: '784-1990-1234567-1', email: 'a@b.com' },
      [
        { field: 'id', type: 'emiratesId' },
        { field: 'email', type: 'email' },
      ]
    );
    expect(r.isValid).toBe(true);
    expect(r.errors).toEqual([]);
  });

  it('flags missing required field', () => {
    const r = ArabicLocalizationService.validateForm({ name: '' }, [
      { field: 'name', type: 'required' },
    ]);
    expect(r.isValid).toBe(false);
    expect(r.errors[0].field).toBe('name');
    expect(r.errors[0].messageAr).toBeTruthy();
  });

  it('skips validation for empty optional fields', () => {
    const r = ArabicLocalizationService.validateForm({ phone: '' }, [
      { field: 'phone', type: 'gccMobile' },
    ]);
    expect(r.isValid).toBe(true);
  });

  it('flags invalid emirates ID', () => {
    const r = ArabicLocalizationService.validateForm({ id: '999-abc' }, [
      { field: 'id', type: 'emiratesId' },
    ]);
    expect(r.isValid).toBe(false);
  });

  it('flags invalid email', () => {
    const r = ArabicLocalizationService.validateForm({ email: 'not-an-email' }, [
      { field: 'email', type: 'email' },
    ]);
    expect(r.isValid).toBe(false);
  });

  it('passes country-specific mobile validation', () => {
    const r = ArabicLocalizationService.validateForm({ mobile: '+971501234567' }, [
      { field: 'mobile', type: 'gccMobile', countryCode: 'AE' },
    ]);
    expect(r.isValid).toBe(true);
  });

  it('flags invalid IBAN', () => {
    const r = ArabicLocalizationService.validateForm({ iban: 'INVALID' }, [
      { field: 'iban', type: 'iban', countryCode: 'AE' },
    ]);
    expect(r.isValid).toBe(false);
  });
});

describe('ArabicLocalizationService.RTL utilities', () => {
  beforeEach(() => ArabicLocalizationService.setLocale('en'));

  it('getTextAlign: text-left for English', () => {
    expect(ArabicLocalizationService.getTextAlign('en')).toBe('text-left');
  });

  it('getTextAlign: text-right for Arabic', () => {
    expect(ArabicLocalizationService.getTextAlign('ar')).toBe('text-right');
  });

  it('getDirAttribute: ltr/rtl mapping', () => {
    expect(ArabicLocalizationService.getDirAttribute('en')).toBe('ltr');
    expect(ArabicLocalizationService.getDirAttribute('ar')).toBe('rtl');
  });

  it('mirrorCSSProperty: returns input for English', () => {
    expect(ArabicLocalizationService.mirrorCSSProperty('margin-left', 'en')).toBe('margin-left');
  });

  it('mirrorCSSProperty: mirrors for Arabic', () => {
    expect(ArabicLocalizationService.mirrorCSSProperty('margin-left', 'ar')).toBe('margin-right');
    expect(ArabicLocalizationService.mirrorCSSProperty('padding-right', 'ar')).toBe('padding-left');
    expect(ArabicLocalizationService.mirrorCSSProperty('left', 'ar')).toBe('right');
  });

  it('mirrorCSSProperty: unknown property unchanged in Arabic', () => {
    expect(ArabicLocalizationService.mirrorCSSProperty('color', 'ar')).toBe('color');
  });
});

describe('ArabicLocalizationService.translation introspection', () => {
  it('getAllTranslationKeys returns a non-empty array', () => {
    const keys = ArabicLocalizationService.getAllTranslationKeys();
    expect(Array.isArray(keys)).toBe(true);
    expect(keys.length).toBeGreaterThan(0);
  });

  it('getModuleTranslations filters by module prefix', () => {
    const keys = ArabicLocalizationService.getAllTranslationKeys();
    const moduleName = keys[0]?.split('.')[0];
    if (moduleName) {
      const r = ArabicLocalizationService.getModuleTranslations(moduleName);
      expect(r.length).toBeGreaterThan(0);
      r.forEach((t) => expect(t.key.startsWith(moduleName + '.')).toBe(true));
    }
  });

  it('getTranslationCoverage reports module counts', () => {
    const r = ArabicLocalizationService.getTranslationCoverage();
    expect(r.totalKeys).toBeGreaterThan(0);
    expect(r.modules.length).toBeGreaterThan(0);
    r.modules.forEach((m) => {
      expect(m.keyCount).toBeGreaterThan(0);
      expect(m.module).toBeTruthy();
    });
  });
});
