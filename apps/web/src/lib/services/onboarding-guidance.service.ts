import { prisma } from '@aura/database';
import type { Prisma } from '@prisma/client';

interface AuthContext {
  tenantId: string;
  userId: string;
}

interface GuidanceInput {
  contentKey: string;
  countryCode: string;
  title: string;
  introduction: string;
  objectives: string[];
  keyTakeaways: string[];
  obligations?: Array<{ code: string; label: string; deadline?: string }>;
  publish?: boolean;
}

const DEFAULT_OBLIGATIONS: Record<
  string,
  Array<{ code: string; label: string; deadline?: string }>
> = {
  AE: [
    {
      code: 'WPS',
      label: 'WPS salary readiness and IBAN validation',
      deadline: 'Before first payroll lock',
    },
    {
      code: 'GPSSA',
      label: 'GPSSA registration for eligible UAE nationals',
      deadline: 'Within onboarding window',
    },
    {
      code: 'MOHRE_ICP',
      label: 'MOHRE work permit and Emirates ID linkage',
      deadline: 'Before activation',
    },
  ],
  SA: [
    { code: 'QIWA', label: 'Qiwa contract authentication', deadline: 'Before activation' },
    {
      code: 'GOSI',
      label: 'GOSI registration trigger',
      deadline: 'Within statutory registration window',
    },
    { code: 'MUDAD', label: 'Mudad/WPS payroll readiness', deadline: 'Before first payroll lock' },
  ],
  BH: [
    { code: 'LMRA', label: 'LMRA permit validation', deadline: 'Before activation' },
    {
      code: 'SIO',
      label: 'SIO registration readiness',
      deadline: 'Within statutory registration window',
    },
  ],
  QA: [
    { code: 'QID', label: 'QID linkage', deadline: 'Before activation' },
    { code: 'QATAR_WPS', label: 'Qatar WPS enrolment', deadline: 'Before first payroll lock' },
  ],
  OM: [
    { code: 'RESIDENT_CARD', label: 'Resident card validation', deadline: 'Before activation' },
    {
      code: 'PASI',
      label: 'Oman social protection trigger',
      deadline: 'Within statutory registration window',
    },
  ],
  KW: [
    { code: 'PAM', label: 'PAM permit validation', deadline: 'Before activation' },
    {
      code: 'PIFSS',
      label: 'PIFSS trigger for eligible nationals',
      deadline: 'Within statutory registration window',
    },
  ],
};

function normalizeCountry(countryCode: string) {
  return countryCode.trim().toUpperCase();
}

function toJson(value: unknown): Prisma.InputJsonValue {
  return value as Prisma.InputJsonValue;
}

export class OnboardingGuidanceService {
  async seedDefaults(auth: AuthContext) {
    const rows = [];
    for (const [countryCode, obligations] of Object.entries(DEFAULT_OBLIGATIONS)) {
      const existing = await (prisma as any).onboardingGuidanceContent.findFirst({
        where: {
          tenantId: auth.tenantId,
          contentKey: 'ONBOARDING_OVERVIEW',
          countryCode,
          status: 'PUBLISHED',
          isDeleted: false,
        },
        orderBy: { version: 'desc' },
      });
      if (existing) {
        rows.push(existing);
        continue;
      }
      const row = await (prisma as any).onboardingGuidanceContent.create({
        data: {
          tenantId: auth.tenantId,
          contentKey: 'ONBOARDING_OVERVIEW',
          countryCode,
          version: 1,
          status: 'PUBLISHED',
          title: `${countryCode} onboarding compliance overview`,
          introduction:
            'This onboarding workspace coordinates pre-joining, joining day, master activation, payroll, benefits, and statutory enrolment gates.',
          objectives: toJson([
            'Complete country-specific documents and authority checks before activation.',
            'Prepare payroll, medical benefits, and social-insurance enrolments before first pay.',
            'Keep a recoverable audit trail for every stage and compliance decision.',
          ]),
          keyTakeaways: toJson(
            obligations.map((item) => `${item.label}${item.deadline ? ` - ${item.deadline}` : ''}`)
          ),
          obligations: toJson(obligations),
          publishedAt: new Date(),
          createdBy: auth.userId,
          updatedBy: auth.userId,
        },
      });
      rows.push(row);
    }
    await this.audit(auth, 'CREATE', 'onboarding_guidance_content', null, rows);
    return rows.map((row) => this.toDto(row));
  }

