import { prisma } from '@aura/database';
import type { AuthContext } from './types';

export interface RiskEntryInput {
  riskCode: string;
  category: string;
  title: string;
  description: string;
  likelihood: number;
  impact: number;
  ownerRole: string;
  countryScope?: string[];
  entityScope?: string[];
  mitigation?: string;
  status?: 'OPEN' | 'MITIGATING' | 'RESOLVED' | 'ACCEPTED';
  reviewDueAt?: Date;
}

export const RAG_BANDS = [
  { max: 5, rating: 'LOW' },
  { max: 9, rating: 'MEDIUM' },
  { max: 16, rating: 'HIGH' },
  { max: 25, rating: 'CRITICAL' },
] as const;

export function computeRating(likelihood: number, impact: number) {
  const score = likelihood * impact;
  const band = RAG_BANDS.find((b) => score <= b.max) ?? RAG_BANDS[RAG_BANDS.length - 1];
  return { score, rating: band.rating };
}

const SEED_RISKS: Omit<RiskEntryInput, 'status'>[] = [
  {
    riskCode: 'NAT_QUOTA_SHORTFALL',
    category: 'NATIONALIZATION',
    title: 'Nationalization quota shortfall',
    description:
      'Failure to meet Emiratisation / Nitaqat / Bahrainization quotas triggers fines, hiring blocks, and visa-quota suspension.',
    likelihood: 4,
    impact: 5,
    ownerRole: 'HR_MANAGER',
    countryScope: ['AE', 'SA', 'BH', 'OM'],
    mitigation:
      'Maintain rolling localization KPI baseline, plan-vs-actual quota gap tracker, and quarterly hiring forecast against quota.',
  },
  {
    riskCode: 'WPS_SALARY_DELAY',
    category: 'WAGE_PROTECTION',
    title: 'Salary delay beyond statutory window',
    description:
      'Delaying payroll beyond the country-specific window (e.g., >15 days UAE, >7 days KSA) triggers MoL penalties and WPS blocks.',
    likelihood: 3,
    impact: 5,
    ownerRole: 'PAYROLL_OFFICER',
    countryScope: ['AE', 'SA', 'BH', 'QA', 'OM', 'KW'],
    mitigation:
      'Lock payroll calendar with hard deadline alerts; WPS file generation + bank acknowledgement checkpoints.',
  },
  {
    riskCode: 'VISA_PERMIT_EXPIRY',
    category: 'IMMIGRATION',
    title: 'Visa / work permit expiry exposure',
    description:
      'Expired visa or work permit results in fines, deportation, and employer suspension by MOHRE / LMRA / PAM.',
    likelihood: 4,
    impact: 5,
    ownerRole: 'PRO_OFFICER',
    countryScope: ['AE', 'SA', 'BH', 'QA', 'OM', 'KW'],
    mitigation:
      'Tiered expiry alerts at 60/30/7 days; PRO dashboard with overdue queue and renewal SLA tracking.',
  },
  {
    riskCode: 'SOCIAL_INSURANCE_GAP',
    category: 'SOCIAL_INSURANCE',
    title: 'Missed GOSI / GPSSA / SIO / PASI registration',
    description:
      'Failure to register nationals (or eligible expats where applicable) within statutory window triggers back-contributions and fines.',
    likelihood: 3,
    impact: 4,
    ownerRole: 'PAYROLL_OFFICER',
    countryScope: ['AE', 'SA', 'BH', 'OM', 'KW'],
    mitigation:
      'Onboarding gate forcing social-insurance enrolment before activation; monthly reconciliation against active national headcount.',
  },
  {
    riskCode: 'RECORDS_RETENTION_GAP',
    category: 'RECORDS',
    title: 'Personnel file / document retention gap',
    description:
      'Missing or unsigned employment contracts, expired Emirates ID copies, or absent EOSB calculations during audit / inspection.',
    likelihood: 4,
    impact: 4,
    ownerRole: 'HR_ADMIN',
    countryScope: ['AE', 'SA', 'BH', 'QA', 'OM', 'KW'],
    mitigation:
      'Document-management system with mandatory-doc checklist per country/role; immutable evidence capture + audit trail.',
  },
];

/**
 * EPIC-01-S06: Compliance risk register.
 */
export class ComplianceRiskRegisterService {
  async seedRegionalRisks(auth: AuthContext) {
    const created: string[] = [];
    for (const seed of SEED_RISKS) {
      const existing = await (prisma as any).complianceRiskRegister.findUnique({
        where: { tenantId_riskCode: { tenantId: auth.tenantId, riskCode: seed.riskCode } },
      });
      if (existing) continue;
      const { score, rating } = computeRating(seed.likelihood, seed.impact);
      await (prisma as any).complianceRiskRegister.create({
        data: {
          tenantId: auth.tenantId,
          riskCode: seed.riskCode,
          category: seed.category,
          title: seed.title,
          description: seed.description,
          likelihood: seed.likelihood,
          impact: seed.impact,
          score,
          rating,
          ownerRole: seed.ownerRole,
          countryScope: seed.countryScope ?? [],
          entityScope: seed.entityScope ?? [],
          mitigation: seed.mitigation,
          status: 'OPEN',
          createdBy: auth.userId,
          updatedBy: auth.userId,
        },
      });
      created.push(seed.riskCode);
    }
    return { created };
  }

  async list(
    tenantId: string,
    filter: { rating?: string; status?: string; countryCode?: string } = {}
  ) {
    const where: Record<string, unknown> = { tenantId };
    if (filter.rating) where.rating = filter.rating;
    if (filter.status) where.status = filter.status;
    if (filter.countryCode) {
      where.countryScope = { has: filter.countryCode.toUpperCase() };
    }
    return (prisma as any).complianceRiskRegister.findMany({
      where,
      orderBy: [{ score: 'desc' }, { riskCode: 'asc' }],
    });
  }

  async upsert(input: RiskEntryInput, auth: AuthContext) {
    if (input.likelihood < 1 || input.likelihood > 5 || input.impact < 1 || input.impact > 5) {
      throw new Error('likelihood and impact must be in 1..5');
    }
    const { score, rating } = computeRating(input.likelihood, input.impact);
    return (prisma as any).complianceRiskRegister.upsert({
      where: { tenantId_riskCode: { tenantId: auth.tenantId, riskCode: input.riskCode } },
      update: {
        category: input.category,
        title: input.title,
        description: input.description,
        likelihood: input.likelihood,
        impact: input.impact,
        score,
        rating,
        ownerRole: input.ownerRole,
        countryScope: input.countryScope ?? [],
        entityScope: input.entityScope ?? [],
        mitigation: input.mitigation,
        status: input.status ?? 'OPEN',
        reviewDueAt: input.reviewDueAt,
        updatedBy: auth.userId,
      },
      create: {
        tenantId: auth.tenantId,
        riskCode: input.riskCode,
        category: input.category,
        title: input.title,
        description: input.description,
        likelihood: input.likelihood,
        impact: input.impact,
        score,
        rating,
        ownerRole: input.ownerRole,
        countryScope: input.countryScope ?? [],
        entityScope: input.entityScope ?? [],
        mitigation: input.mitigation,
        status: input.status ?? 'OPEN',
        reviewDueAt: input.reviewDueAt,
        createdBy: auth.userId,
        updatedBy: auth.userId,
      },
    });
  }
}

export const complianceRiskRegisterService = new ComplianceRiskRegisterService();
