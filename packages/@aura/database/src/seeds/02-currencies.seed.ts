/**
 * @module CurrenciesSeed
 * @description Seed data for currencies
 * @project AURA HCM Platform
 * @reference docs/aura-master-instructions.md
 */

import { Currency } from '@aura/types';

export const currenciesSeed: Omit<Currency, 'id' | 'createdAt' | 'updatedAt' | 'isDeleted'>[] = [
  {
    code: 'INR',
    name: 'Indian Rupee',
    symbol: '₹',
    decimalPlaces: 2,
    countries: ['IN'],
    isActive: true,
  },
  {
    code: 'USD',
    name: 'United States Dollar',
    symbol: '$',
    decimalPlaces: 2,
    countries: ['US'],
    isActive: true,
  },
  {
    code: 'GBP',
    name: 'British Pound Sterling',
    symbol: '£',
    decimalPlaces: 2,
    countries: ['GB'],
    isActive: true,
  },
  {
    code: 'EUR',
    name: 'Euro',
    symbol: '€',
    decimalPlaces: 2,
    countries: ['DE', 'FR', 'IT', 'ES', 'NL', 'BE', 'AT', 'PT', 'IE', 'FI'],
    isActive: true,
  },
  {
    code: 'CAD',
    name: 'Canadian Dollar',
    symbol: 'C$',
    decimalPlaces: 2,
    countries: ['CA'],
    isActive: true,
  },
  {
    code: 'AUD',
    name: 'Australian Dollar',
    symbol: 'A$',
    decimalPlaces: 2,
    countries: ['AU'],
    isActive: true,
  },
  {
    code: 'SGD',
    name: 'Singapore Dollar',
    symbol: 'S$',
    decimalPlaces: 2,
    countries: ['SG'],
    isActive: true,
  },
  {
    code: 'AED',
    name: 'United Arab Emirates Dirham',
    symbol: 'د.إ',
    decimalPlaces: 2,
    countries: ['AE'],
    isActive: true,
  },
  {
    code: 'JPY',
    name: 'Japanese Yen',
    symbol: '¥',
    decimalPlaces: 0,
    countries: ['JP'],
    isActive: true,
  },
  {
    code: 'CNY',
    name: 'Chinese Yuan',
    symbol: '¥',
    decimalPlaces: 2,
    countries: ['CN'],
    isActive: true,
  },
  {
    code: 'CHF',
    name: 'Swiss Franc',
    symbol: 'CHF',
    decimalPlaces: 2,
    countries: ['CH'],
    isActive: true,
  },
  {
    code: 'BRL',
    name: 'Brazilian Real',
    symbol: 'R$',
    decimalPlaces: 2,
    countries: ['BR'],
    isActive: true,
  },
  {
    code: 'MXN',
    name: 'Mexican Peso',
    symbol: '$',
    decimalPlaces: 2,
    countries: ['MX'],
    isActive: true,
  },
  {
    code: 'ZAR',
    name: 'South African Rand',
    symbol: 'R',
    decimalPlaces: 2,
    countries: ['ZA'],
    isActive: true,
  },
  {
    code: 'HKD',
    name: 'Hong Kong Dollar',
    symbol: 'HK$',
    decimalPlaces: 2,
    countries: ['HK'],
    isActive: true,
  },
];
