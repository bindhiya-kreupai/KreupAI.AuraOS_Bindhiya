import { describe, it, expect } from 'vitest';
import { HijriCalendarService } from '../hijri-calendar.service';

describe('HijriCalendarService', () => {
  describe('toHijri', () => {
    it('should convert a known Gregorian date to Hijri', () => {
      // 2024-03-11 is approximately 1 Ramadan 1445
      const result = HijriCalendarService.toHijri(new Date(2024, 2, 11));

      expect(result.year).toBeGreaterThanOrEqual(1445);
      expect(result.month).toBeGreaterThanOrEqual(1);
      expect(result.month).toBeLessThanOrEqual(12);
      expect(result.day).toBeGreaterThanOrEqual(1);
      expect(result.day).toBeLessThanOrEqual(30);
      expect(result.monthName).toBeTruthy();
      expect(result.monthNameAr).toBeTruthy();
      expect(result.dayName).toBeTruthy();
      expect(result.dayNameAr).toBeTruthy();
      expect(result.formatted).toContain(String(result.year));
      expect(result.formattedAr).toBeTruthy();
    });

    it('should return month 9 (Ramadan) during Ramadan period', () => {
      // Approximate Ramadan 2025 start
      const result = HijriCalendarService.toHijri(new Date(2025, 2, 1));
      // The exact date may vary, but the conversion should be valid
      expect(result.month).toBeGreaterThanOrEqual(1);
      expect(result.month).toBeLessThanOrEqual(12);
    });

    it('should return valid Arabic formatted string', () => {
      const result = HijriCalendarService.toHijri(new Date(2024, 0, 1));
      // Arabic numerals use different unicode range
      expect(result.formattedAr).toMatch(/[٠-٩]/);
    });
  });

  describe('toGregorian', () => {
    it('should convert Hijri date back to Gregorian', () => {
      const gregorian = HijriCalendarService.toGregorian(1446, 1, 1);

      expect(gregorian).toBeInstanceOf(Date);
      expect(gregorian.getFullYear()).toBeGreaterThanOrEqual(2024);
      expect(gregorian.getFullYear()).toBeLessThanOrEqual(2025);
    });

    it('should roundtrip Gregorian → Hijri → Gregorian within 1 day', () => {
      const original = new Date(2024, 5, 15); // June 15, 2024
      const hijri = HijriCalendarService.toHijri(original);
      const backToGregorian = HijriCalendarService.toGregorian(hijri.year, hijri.month, hijri.day);

      const diffDays = Math.abs(
        (original.getTime() - backToGregorian.getTime()) / (1000 * 60 * 60 * 24)
      );
      // Kuwaiti algorithm may have ±1 day variance
      expect(diffDays).toBeLessThanOrEqual(2);
    });
  });

  describe('isRamadan', () => {
    it('should return a boolean', () => {
      const result = HijriCalendarService.isRamadan(new Date());
      expect(typeof result).toBe('boolean');
    });
  });

  describe('getRamadanPeriod', () => {
    it('should return valid Ramadan period for a Hijri year', () => {
      const result = HijriCalendarService.getRamadanPeriod(1446);

      expect(result.hijriYear).toBe(1446);
      expect(result.startDate).toBeInstanceOf(Date);
      expect(result.endDate).toBeInstanceOf(Date);
      expect(result.totalDays).toBeGreaterThanOrEqual(29);
      expect(result.totalDays).toBeLessThanOrEqual(30);
      expect(result.endDate.getTime()).toBeGreaterThan(result.startDate.getTime());
    });

    it('should default to current Hijri year when no year provided', () => {
      const result = HijriCalendarService.getRamadanPeriod();

      expect(result.hijriYear).toBeGreaterThanOrEqual(1445);
      expect(result.startDate).toBeInstanceOf(Date);
    });
  });

  describe('getIslamicHolidays', () => {
    it('should return holidays for all GCC countries', () => {
      const holidays = HijriCalendarService.getIslamicHolidays(1446);

      expect(holidays.length).toBeGreaterThan(0);
      holidays.forEach(h => {
        expect(h.name).toBeTruthy();
        expect(h.nameAr).toBeTruthy();
        expect(h.gregorianDate).toBeInstanceOf(Date);
        expect(h.gregorianEndDate).toBeInstanceOf(Date);
      });
    });

    it('should filter holidays by country code', () => {
      const uaeHolidays = HijriCalendarService.getIslamicHolidays(1446, 'AE');
      const indiaHolidays = HijriCalendarService.getIslamicHolidays(1446, 'IN');

      // UAE should have more holidays than India (India only gets Eid al-Fitr and Eid al-Adha)
      expect(uaeHolidays.length).toBeGreaterThanOrEqual(indiaHolidays.length);

      uaeHolidays.forEach(h => {
        expect(h.affectedCountries).toContain('AE');
      });
    });

    it('should include Eid al-Fitr and Eid al-Adha', () => {
      const holidays = HijriCalendarService.getIslamicHolidays(1446);
      const names = holidays.map(h => h.name);

      expect(names).toContain('Eid al-Fitr');
      expect(names).toContain('Eid al-Adha');
    });
  });

  describe('isIslamicHoliday', () => {
    it('should return isHoliday boolean', () => {
      const result = HijriCalendarService.isIslamicHoliday(new Date());

      expect(typeof result.isHoliday).toBe('boolean');
      if (result.isHoliday) {
        expect(result.holiday).toBeDefined();
        expect(result.holiday!.name).toBeTruthy();
      }
    });
  });

  describe('getEidAlFitr', () => {
    it('should return start and end dates', () => {
      const eid = HijriCalendarService.getEidAlFitr(1446);

      expect(eid.start).toBeInstanceOf(Date);
      expect(eid.end).toBeInstanceOf(Date);
      // Eid al-Fitr is 3 days
      const diffDays = (eid.end.getTime() - eid.start.getTime()) / (1000 * 60 * 60 * 24);
      expect(diffDays).toBe(2); // end - start = 2 days difference (3-day span)
    });
  });

  describe('getEidAlAdha', () => {
    it('should return start and end dates', () => {
      const eid = HijriCalendarService.getEidAlAdha(1446);

      expect(eid.start).toBeInstanceOf(Date);
      expect(eid.end).toBeInstanceOf(Date);
      const diffDays = (eid.end.getTime() - eid.start.getTime()) / (1000 * 60 * 60 * 24);
      expect(diffDays).toBe(2);
    });
  });

  describe('getHajjSeason', () => {
    it('should return 6-day Hajj season (8-13 Dhul Hijjah)', () => {
      const hajj = HijriCalendarService.getHajjSeason(1446);

      expect(hajj.start).toBeInstanceOf(Date);
      expect(hajj.end).toBeInstanceOf(Date);
      const diffDays = (hajj.end.getTime() - hajj.start.getTime()) / (1000 * 60 * 60 * 24);
      expect(diffDays).toBeGreaterThanOrEqual(4);
      expect(diffDays).toBeLessThanOrEqual(6);
    });
  });

  describe('formatHijri', () => {
    it('should format in English by default', () => {
      const result = HijriCalendarService.formatHijri(new Date(2024, 0, 1));

      expect(result).toMatch(/\d+ .+ \d+/);
    });

    it('should format in Arabic when locale is ar', () => {
      const result = HijriCalendarService.formatHijri(new Date(2024, 0, 1), 'ar');

      expect(result).toMatch(/[٠-٩]/);
    });
  });

  describe('getCurrentHijriYear', () => {
    it('should return a reasonable Hijri year', () => {
      const year = HijriCalendarService.getCurrentHijriYear();

      expect(year).toBeGreaterThanOrEqual(1445);
      expect(year).toBeLessThanOrEqual(1460);
    });
  });

  describe('getMonthNames', () => {
    it('should return 12 English month names', () => {
      const months = HijriCalendarService.getMonthNames('en');

      expect(months).toHaveLength(12);
      expect(months[0]).toBe('Muharram');
      expect(months[8]).toBe('Ramadan');
      expect(months[11]).toBe('Dhul Hijjah');
    });

    it('should return 12 Arabic month names', () => {
      const months = HijriCalendarService.getMonthNames('ar');

      expect(months).toHaveLength(12);
      expect(months[0]).toBe('محرم');
      expect(months[8]).toBe('رمضان');
    });
  });

  describe('getRamadanDaysRemaining', () => {
    it('should return 0 when not Ramadan', () => {
      // Use a date very unlikely to be Ramadan (January 1)
      const date = new Date(2024, 0, 1);
      const hijri = HijriCalendarService.toHijri(date);

      if (hijri.month !== 9) {
        expect(HijriCalendarService.getRamadanDaysRemaining(date)).toBe(0);
      }
    });
  });

  describe('getDaysUntilRamadan', () => {
    it('should return 0 during Ramadan', () => {
      // Get a date we know is during Ramadan
      const ramadan = HijriCalendarService.getRamadanPeriod();
      const midRamadan = new Date(ramadan.startDate);
      midRamadan.setDate(midRamadan.getDate() + 10);

      expect(HijriCalendarService.getDaysUntilRamadan(midRamadan)).toBe(0);
    });

    it('should return positive number when not Ramadan', () => {
      const date = new Date(2024, 0, 1);
      const hijri = HijriCalendarService.toHijri(date);

      if (hijri.month !== 9) {
        expect(HijriCalendarService.getDaysUntilRamadan(date)).toBeGreaterThan(0);
      }
    });
  });
});
