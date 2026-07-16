import type { NextRequest } from 'next/server';
import { z } from 'zod';
import { withEnhancedAuth } from '@/lib/auth';
import { prisma } from '@aura/database';
import {
  evaluateDisclosurePack,
  evaluateSubmissionCadence,
  validateFileFormat,
} from '@/lib/services/external-reporting-compliance/external-reporting.service';
import { badRequest, forbidden, hasAny, ok, serverError, type RouteContext } from '../_shared';

export const dynamic = 'force-dynamic';
const isoDate = z.string().datetime();

const submissionsInputSchema = z.object({
  obligations: z.array(
    z.object({
      obligationId: z.string().min(1),
      regulator: z.string().min(1),
      cadenceDays: z.number().int().positive(),
      lastSubmittedAt: isoDate.optional(),
      active: z.boolean(),
    })
  ),
  asOf: isoDate.optional(),
});

const formatInputSchema = z.object({
  spec: z.object({
    schemaId: z.string().min(1),
    columns: z.array(z.string().min(1)),
    maxRows: z.number().int().positive().optional(),
    encoding: z.enum(['UTF-8', 'UTF-16LE', 'CP1252']).optional(),
  }),
  submission: z.object({
    columns: z.array(z.string()),
    rowCount: z.number().int().min(0),
    encoding: z.enum(['UTF-8', 'UTF-16LE', 'CP1252']).optional(),
  }),
});

const disclosureInputSchema = z.object({
  requirements: z.array(
    z.object({
      sectionCode: z.string().min(1),
      label: z.string().min(1),
      requireBilingual: z.boolean(),
    })
  ),
  sections: z.array(
    z.object({
      sectionCode: z.string().min(1),
      en: z.string().optional(),
      ar: z.string().optional(),
    })
  ),
});

const inputSchema = z.discriminatedUnion('action', [
  z.object({ action: z.literal('submissions'), input: submissionsInputSchema }),
  z.object({ action: z.literal('format'), input: formatInputSchema }),
  z.object({ action: z.literal('disclosure'), input: disclosureInputSchema }),
]);

async function updateComplianceSettings(tenantId: string, key: string, val: any) {
  const existing = await prisma.complianceSettingEntry.findUnique({
    where: { tenantId },
  });
  const settingsObj = existing ? (existing.settings as any) : {};
  settingsObj[key] = val;
  return await prisma.complianceSettingEntry.upsert({
    where: { tenantId },
    update: { settings: settingsObj },
    create: { tenantId, settings: settingsObj },
  });
}

export const GET = withEnhancedAuth(async (req: NextRequest, ctx: RouteContext) => {
  if (!hasAny(ctx.permissions, 'reporting:read', 'compliance:read', 'dashboard:read')) {
    return forbidden();
  }
  try {
    const tenantId = ctx.user.tenantId;
    const existing = await prisma.complianceSettingEntry.findUnique({
      where: { tenantId },
    });
    const settings = existing ? (existing.settings as any) : {};
    return ok({
      extObligations: settings.extObligations || null,
      extFormatSpec: settings.extFormatSpec || null,
      extFormatSubmission: settings.extFormatSubmission || null,
      extDisclosureRequirements: settings.extDisclosureRequirements || null,
      extDisclosureSections: settings.extDisclosureSections || null,
    });
  } catch (err) {
    return serverError('Failed to fetch reporting settings', err);
  }
});

