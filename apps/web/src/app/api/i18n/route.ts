/**
 * Internationalization / Arabic Localization API Routes
 * Translation, bilingual pairs, number/currency formatting, validation
 *
 * @swagger
 * /api/i18n:
 *   get:
 *     summary: Get translations, bilingual pairs, formatted numbers/currencies
 *   post:
 *     summary: Validate form fields, Emirates ID, IBAN
 *     tags: [i18n - Localization]
 */

import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { ArabicLocalizationService } from '@/lib/services/i18n/arabic-localization.service';
import { z } from 'zod';
import { logger } from '@/lib/logger';

const ValidateFormSchema = z.object({
  action: z.literal('validateForm'),
  fields: z.record(z.string(), z.any()),
  locale: z.string().optional(),
});

const ValidateEmiratesIdSchema = z.object({
  action: z.literal('validateEmiratesId'),
  id: z.string().min(1),
});

const ValidateIBANSchema = z.object({
  action: z.literal('validateIBAN'),
  iban: z.string().min(1),
  countryCode: z.string().min(2).max(2),
});

// GET - Translation and formatting utilities (no auth required)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action') || 'translate';
    const locale = searchParams.get('locale') || 'ar';

    switch (action) {
      case 'translate': {
        const key = searchParams.get('key');
        if (!key) {
          return NextResponse.json(
            { error: 'key parameter is required', errorAr: 'معامل المفتاح مطلوب' },
            { status: 400 }
          );
        }
        const result = ArabicLocalizationService.t(key, locale);
        return NextResponse.json({ success: true, data: { key, locale, value: result } });
      }

      case 'bilingual': {
        const key = searchParams.get('key');
        if (!key) {
          return NextResponse.json(
            { error: 'key parameter is required', errorAr: 'معامل المفتاح مطلوب' },
            { status: 400 }
          );
        }
        const result = ArabicLocalizationService.tb(key);
        return NextResponse.json({ success: true, data: { key, ...result } });
      }

      case 'formatNumber': {
        const numberStr = searchParams.get('number');
        if (!numberStr) {
          return NextResponse.json(
            { error: 'number parameter is required', errorAr: 'معامل الرقم مطلوب' },
            { status: 400 }
          );
        }
        const number = parseFloat(numberStr);
        if (isNaN(number)) {
          return NextResponse.json(
            { error: 'Invalid number value', errorAr: 'قيمة رقمية غير صالحة' },
            { status: 400 }
          );
        }
        const result = ArabicLocalizationService.formatNumber(number, locale);
        return NextResponse.json({ success: true, data: { number, locale, formatted: result } });
      }

      case 'formatCurrency': {
        const amountStr = searchParams.get('amount');
        const currency = searchParams.get('currency');
        if (!amountStr || !currency) {
          return NextResponse.json(
            {
              error: 'amount and currency parameters are required',
              errorAr: 'معاملات المبلغ والعملة مطلوبة',
            },
            { status: 400 }
          );
        }
        const amount = parseFloat(amountStr);
        if (isNaN(amount)) {
          return NextResponse.json(
            { error: 'Invalid amount value', errorAr: 'قيمة المبلغ غير صالحة' },
            { status: 400 }
          );
        }
        const result = ArabicLocalizationService.formatCurrency(amount, currency, locale);
        return NextResponse.json({
          success: true,
          data: { amount, currency, locale, formatted: result },
        });
      }

      case 'toArabicDigits': {
        const numberStr = searchParams.get('number');
        if (!numberStr) {
          return NextResponse.json(
            { error: 'number parameter is required', errorAr: 'معامل الرقم مطلوب' },
            { status: 400 }
          );
        }
        const result = ArabicLocalizationService.toArabicDigits(numberStr);
        return NextResponse.json({ success: true, data: { input: numberStr, arabicDigits: result } });
      }

      default:
        return NextResponse.json(
          { error: `Unknown action: ${action}`, errorAr: `إجراء غير معروف: ${action}` },
          { status: 400 }
        );
    }
  } catch (error) {
    logger.error({ error }, 'Error in i18n GET');
    return NextResponse.json(
      {
        error: 'Failed to process i18n request',
        errorAr: 'فشل في معالجة طلب التدويل',
      },
      { status: 500 }
    );
  }
}

// POST - Validation utilities (no auth required)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action } = body;

    switch (action) {
      case 'validateForm': {
        const validated = ValidateFormSchema.parse(body);
        const result = ArabicLocalizationService.validateForm(
          validated.fields,
          validated.locale
        );
        return NextResponse.json({ success: true, data: result });
      }

      case 'validateEmiratesId': {
        const validated = ValidateEmiratesIdSchema.parse(body);
        const result = ArabicLocalizationService.validateEmiratesId(validated.id);
        return NextResponse.json({ success: true, data: result });
      }

      case 'validateIBAN': {
        const validated = ValidateIBANSchema.parse(body);
        const result = ArabicLocalizationService.validateIBAN(
          validated.iban,
          validated.countryCode
        );
        return NextResponse.json({ success: true, data: result });
      }

      default:
        return NextResponse.json(
          { error: `Unknown action: ${action}`, errorAr: `إجراء غير معروف: ${action}` },
          { status: 400 }
        );
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Validation error', errorAr: 'خطأ في التحقق', details: error.errors },
        { status: 400 }
      );
    }
    logger.error({ error }, 'Error in i18n POST');
    return NextResponse.json(
      {
        error: 'Failed to process i18n request',
        errorAr: 'فشل في معالجة طلب التدويل',
      },
      { status: 500 }
    );
  }
}
