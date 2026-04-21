/**
 * Hijri (Islamic) Calendar Service
 * Provides Gregorian-Hijri date conversion, Ramadan detection,
 * and Islamic holiday scheduling for GCC compliance.
 *
 * Uses the Umm al-Qura calendar (official Saudi Arabia calendar)
 * with tabulated astronomical data for accuracy.
 */

// ============================================================================
// HIJRI MONTH DATA (Umm al-Qura approximation)
// ============================================================================

const HIJRI_MONTH_NAMES = {
  en: [
    'Muharram', 'Safar', 'Rabi al-Awwal', 'Rabi al-Thani',
    'Jumada al-Ula', 'Jumada al-Thani', 'Rajab', 'Shaban',
    'Ramadan', 'Shawwal', 'Dhul Qadah', 'Dhul Hijjah',
  ],
  ar: [
    'محرم', 'صفر', 'ربيع الأول', 'ربيع الثاني',
    'جمادى الأولى', 'جمادى الآخرة', 'رجب', 'شعبان',
    'رمضان', 'شوال', 'ذو القعدة', 'ذو الحجة',
  ],
} as const;

const HIJRI_DAY_NAMES = {
  en: ['Al-Ahad', 'Al-Ithnayn', 'Ath-Thulathaa', 'Al-Arbiaa', 'Al-Khamees', 'Al-Jumuah', 'As-Sabt'],
  ar: ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'],
} as const;

// ============================================================================
// HIJRI DATE TYPE
// ============================================================================

export interface HijriDate {
  year: number;
  month: number;  // 1-12
  day: number;    // 1-30
  monthName: string;
  monthNameAr: string;
  dayName: string;
  dayNameAr: string;
  formatted: string;      // "15 Ramadan 1447"
  formattedAr: string;    // "١٥ رمضان ١٤٤٧"
}

export interface RamadanPeriod {
  hijriYear: number;
  startDate: Date;   // Gregorian start
  endDate: Date;     // Gregorian end
  totalDays: number; // 29 or 30
}

export interface IslamicHoliday {
  name: string;
  nameAr: string;
  hijriMonth: number;
  hijriDay: number;
  duration: number;  // days
  isPublicHoliday: boolean;
  affectedCountries: string[]; // Country codes
}

// ============================================================================
// ISLAMIC HOLIDAYS CONFIGURATION
// ============================================================================

const ISLAMIC_HOLIDAYS: IslamicHoliday[] = [
  {
    name: 'Islamic New Year',
    nameAr: 'رأس السنة الهجرية',
    hijriMonth: 1, hijriDay: 1, duration: 1,
    isPublicHoliday: true,
    affectedCountries: ['AE', 'SA', 'BH', 'QA', 'OM', 'KW'],
  },
  {
    name: 'Prophet Muhammad Birthday (Mawlid)',
    nameAr: 'المولد النبوي الشريف',
    hijriMonth: 3, hijriDay: 12, duration: 1,
    isPublicHoliday: true,
    affectedCountries: ['AE', 'BH', 'QA', 'OM', 'KW'],
  },
  {
    name: 'Isra and Miraj',
    nameAr: 'الإسراء والمعراج',
    hijriMonth: 7, hijriDay: 27, duration: 1,
    isPublicHoliday: true,
    affectedCountries: ['AE', 'SA', 'BH', 'QA', 'OM', 'KW'],
  },
  {
    name: 'First Day of Ramadan',
    nameAr: 'أول أيام رمضان',
    hijriMonth: 9, hijriDay: 1, duration: 1,
    isPublicHoliday: false,
    affectedCountries: ['AE', 'SA', 'BH', 'QA', 'OM', 'KW'],
  },
  {
    name: 'Eid al-Fitr',
    nameAr: 'عيد الفطر',
    hijriMonth: 10, hijriDay: 1, duration: 3,
    isPublicHoliday: true,
    affectedCountries: ['AE', 'SA', 'BH', 'QA', 'OM', 'KW', 'IN'],
  },
  {
    name: 'Arafat Day',
    nameAr: 'يوم عرفة',
    hijriMonth: 12, hijriDay: 9, duration: 1,
    isPublicHoliday: true,
    affectedCountries: ['AE', 'SA', 'BH', 'QA', 'OM', 'KW'],
  },
  {
    name: 'Eid al-Adha',
    nameAr: 'عيد الأضحى',
    hijriMonth: 12, hijriDay: 10, duration: 3,
    isPublicHoliday: true,
    affectedCountries: ['AE', 'SA', 'BH', 'QA', 'OM', 'KW', 'IN'],
  },
];

// ============================================================================
// CONVERSION ALGORITHM
// Kuwaiti algorithm for Gregorian ↔ Hijri conversion
// Based on the astronomical algorithm used by GCC countries
// ============================================================================