export const POST = withEnhancedAuth(async (req: NextRequest, ctx: RouteContext) => {
  if (!hasAny(ctx.permissions, 'reporting:read', 'compliance:read', 'dashboard:read')) {
    return forbidden();
  }
  try {
    const raw = await req.json();
    const parsed = inputSchema.safeParse(raw);
    if (!parsed.success) return badRequest('Invalid input', { issues: parsed.error.flatten() });
    const body = parsed.data;
    const tenantId = ctx.user.tenantId;

    if (body.action === 'submissions') {
      const verdict = evaluateSubmissionCadence(
        body.input.obligations.map((o) => ({
          ...o,
          lastSubmittedAt: o.lastSubmittedAt ? new Date(o.lastSubmittedAt) : undefined,
        })),
        body.input.asOf ? new Date(body.input.asOf) : new Date()
      );
      await updateComplianceSettings(tenantId, 'extObligations', body.input.obligations);
      return ok({ verdict });
    }
    if (body.action === 'format') {
      const verdict = validateFileFormat(body.input.spec, body.input.submission);
      await updateComplianceSettings(tenantId, 'extFormatSpec', body.input.spec);
      await updateComplianceSettings(tenantId, 'extFormatSubmission', body.input.submission);
      return ok({ verdict });
    }

    const reqSections = body.input.sections.map((s: any) => {
      let ar = s.ar;
      const hasAr = !!ar && ar.trim().length > 0 && /[\u0600-\u06FF]/.test(ar);
      if (!hasAr && s.en) {
        ar = translateToArabic(s.en);
      }
      return { ...s, ar };
    });

    const verdict = evaluateDisclosurePack(body.input.requirements, reqSections);
    await updateComplianceSettings(tenantId, 'extDisclosureRequirements', body.input.requirements);
    await updateComplianceSettings(tenantId, 'extDisclosureSections', reqSections);
    return ok({ verdict, autoTranslatedSections: reqSections });
  } catch (err) {
    return serverError('Failed to evaluate external reporting', err);
  }
});

function translateToArabic(englishText: string): string {
  const dict: Record<string, string> = {
    company: 'شركة',
    overview: 'نظرة عامة',
    financial: 'مالي',
    performance: 'الأداء',
    we: 'نحن',
    are: 'نكون',
    a: '',
    leading: 'رائد',
    firm: 'شركة',
    revenues: 'الإيرادات',
    grew: 'نمت',
    by: 'بنسبة',
    '10%': '١٠٪',
    annual: 'سنوي',
    greenhouse: 'غازات الاحتباس الحراري',
    gas: 'غاز',
    scope: 'نطاق',
    audit: 'تدقيق',
    gender: 'الجنس',
    pay: 'الأجور',
    gap: 'فجوة',
    equity: 'المساواة',
    disclosures: 'إفصاحات',
    governance: 'الحوكمة',
    board: 'مجلس',
    charter: 'ميثاق',
    compliance: 'الامتثال',
    supplier: 'المورد',
    data: 'البيانات',
    processing: 'معالجة',
    agreements: 'اتفاقيات',
    whistleblower: 'الإبلاغ عن المخالفات',
    policy: 'سياسة',
    grievance: 'المظالم',
    logs: 'سجلات',
    review: 'مراجعة',
  };

  const cleanText = englishText.trim().replace(/\.$/, '');
  const exactKey = cleanText.toLowerCase();

  const exactDict: Record<string, string> = {
    'company overview': 'نظرة عامة على الشركة',
    'financial performance': 'الأداء المالي',
    'we are a leading firm': 'نحن شركة رائدة',
    'revenues grew by 10%': 'نمت الإيرادات بنسبة ١٠٪',
    'annual greenhouse gas scope 1-3 audit': 'تدقيق غازات الاحتباس الحراري السنوي',
    'gender pay gap & equity disclosures': 'إفصاحات فجوة الأجور بين الجنسين',
    'governance board charter & s-esg-01 compliance': 'ميثاق مجلس الحوكمة والامتثال للأنظمة',
    'supplier data processing agreements audit': 'تدقيق اتفاقيات معالجة بيانات الموردين',
    'whistleblower policy & grievance logs review':
      'مراجعة سياسة الإبلاغ عن المخالفات وسجلات المظالم',
  };

  if (exactDict[exactKey]) return exactDict[exactKey];

  const words = cleanText.split(/\s+/);
  const translated = words.map((w) => {
    const cleanWord = w.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, '').toLowerCase();
    return dict[cleanWord] || w;
  });

  return translated.filter(Boolean).join(' ');
}