  async list(
    tenantId: string,
    filters: { countryCode?: string; contentKey?: string; status?: string }
  ) {
    const rows = await (prisma as any).onboardingGuidanceContent.findMany({
      where: {
        tenantId,
        isDeleted: false,
        ...(filters.countryCode ? { countryCode: normalizeCountry(filters.countryCode) } : {}),
        ...(filters.contentKey ? { contentKey: filters.contentKey } : {}),
        ...(filters.status ? { status: filters.status } : {}),
      },
      orderBy: [{ countryCode: 'asc' }, { contentKey: 'asc' }, { version: 'desc' }],
    });
    return rows.map((row: any) => this.toDto(row));
  }

  async createVersion(input: GuidanceInput, auth: AuthContext) {
    const countryCode = normalizeCountry(input.countryCode);
    const latest = await (prisma as any).onboardingGuidanceContent.findFirst({
      where: {
        tenantId: auth.tenantId,
        contentKey: input.contentKey,
        countryCode,
        isDeleted: false,
      },
      orderBy: { version: 'desc' },
    });
    const nextVersion = (latest?.version ?? 0) + 1;
    if (input.publish) {
      await (prisma as any).onboardingGuidanceContent.updateMany({
        where: {
          tenantId: auth.tenantId,
          contentKey: input.contentKey,
          countryCode,
          status: 'PUBLISHED',
        },
        data: { status: 'ARCHIVED', archivedAt: new Date(), updatedBy: auth.userId },
      });
    }
    const row = await (prisma as any).onboardingGuidanceContent.create({
      data: {
        tenantId: auth.tenantId,
        contentKey: input.contentKey,
        countryCode,
        version: nextVersion,
        status: input.publish ? 'PUBLISHED' : 'DRAFT',
        title: input.title,
        introduction: input.introduction,
        objectives: toJson(input.objectives),
        keyTakeaways: toJson(input.keyTakeaways),
        obligations: toJson(input.obligations ?? DEFAULT_OBLIGATIONS[countryCode] ?? []),
        publishedAt: input.publish ? new Date() : null,
        createdBy: auth.userId,
        updatedBy: auth.userId,
      },
    });
    await this.audit(auth, 'CREATE', row.id, latest, row);
    return this.toDto(row);
  }

  async resolve(
    tenantId: string,
    contentKey: string,
    countryCode: string,
    context: { userId?: string; onboardingCaseId?: string; stage?: string } = {}
  ) {
    const normalizedCountry = normalizeCountry(countryCode);
    const row = await (prisma as any).onboardingGuidanceContent.findFirst({
      where: {
        tenantId,
        contentKey,
        countryCode: normalizedCountry,
        status: 'PUBLISHED',
        isDeleted: false,
      },
      orderBy: { version: 'desc' },
    });
    if (!row) {
      throw new Error(
        `No published onboarding guidance found for ${contentKey}/${normalizedCountry}`
      );
    }
    await (prisma as any).onboardingGuidanceViewLog.create({
      data: {
        tenantId,
        contentId: row.id,
        contentKey: row.contentKey,
        countryCode: row.countryCode,
        version: row.version,
        onboardingCaseId: context.onboardingCaseId ?? null,
        userId: context.userId ?? null,
        stage: context.stage ?? null,
      },
    });
    return this.toDto(row);
  }

  private async audit(
    auth: AuthContext,
    action: 'CREATE' | 'UPDATE',
    resourceId: string,
    beforeValues: unknown,
    afterValues: unknown
  ) {
    await prisma.auditLog.create({
      data: {
        tenantId: auth.tenantId,
        userId: auth.userId,
        action: action as any,
        resourceType: 'onboarding_guidance_content',
        resourceId,
        module: 'onboarding',
        beforeValues: beforeValues as Prisma.InputJsonValue,
        afterValues: afterValues as Prisma.InputJsonValue,
        metadata: toJson({ story: 'EPIC-06-S02' }),
      },
    });
  }

  private toDto(row: any) {
    return {
      id: row.id,
      contentKey: row.contentKey,
      countryCode: row.countryCode,
      version: row.version,
      status: row.status,
      title: row.title,
      introduction: row.introduction,
      objectives: row.objectives ?? [],
      keyTakeaways: row.keyTakeaways ?? [],
      obligations: row.obligations ?? [],
      publishedAt: row.publishedAt,
    };
  }
}

export const onboardingGuidanceService = new OnboardingGuidanceService();
