/**
 * @module CountriesCurrenciesSeed
 * @description Comprehensive country and currency data for all GCC countries,
 *   India, US, and UK with fiscal year, timezone, weekend, date format,
 *   phone format, and tax ID label metadata.
 * @project AuraOS Enterprise HCM — Phase 2 GAP Closure
 * @section Task Group A — Seed 8
 */

import { PrismaClient } from '@prisma/client';

// ---------------------------------------------------------------------------
// Type definitions
// ---------------------------------------------------------------------------

export interface CountryConfig {
  isoCode: string;
  iso3Code: string;
  name: string;
  nativeName: string;
  currencyCode: string;
  callingCode: string;
  timezone: string;
  timezoneOffset: string;
  weekendDays: string[];
  fiscalYearStart: string;
  dateFormat: string;
  phoneFormat: string;
  taxIdLabel: string;
  taxIdFormat: string;
  flag: string;
  region: string;
  subRegion: string;
  languages: string[];
  isGCC: boolean;
}

export interface CurrencyConfig {
  code: string;
  name: string;
  symbol: string;
  nativeSymbol: string;
  decimalPlaces: number;
  decimalSeparator: string;
  thousandsSeparator: string;
  symbolPosition: 'before' | 'after';
  countryCodes: string[];
}

// ---------------------------------------------------------------------------
// Country configurations
// ---------------------------------------------------------------------------