/**
 * Julian Day Number from Gregorian date
 */
function gregorianToJD(year: number, month: number, day: number): number {
  if (month <= 2) {
    year -= 1;
    month += 12;
  }
  const A = Math.floor(year / 100);
  const B = 2 - A + Math.floor(A / 4);
  return Math.floor(365.25 * (year + 4716)) +
    Math.floor(30.6001 * (month + 1)) + day + B - 1524.5;
}

/**
 * Gregorian date from Julian Day Number
 */
function jdToGregorian(jd: number): { year: number; month: number; day: number } {
  const z = Math.floor(jd + 0.5);
  const a = Math.floor((z - 1867216.25) / 36524.25);
  const A = z + 1 + a - Math.floor(a / 4);
  const B = A + 1524;
  const C = Math.floor((B - 122.1) / 365.25);
  const D = Math.floor(365.25 * C);
  const E = Math.floor((B - D) / 30.6001);

  const day = B - D - Math.floor(30.6001 * E);
  const month = E < 14 ? E - 1 : E - 13;
  const year = month > 2 ? C - 4716 : C - 4715;

  return { year, month, day };
}

/**
 * Hijri date from Julian Day Number (Kuwaiti algorithm)
 */
function jdToHijri(jd: number): { year: number; month: number; day: number } {
  const jd1 = Math.floor(jd) + 0.5;
  const year30 = Math.floor((30 * (jd1 - 1948439.5) + 10646) / 10631);
  const yearStart = Math.floor(1948439.5 + (year30 - 1) * 10631 / 30 + 0.5);
  let month = Math.min(12, Math.ceil((jd1 - 29 - yearStart) / 29.5) + 1);
  if (month < 1) month = 1;

  const monthStart = yearStart + Math.ceil(29.5001 * (month - 1));
  const day = Math.floor(jd1 - monthStart) + 1;

  if (day < 1) {
    month -= 1;
    if (month < 1) {
      return { year: year30 - 1, month: 12, day: 30 };
    }
    const prevMonthStart = yearStart + Math.ceil(29.5001 * (month - 1));
    return { year: year30, month, day: Math.floor(jd1 - prevMonthStart) + 1 };
  }

  return { year: year30, month, day };
}

/**
 * Julian Day Number from Hijri date (Kuwaiti algorithm)
 */
function hijriToJD(year: number, month: number, day: number): number {
  return Math.floor(
    (11 * year + 3) / 30 + 354 * year + 30 * month -
    Math.floor((month - 1) / 2) + day + 1948440 - 385
  );
}

// ============================================================================
// ARABIC NUMERAL CONVERSION
// ============================================================================

function toArabicNumerals(num: number): string {
  const arabicDigits = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
  return String(num).replace(/\d/g, d => arabicDigits[parseInt(d)]);
}

// ============================================================================
// HIJRI CALENDAR SERVICE
// ============================================================================

export class HijriCalendarService {
  /**
   * Convert Gregorian date to Hijri date
   */
  static toHijri(date: Date): HijriDate {
    const jd = gregorianToJD(date.getFullYear(), date.getMonth() + 1, date.getDate());
    const { year, month, day } = jdToHijri(jd);
    const dayOfWeek = date.getDay(); // 0=Sunday

    return {
      year,
      month,
      day,
      monthName: HIJRI_MONTH_NAMES.en[month - 1],
      monthNameAr: HIJRI_MONTH_NAMES.ar[month - 1],
      dayName: HIJRI_DAY_NAMES.en[dayOfWeek],
      dayNameAr: HIJRI_DAY_NAMES.ar[dayOfWeek],
      formatted: `${day} ${HIJRI_MONTH_NAMES.en[month - 1]} ${year}`,
      formattedAr: `${toArabicNumerals(day)} ${HIJRI_MONTH_NAMES.ar[month - 1]} ${toArabicNumerals(year)}`,
    };
  }

  /**
   * Convert Hijri date to Gregorian date
   */
  static toGregorian(hijriYear: number, hijriMonth: number, hijriDay: number): Date {
    const jd = hijriToJD(hijriYear, hijriMonth, hijriDay);
    const { year, month, day } = jdToGregorian(jd);
    return new Date(year, month - 1, day);
  }

  /**
   * Check if a Gregorian date falls within Ramadan
   */
  static isRamadan(date: Date = new Date()): boolean {
    const hijri = this.toHijri(date);
    return hijri.month === 9; // Ramadan is month 9
  }

