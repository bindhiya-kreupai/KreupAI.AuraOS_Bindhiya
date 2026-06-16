import { prisma } from '@aura/database';
import type { AuthContext } from './types';

export interface CountryRiskInput {
  countryCode: string;
  riskCode: string;
  title: string;
  description: string;
  domain: string;
  likelihood: number;
  impact: number;
  ownerRole: string;
  controlRef?: string;
  remediationDueAt?: Date;
  status?: 'OPEN' | 'MITIGATING' | 'RESOLVED';
}

const RAG_BANDS = [
  { max: 5, rating: 'LOW' },
  { max: 9, rating: 'MEDIUM' },
  { max: 16, rating: 'HIGH' },
  { max: 25, rating: 'CRITICAL' },
] as const;

export function score(l: number, i: number) {
  const sc = l * i;
  const band = RAG_BANDS.find((b) => sc <= b.max) ?? RAG_BANDS[RAG_BANDS.length - 1];
  return { score: sc, rating: band.rating };
}

const SEED: CountryRiskInput[] = [
  {
    countryCode: 'AE',
    riskCode: 'AE_WPS_DELAY',
    title: 'WPS salary delay',
    domain: 'PAYROLL',
    description: 'Salary not credited within 15-day MOHRE WPS window.',
    likelihood: 3,
    impact: 5,
    ownerRole: 'PAYROLL_OFFICER',
    controlRef: 'WPS_SALARY_WINDOW_DAYS',
  },
  {
    countryCode: 'AE',
    riskCode: 'AE_EMIRATISATION_SHORTFALL',
    title: 'Emiratisation quota shortfall',
    domain: 'NATIONALIZATION',
    description: 'Failure to meet annual Emiratisation growth target.',
    likelihood: 4,
    impact: 5,
    ownerRole: 'HR_MANAGER',
    controlRef: 'EMIRATISATION_PRIVATE_TARGET',
  },
  {
    countryCode: 'SA',
    riskCode: 'SA_MUDAD_DELAY',
    title: 'Mudad / WPS salary delay',
    domain: 'PAYROLL',
    description: 'Salary not credited within 7-day Mudad WPS window.',
    likelihood: 3,
    impact: 5,
    ownerRole: 'PAYROLL_OFFICER',
    controlRef: 'WPS_SALARY_WINDOW_DAYS',
  },
  {
    countryCode: 'SA',
    riskCode: 'SA_NITAQAT_DROP',
    title: 'Nitaqat band downgrade',
    domain: 'NATIONALIZATION',
    description: 'Saudization ratio falls below current Nitaqat band threshold.',
    likelihood: 3,
    impact: 5,
    ownerRole: 'HR_MANAGER',
    controlRef: 'NITAQAT_BANDS',
  },
  {
    countryCode: 'BH',
    riskCode: 'BH_LMRA_LAPSE',
    title: 'LMRA permit lapse',
    domain: 'IMMIGRATION',
    description: 'LMRA permit not renewed before expiry.',
    likelihood: 3,
    impact: 4,
    ownerRole: 'PRO_OFFICER',
  },
  {
    countryCode: 'QA',
    riskCode: 'QA_WPS_DELAY',
    title: 'Qatar WPS delay',
    domain: 'PAYROLL',
    description: 'Monthly WPS file missing the statutory window.',
    likelihood: 3,
    impact: 5,
    ownerRole: 'PAYROLL_OFFICER',
  },
  {
    countryCode: 'OM',
    riskCode: 'OM_OMANISATION_SHORTFALL',
    title: 'Omanisation sector shortfall',
    domain: 'NATIONALIZATION',
    description: 'Sector-specific Omanisation target not met.',
    likelihood: 3,
    impact: 4,
    ownerRole: 'HR_MANAGER',
  },
  {
    countryCode: 'KW',
    riskCode: 'KW_PAM_QUOTA',
    title: 'PAM Kuwaitisation quota miss',
    domain: 'NATIONALIZATION',
    description: 'Quota not met; permit issuance suspended by PAM.',
    likelihood: 3,
    impact: 5,
    ownerRole: 'HR_MANAGER',
  },
];

/**
 * EPIC-36-S06: country-wise compliance risk matrix.
 */
export class CountryRiskMatrixService {
  async seedRegional(auth: AuthContext) {
    const created: string[] = [];
    for (const seed of SEED) {
      const existing = await (prisma as any).countryRiskMatrix.findUnique({
        where: {
          aura_country_risk_matrix_unique: {
            tenantId: auth.tenantId,
            countryCode: seed.countryCode,
            riskCode: seed.riskCode,
          },
        },
      });
      if (existing) continue;
      const { score: sc, rating } = score(seed.likelihood, seed.impact);
      await (prisma as any).countryRiskMatrix.create({
        data: {
          tenantId: auth.tenantId,
          countryCode: seed.countryCode,
          riskCode: seed.riskCode,
          title: seed.title,
          description: seed.description,
          domain: seed.domain,
          likelihood: seed.likelihood,
          impact: seed.impact,
          score: sc,
          rating,
          ownerRole: seed.ownerRole,
          controlRef: seed.controlRef,
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
    filter: { countryCode?: string; rating?: string; status?: string } = {}
  ) {
    return (prisma as any).countryRiskMatrix.findMany({
      where: {
        tenantId,
        ...(filter.countryCode ? { countryCode: filter.countryCode.toUpperCase() } : {}),
        ...(filter.rating ? { rating: filter.rating } : {}),
        ...(filter.status ? { status: filter.status } : {}),
      },
      orderBy: [{ countryCode: 'asc' }, { score: 'desc' }],
    });
  }

  async upsert(input: CountryRiskInput, auth: AuthContext) {
    if (input.likelihood < 1 || input.likelihood > 5 || input.impact < 1 || input.impact > 5) {
      throw new Error('likelihood and impact must be in 1..5');
    }
    const { score: sc, rating } = score(input.likelihood, input.impact);
    return (prisma as any).countryRiskMatrix.upsert({
      where: {
        aura_country_risk_matrix_unique: {
          tenantId: auth.tenantId,
          countryCode: input.countryCode,
          riskCode: input.riskCode,
        },
      },
      update: {
        title: input.title,
        description: input.description,
        domain: input.domain,
        likelihood: input.likelihood,
        impact: input.impact,
        score: sc,
        rating,
        ownerRole: input.ownerRole,
        controlRef: input.controlRef,
        status: input.status ?? 'OPEN',
        remediationDueAt: input.remediationDueAt,
        updatedBy: auth.userId,
      },
      create: {
        tenantId: auth.tenantId,
        countryCode: input.countryCode,
        riskCode: input.riskCode,
        title: input.title,
        description: input.description,
        domain: input.domain,
        likelihood: input.likelihood,
        impact: input.impact,
        score: sc,
        rating,
        ownerRole: input.ownerRole,
        controlRef: input.controlRef,
        status: input.status ?? 'OPEN',
        remediationDueAt: input.remediationDueAt,
        createdBy: auth.userId,
        updatedBy: auth.userId,
      },
    });
  }
}

export const countryRiskMatrixService = new CountryRiskMatrixService();