export const countriesConfig: CountryConfig[] = [
  // UAE
  {
    isoCode: 'AE',
    iso3Code: 'ARE',
    name: 'United Arab Emirates',
    nativeName: 'الإمارات العربية المتحدة',
    currencyCode: 'AED',
    callingCode: '+971',
    timezone: 'Asia/Dubai',
    timezoneOffset: 'UTC+4',
    weekendDays: ['Saturday', 'Sunday'],
    fiscalYearStart: '01-01',
    dateFormat: 'DD/MM/YYYY',
    phoneFormat: 'XXX-XXX-XXXX',
    taxIdLabel: 'TRN (Tax Registration Number)',
    taxIdFormat: '100XXXXXXXXXX',
    flag: '🇦🇪',
    region: 'Asia',
    subRegion: 'Western Asia (GCC)',
    languages: ['Arabic', 'English'],
    isGCC: true,
  },

  // KSA
  {
    isoCode: 'SA',
    iso3Code: 'SAU',
    name: 'Saudi Arabia',
    nativeName: 'المملكة العربية السعودية',
    currencyCode: 'SAR',
    callingCode: '+966',
    timezone: 'Asia/Riyadh',
    timezoneOffset: 'UTC+3',
    weekendDays: ['Friday', 'Saturday'],
    fiscalYearStart: '01-01',
    dateFormat: 'DD/MM/YYYY',
    phoneFormat: 'XXX-XXX-XXXX',
    taxIdLabel: 'VAT Registration Number',
    taxIdFormat: '3XXXXXXXXXX003',
    flag: '🇸🇦',
    region: 'Asia',
    subRegion: 'Western Asia (GCC)',
    languages: ['Arabic'],
    isGCC: true,
  },

  // Bahrain
  {
    isoCode: 'BH',
    iso3Code: 'BHR',
    name: 'Bahrain',
    nativeName: 'مملكة البحرين',
    currencyCode: 'BHD',
    callingCode: '+973',
    timezone: 'Asia/Bahrain',
    timezoneOffset: 'UTC+3',
    weekendDays: ['Friday', 'Saturday'],
    fiscalYearStart: '01-01',
    dateFormat: 'DD/MM/YYYY',
    phoneFormat: 'XXXX-XXXX',
    taxIdLabel: 'Commercial Registration No.',
    taxIdFormat: 'XXXXXXXXX',
    flag: '🇧🇭',
    region: 'Asia',
    subRegion: 'Western Asia (GCC)',
    languages: ['Arabic', 'English'],
    isGCC: true,
  },

  // Oman
  {
    isoCode: 'OM',
    iso3Code: 'OMN',
    name: 'Oman',
    nativeName: 'سلطنة عُمان',
    currencyCode: 'OMR',
    callingCode: '+968',
    timezone: 'Asia/Muscat',
    timezoneOffset: 'UTC+4',
    weekendDays: ['Friday', 'Saturday'],
    fiscalYearStart: '01-01',
    dateFormat: 'DD/MM/YYYY',
    phoneFormat: 'XXXX-XXXX',
    taxIdLabel: 'Tax Identification Number',
    taxIdFormat: 'OMXXXXXXXXXX',
    flag: '🇴🇲',
    region: 'Asia',
    subRegion: 'Western Asia (GCC)',
    languages: ['Arabic', 'English'],
    isGCC: true,
  },

  // Qatar
  {
    isoCode: 'QA',
    iso3Code: 'QAT',
    name: 'Qatar',
    nativeName: 'دولة قطر',
    currencyCode: 'QAR',
    callingCode: '+974',
    timezone: 'Asia/Qatar',
    timezoneOffset: 'UTC+3',
    weekendDays: ['Friday', 'Saturday'],
    fiscalYearStart: '01-01',
    dateFormat: 'DD/MM/YYYY',
    phoneFormat: 'XXXX-XXXX',
    taxIdLabel: 'Qatar Tax Identification Number',
    taxIdFormat: 'QXXXXXXXXXX',
    flag: '🇶🇦',
    region: 'Asia',
    subRegion: 'Western Asia (GCC)',
    languages: ['Arabic', 'English'],
    isGCC: true,
  },

  // Kuwait
  {
    isoCode: 'KW',
    iso3Code: 'KWT',
    name: 'Kuwait',
    nativeName: 'دولة الكويت',
    currencyCode: 'KWD',
    callingCode: '+965',
    timezone: 'Asia/Kuwait',
    timezoneOffset: 'UTC+3',
    weekendDays: ['Friday', 'Saturday'],
    fiscalYearStart: '04-01',
    dateFormat: 'DD/MM/YYYY',
    phoneFormat: 'XXXX-XXXX',
    taxIdLabel: 'Civil ID',
    taxIdFormat: 'XXXXXXXXXXX',
    flag: '🇰🇼',
    region: 'Asia',
    subRegion: 'Western Asia (GCC)',
    languages: ['Arabic', 'English'],
    isGCC: true,
  },

  // India
  {
    isoCode: 'IN',
    iso3Code: 'IND',
    name: 'India',
    nativeName: 'भारत गणराज्य',
    currencyCode: 'INR',
    callingCode: '+91',
    timezone: 'Asia/Kolkata',
    timezoneOffset: 'UTC+5:30',
    weekendDays: ['Saturday', 'Sunday'],
    fiscalYearStart: '04-01',
    dateFormat: 'DD/MM/YYYY',
    phoneFormat: 'XXXXX-XXXXX',
    taxIdLabel: 'PAN (Permanent Account Number)',
    taxIdFormat: 'ABCDE1234F',
    flag: '🇮🇳',
    region: 'Asia',
    subRegion: 'Southern Asia',
    languages: ['Hindi', 'English'],
    isGCC: false,
  },

  // United States
  {
    isoCode: 'US',
    iso3Code: 'USA',
    name: 'United States',
    nativeName: 'United States of America',
    currencyCode: 'USD',
    callingCode: '+1',
    timezone: 'America/New_York',
    timezoneOffset: 'UTC-5 / UTC-8 (varies by state)',
    weekendDays: ['Saturday', 'Sunday'],
    fiscalYearStart: '01-01',
    dateFormat: 'MM/DD/YYYY',
    phoneFormat: '(XXX) XXX-XXXX',
    taxIdLabel: 'EIN (Employer Identification Number) / SSN',
    taxIdFormat: 'XX-XXXXXXX',
    flag: '🇺🇸',
    region: 'Americas',
    subRegion: 'Northern America',
    languages: ['English'],
    isGCC: false,
  },

  // United Kingdom
  {
    isoCode: 'GB',
    iso3Code: 'GBR',
    name: 'United Kingdom',
    nativeName: 'United Kingdom of Great Britain and Northern Ireland',
    currencyCode: 'GBP',
    callingCode: '+44',
    timezone: 'Europe/London',
    timezoneOffset: 'UTC+0 / UTC+1 (BST)',
    weekendDays: ['Saturday', 'Sunday'],
    fiscalYearStart: '04-06',
    dateFormat: 'DD/MM/YYYY',
    phoneFormat: '+44 XXXX XXXXXX',
    taxIdLabel: 'UTR (Unique Taxpayer Reference) / NI Number',
    taxIdFormat: 'XXXXXXXXXX / XX XX XX XX X',
    flag: '🇬🇧',
    region: 'Europe',
    subRegion: 'Northern Europe',
    languages: ['English'],
    isGCC: false,
  },
];

// ---------------------------------------------------------------------------
// Currency configurations
// ---------------------------------------------------------------------------