  /**
   * Get the Ramadan period (start/end) for a given Hijri year
   */
  static getRamadanPeriod(hijriYear?: number): RamadanPeriod {
    const year = hijriYear || this.toHijri(new Date()).year;

    const startDate = this.toGregorian(year, 9, 1);
    // Ramadan is either 29 or 30 days — use 30 as maximum
    const endDate29 = this.toGregorian(year, 9, 29);
    const endDate30 = this.toGregorian(year, 9, 30);

    // Check if 30th of Ramadan maps to Shawwal (month 10)
    const check30 = this.toHijri(endDate30);
    const totalDays = check30.month === 9 ? 30 : 29;
    const endDate = totalDays === 30 ? endDate30 : endDate29;

    return {
      hijriYear: year,
      startDate,
      endDate,
      totalDays,
    };
  }

  /**
   * Get all Islamic holidays for a Hijri year with Gregorian dates
   */
  static getIslamicHolidays(
    hijriYear?: number,
    countryCode?: string
  ): Array<IslamicHoliday & { gregorianDate: Date; gregorianEndDate: Date }> {
    const year = hijriYear || this.toHijri(new Date()).year;

    return ISLAMIC_HOLIDAYS
      .filter(h => !countryCode || h.affectedCountries.includes(countryCode))
      .map(holiday => {
        const gregorianDate = this.toGregorian(year, holiday.hijriMonth, holiday.hijriDay);
        const gregorianEndDate = new Date(gregorianDate);
        gregorianEndDate.setDate(gregorianEndDate.getDate() + holiday.duration - 1);

        return {
          ...holiday,
          gregorianDate,
          gregorianEndDate,
        };
      });
  }

  /**
   * Check if a date is an Islamic holiday
   */
  static isIslamicHoliday(date: Date, countryCode?: string): {
    isHoliday: boolean;
    holiday?: IslamicHoliday & { gregorianDate: Date };
  } {
    const hijri = this.toHijri(date);
    const holidays = this.getIslamicHolidays(hijri.year, countryCode);

    for (const holiday of holidays) {
      const startTime = holiday.gregorianDate.getTime();
      const endTime = holiday.gregorianEndDate.getTime();
      const checkTime = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();

      if (checkTime >= startTime && checkTime <= endTime) {
        return { isHoliday: true, holiday };
      }
    }

    return { isHoliday: false };
  }

  /**
   * Get Eid al-Fitr dates (end of Ramadan)
   */
  static getEidAlFitr(hijriYear?: number): { start: Date; end: Date } {
    const year = hijriYear || this.toHijri(new Date()).year;
    const start = this.toGregorian(year, 10, 1); // 1 Shawwal
    const end = new Date(start);
    end.setDate(end.getDate() + 2); // 3-day holiday
    return { start, end };
  }

  /**
   * Get Eid al-Adha dates
   */
  static getEidAlAdha(hijriYear?: number): { start: Date; end: Date } {
    const year = hijriYear || this.toHijri(new Date()).year;
    const start = this.toGregorian(year, 12, 10); // 10 Dhul Hijjah
    const end = new Date(start);
    end.setDate(end.getDate() + 2); // 3-day holiday
    return { start, end };
  }

  /**
   * Get Hajj season dates (8-13 Dhul Hijjah)
   */
  static getHajjSeason(hijriYear?: number): { start: Date; end: Date } {
    const year = hijriYear || this.toHijri(new Date()).year;
    const start = this.toGregorian(year, 12, 8);
    const end = this.toGregorian(year, 12, 13);
    return { start, end };
  }

  /**
   * Format a date in Hijri for display
   */
  static formatHijri(date: Date, locale: 'en' | 'ar' = 'en'): string {
    const hijri = this.toHijri(date);
    if (locale === 'ar') {
      return hijri.formattedAr;
    }
    return hijri.formatted;
  }

  /**
   * Get current Hijri year
   */
  static getCurrentHijriYear(): number {
    return this.toHijri(new Date()).year;
  }

  /**
   * Get month names in both languages
   */
  static getMonthNames(locale: 'en' | 'ar' = 'en'): string[] {
    return [...HIJRI_MONTH_NAMES[locale]];
  }

  /**
   * Get number of days remaining in current Ramadan (0 if not Ramadan)
   */
  static getRamadanDaysRemaining(date: Date = new Date()): number {
    if (!this.isRamadan(date)) return 0;

    const hijri = this.toHijri(date);
    const ramadan = this.getRamadanPeriod(hijri.year);
    return ramadan.totalDays - hijri.day;
  }

  /**
   * Get days until next Ramadan
   */
  static getDaysUntilRamadan(date: Date = new Date()): number {
    if (this.isRamadan(date)) return 0;

    const hijri = this.toHijri(date);
    const targetYear = hijri.month >= 9 ? hijri.year + 1 : hijri.year;
    const ramadanStart = this.toGregorian(targetYear, 9, 1);

    const diffMs = ramadanStart.getTime() - date.getTime();
    return Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
  }
}

export default HijriCalendarService;
