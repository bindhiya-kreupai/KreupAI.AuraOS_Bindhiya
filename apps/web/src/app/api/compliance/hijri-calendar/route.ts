/**
 * Hijri Calendar API Routes
 * Gregorian↔Hijri conversion, Ramadan detection, Islamic holidays
 *
 * @swagger
 * /api/compliance/hijri-calendar:
 *   get:
 *     summary: Convert date or get Islamic calendar info
 *     tags: [Compliance - Hijri Calendar]
 */

import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { HijriCalendarService } from '@/lib/services/compliance/hijri-calendar.service';

/**
 * GET /api/compliance/hijri-calendar
 * Query params: action, date, hijriYear, hijriMonth, hijriDay, locale, countryCode
 */
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const action = url.searchParams.get('action') || 'toHijri';
    const dateStr = url.searchParams.get('date');
    const hijriYear = url.searchParams.get('hijriYear');
    const hijriMonth = url.searchParams.get('hijriMonth');
    const hijriDay = url.searchParams.get('hijriDay');
    const locale = (url.searchParams.get('locale') as 'en' | 'ar') || 'en';
    const countryCode = url.searchParams.get('countryCode') || undefined;

    const date = dateStr ? new Date(dateStr) : new Date();

    switch (action) {
      case 'toHijri': {
        const hijri = HijriCalendarService.toHijri(date);
        return NextResponse.json({ success: true, data: hijri });
      }

      case 'toGregorian': {
        if (!hijriYear || !hijriMonth || !hijriDay) {
          return NextResponse.json(
            { error: 'Missing parameters: hijriYear, hijriMonth, hijriDay', errorAr: 'معاملات مفقودة: السنة الهجرية، الشهر الهجري، اليوم الهجري' },
            { status: 400 }
          );
        }
        const gregorian = HijriCalendarService.toGregorian(
          parseInt(hijriYear), parseInt(hijriMonth), parseInt(hijriDay)
        );
        return NextResponse.json({
          success: true,
          data: { date: gregorian.toISOString(), formatted: gregorian.toLocaleDateString() },
        });
      }

      case 'isRamadan': {
        const isRamadan = HijriCalendarService.isRamadan(date);
        const daysRemaining = HijriCalendarService.getRamadanDaysRemaining(date);
        const daysUntil = HijriCalendarService.getDaysUntilRamadan(date);
        return NextResponse.json({
          success: true,
          data: { isRamadan, daysRemaining, daysUntilNextRamadan: daysUntil },
        });
      }

      case 'ramadanPeriod': {
        const year = hijriYear ? parseInt(hijriYear) : undefined;
        const ramadan = HijriCalendarService.getRamadanPeriod(year);
        return NextResponse.json({ success: true, data: ramadan });
      }

      case 'holidays': {
        const year = hijriYear ? parseInt(hijriYear) : undefined;
        const holidays = HijriCalendarService.getIslamicHolidays(year, countryCode);
        return NextResponse.json({ success: true, data: holidays });
      }

      case 'isHoliday': {
        const result = HijriCalendarService.isIslamicHoliday(date, countryCode);
        return NextResponse.json({ success: true, data: result });
      }

      case 'eidAlFitr': {
        const year = hijriYear ? parseInt(hijriYear) : undefined;
        const eid = HijriCalendarService.getEidAlFitr(year);
        return NextResponse.json({ success: true, data: eid });
      }

      case 'eidAlAdha': {
        const year = hijriYear ? parseInt(hijriYear) : undefined;
        const eid = HijriCalendarService.getEidAlAdha(year);
        return NextResponse.json({ success: true, data: eid });
      }

      case 'hajjSeason': {
        const year = hijriYear ? parseInt(hijriYear) : undefined;
        const hajj = HijriCalendarService.getHajjSeason(year);
        return NextResponse.json({ success: true, data: hajj });
      }

      case 'format': {
        const formatted = HijriCalendarService.formatHijri(date, locale);
        return NextResponse.json({ success: true, data: { formatted, locale } });
      }

      case 'currentYear': {
        const currentYear = HijriCalendarService.getCurrentHijriYear();
        return NextResponse.json({ success: true, data: { hijriYear: currentYear } });
      }

      case 'monthNames': {
        const months = HijriCalendarService.getMonthNames(locale);
        return NextResponse.json({ success: true, data: { months, locale } });
      }

      default:
        return NextResponse.json(
          { error: `Unknown action: ${action}`, errorAr: `إجراء غير معروف: ${action}` },
          { status: 400 }
        );
    }
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to process Hijri calendar request', errorAr: 'فشل في معالجة طلب التقويم الهجري' },
      { status: 500 }
    );
  }
}