export const currenciesConfig: CurrencyConfig[] = [
  {
    code: 'AED',
    name: 'UAE Dirham',
    symbol: 'AED',
    nativeSymbol: 'د.إ',
    decimalPlaces: 2,
    decimalSeparator: '.',
    thousandsSeparator: ',',
    symbolPosition: 'before',
    countryCodes: ['AE'],
  },
  {
    code: 'SAR',
    name: 'Saudi Riyal',
    symbol: 'SAR',
    nativeSymbol: 'ر.س',
    decimalPlaces: 2,
    decimalSeparator: '.',
    thousandsSeparator: ',',
    symbolPosition: 'before',
    countryCodes: ['SA'],
  },
  {
    code: 'BHD',
    name: 'Bahraini Dinar',
    symbol: 'BHD',
    nativeSymbol: 'د.ب',
    decimalPlaces: 3,
    decimalSeparator: '.',
    thousandsSeparator: ',',
    symbolPosition: 'before',
    countryCodes: ['BH'],
  },
  {
    code: 'OMR',
    name: 'Omani Rial',
    symbol: 'OMR',
    nativeSymbol: 'ر.ع.',
    decimalPlaces: 3,
    decimalSeparator: '.',
    thousandsSeparator: ',',
    symbolPosition: 'before',
    countryCodes: ['OM'],
  },
  {
    code: 'QAR',
    name: 'Qatari Riyal',
    symbol: 'QAR',
    nativeSymbol: 'ر.ق',
    decimalPlaces: 2,
    decimalSeparator: '.',
    thousandsSeparator: ',',
    symbolPosition: 'before',
    countryCodes: ['QA'],
  },
  {
    code: 'KWD',
    name: 'Kuwaiti Dinar',
    symbol: 'KWD',
    nativeSymbol: 'د.ك',
    decimalPlaces: 3,
    decimalSeparator: '.',
    thousandsSeparator: ',',
    symbolPosition: 'before',
    countryCodes: ['KW'],
  },
  {
    code: 'INR',
    name: 'Indian Rupee',
    symbol: '₹',
    nativeSymbol: '₹',
    decimalPlaces: 2,
    decimalSeparator: '.',
    thousandsSeparator: ',',
    symbolPosition: 'before',
    countryCodes: ['IN'],
  },
  {
    code: 'USD',
    name: 'US Dollar',
    symbol: '$',
    nativeSymbol: '$',
    decimalPlaces: 2,
    decimalSeparator: '.',
    thousandsSeparator: ',',
    symbolPosition: 'before',
    countryCodes: ['US'],
  },
  {
    code: 'GBP',
    name: 'British Pound Sterling',
    symbol: '£',
    nativeSymbol: '£',
    decimalPlaces: 2,
    decimalSeparator: '.',
    thousandsSeparator: ',',
    symbolPosition: 'before',
    countryCodes: ['GB'],
  },
];

/**
 * Seed countries and currencies into their respective Prisma models,
 * and store extended configuration metadata as SystemSettings.
 * Idempotent — safe to run multiple times.
 */
export async function seedCountriesCurrencies(prisma: PrismaClient): Promise<void> {
  console.log('  Seeding countries and currencies...');
  let countryCount = 0;
  let currencyCount = 0;

  // Seed Country model
  for (const country of countriesConfig) {
    await prisma.country.upsert({
      where: { isoCode: country.isoCode },
      update: {
        name: country.name,
        currency: country.currencyCode,
      },
      create: {
        isoCode: country.isoCode,
        name: country.name,
        currency: country.currencyCode,
      },
    });

    // Store extended metadata as SystemSetting
    const metaKey = `country_config.${country.isoCode.toLowerCase()}`;
    await prisma.systemSetting.upsert({
      where: { key: metaKey },
      update: { value: JSON.stringify(country), description: `Country configuration for ${country.name}` },
      create: {
        key: metaKey,
        value: JSON.stringify(country),
        group: 'country_configs',
        description: `Country configuration for ${country.name} (${country.isoCode}) — ${country.subRegion}`,
      },
    });

    countryCount++;
  }

  // Seed Currency model
  for (const currency of currenciesConfig) {
    const existing = await prisma.currency.findUnique({ where: { code: currency.code } });
    if (!existing) {
      await prisma.currency.create({
        data: {
          code: currency.code,
          name: currency.name,
          symbol: currency.symbol,
        },
      });
    }

    // Store extended metadata as SystemSetting
    const metaKey = `currency_config.${currency.code.toLowerCase()}`;
    await prisma.systemSetting.upsert({
      where: { key: metaKey },
      update: { value: JSON.stringify(currency), description: `Currency configuration for ${currency.name}` },
      create: {
        key: metaKey,
        value: JSON.stringify(currency),
        group: 'currency_configs',
        description: `Currency configuration for ${currency.code} — ${currency.name}`,
      },
    });

    currencyCount++;
  }

  console.log(`  ✓ Countries: ${countryCount} country records seeded (GCC + India + US + UK)`);
  console.log(`  ✓ Currencies: ${currencyCount} currency records seeded`);
}
