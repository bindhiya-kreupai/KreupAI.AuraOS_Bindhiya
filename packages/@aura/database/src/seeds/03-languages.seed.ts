/**
 * @module LanguagesSeed
 * @description Seed data for languages
 * @project AURA HCM Platform
 * @reference docs/aura-master-instructions.md
 */

import { Language } from '@aura/types';

export const languagesSeed: Omit<Language, 'id' | 'createdAt' | 'updatedAt' | 'isDeleted'>[] = [
  {
    code: 'en',
    name: 'English',
    nativeName: 'English',
    direction: 'ltr',
    isSupported: true,
    isActive: true,
  },
  {
    code: 'hi',
    name: 'Hindi',
    nativeName: 'हिन्दी',
    direction: 'ltr',
    isSupported: true,
    isActive: true,
  },
  {
    code: 'es',
    name: 'Spanish',
    nativeName: 'Español',
    direction: 'ltr',
    isSupported: true,
    isActive: true,
  },
  {
    code: 'fr',
    name: 'French',
    nativeName: 'Français',
    direction: 'ltr',
    isSupported: true,
    isActive: true,
  },
  {
    code: 'de',
    name: 'German',
    nativeName: 'Deutsch',
    direction: 'ltr',
    isSupported: true,
    isActive: true,
  },
  {
    code: 'zh',
    name: 'Chinese',
    nativeName: '中文',
    direction: 'ltr',
    isSupported: true,
    isActive: true,
  },
  {
    code: 'ja',
    name: 'Japanese',
    nativeName: '日本語',
    direction: 'ltr',
    isSupported: true,
    isActive: true,
  },
  {
    code: 'ar',
    name: 'Arabic',
    nativeName: 'العربية',
    direction: 'rtl',
    isSupported: true,
    isActive: true,
  },
  {
    code: 'pt',
    name: 'Portuguese',
    nativeName: 'Português',
    direction: 'ltr',
    isSupported: true,
    isActive: true,
  },
  {
    code: 'ru',
    name: 'Russian',
    nativeName: 'Русский',
    direction: 'ltr',
    isSupported: false,
    isActive: true,
  },
  {
    code: 'ko',
    name: 'Korean',
    nativeName: '한국어',
    direction: 'ltr',
    isSupported: false,
    isActive: true,
  },
  {
    code: 'it',
    name: 'Italian',
    nativeName: 'Italiano',
    direction: 'ltr',
    isSupported: false,
    isActive: true,
  },
];
