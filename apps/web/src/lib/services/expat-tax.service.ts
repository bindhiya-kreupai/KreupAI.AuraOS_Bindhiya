import { prisma } from '@aura/database';
import { BaseService } from './base.service';

export type FilingStatus = 'PENDING' | 'IN_REVIEW' | 'FILED' | 'COMPLETED';
export const FILING_STATUSES: FilingStatus[] = ['PENDING', 'IN_REVIEW', 'FILED', 'COMPLETED'];

/**
 * Simplified progressive annual tax brackets by country (single filer, illustrative).
 * Used for tax-equalization estimation only — not a substitute for a filed return.
 * Rates are marginal; brackets in the country's local base salary currency.
 */
const TAX_BRACKETS: Record<string, Array<{ upTo: number; rate: number }>> = {
  US: [
    { upTo: 11600, rate: 0.1 },
    { upTo: 47150, rate: 0.12 },
    { upTo: 100525, rate: 0.22 },
    { upTo: 191950, rate: 0.24 },
    { upTo: 243725, rate: 0.32 },
    { upTo: 609350, rate: 0.35 },
    { upTo: Infinity, rate: 0.37 },
  ],
  UK: [
    { upTo: 12570, rate: 0 },
    { upTo: 50270, rate: 0.2 },
    { upTo: 125140, rate: 0.4 },
    { upTo: Infinity, rate: 0.45 },
  ],
  DE: [
    { upTo: 11604, rate: 0 },
    { upTo: 66760, rate: 0.24 },
    { upTo: 277825, rate: 0.42 },
    { upTo: Infinity, rate: 0.45 },
  ],
  FR: [
    { upTo: 11294, rate: 0 },
    { upTo: 28797, rate: 0.11 },
    { upTo: 82341, rate: 0.3 },
    { upTo: 177106, rate: 0.41 },
    { upTo: Infinity, rate: 0.45 },
  ],
  SG: [
    { upTo: 20000, rate: 0 },
    { upTo: 40000, rate: 0.02 },
    { upTo: 80000, rate: 0.07 },
    { upTo: 120000, rate: 0.115 },
    { upTo: 160000, rate: 0.15 },
    { upTo: Infinity, rate: 0.18 },
  ],
  // Zero personal income tax jurisdictions.
  AE: [{ upTo: Infinity, rate: 0 }],
  SA: [{ upTo: Infinity, rate: 0 }],
  QA: [{ upTo: Infinity, rate: 0 }],
  KW: [{ upTo: Infinity, rate: 0 }],
  BH: [{ upTo: Infinity, rate: 0 }],
  JP: [
    { upTo: 1950000, rate: 0.05 },
    { upTo: 3300000, rate: 0.1 },
    { upTo: 6950000, rate: 0.2 },
    { upTo: 9000000, rate: 0.23 },
    { upTo: 18000000, rate: 0.33 },
    { upTo: 40000000, rate: 0.4 },
    { upTo: Infinity, rate: 0.45 },
  ],
};

const DEFAULT_FLAT_RATE = 0.2;

/**
 * Compute annual income tax for a given country using marginal brackets.
 * Falls back to a flat 20% for unknown countries.
 */
export function computeTax(countryCode: string, income: number): number {
  const brackets = TAX_BRACKETS[countryCode.toUpperCase()];
  if (income <= 0) return 0;
  if (!brackets) return Math.round(income * DEFAULT_FLAT_RATE);

  let tax = 0;
  let lower = 0;
  for (const { upTo, rate } of brackets) {
    if (income > lower) {
      const taxable = Math.min(income, upTo) - lower;
      tax += taxable * rate;
      lower = upTo;
    } else {
      break;
    }
  }
  return Math.round(tax);
}

export interface TaxEqualizationResult {
  homeCountry: string;
  hostCountry: string;
  baseSalary: number;
  currency: string;
  hypoTax: number; // stay-at-home (home country) liability
  hostTax: number; // actual host country liability
  companyCost: number; // differential the company absorbs (hostTax - hypoTax)
}

export class ExpatTaxService extends BaseService {
  constructor() {
    super('ExpatTaxService');
  }

  /**
   * Pure tax-equalization estimator. Company cost = hostTax - hypoTax.
   * A negative company cost means the assignment is tax-advantageous.
   */
  estimate(input: {
    homeCountry: string;
    hostCountry: string;
    baseSalary: number;
    currency?: string;
  }): TaxEqualizationResult {
    const hypoTax = computeTax(input.homeCountry, input.baseSalary);
    const hostTax = computeTax(input.hostCountry, input.baseSalary);
    return {
      homeCountry: input.homeCountry.toUpperCase(),
      hostCountry: input.hostCountry.toUpperCase(),
      baseSalary: input.baseSalary,
      currency: input.currency ?? 'USD',
      hypoTax,
      hostTax,
      companyCost: hostTax - hypoTax,
    };
  }

  async list(params: {
    tenantId: string;
    employeeId?: string;
    taxYear?: number;
    filingStatus?: FilingStatus;
    page?: number;
    limit?: number;
  }) {
    const page = params.page ?? 1;
    const limit = Math.min(params.limit ?? 50, 200);
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = { tenantId: params.tenantId, isDeleted: false };
    if (params.employeeId) where.employeeId = params.employeeId;
    if (params.taxYear) where.taxYear = params.taxYear;
    if (params.filingStatus) where.filingStatus = params.filingStatus;

    const [items, total] = await Promise.all([
      prisma.expatTaxProfile.findMany({
        where,
        orderBy: [{ filingDueDate: 'asc' }, { createdAt: 'desc' }],
        skip,
        take: limit,
      }),
      prisma.expatTaxProfile.count({ where }),
    ]);

    return { items, total, page, pageSize: limit, hasNextPage: skip + items.length < total };
  }

  async getById(id: string, tenantId: string) {
    return prisma.expatTaxProfile.findFirst({ where: { id, tenantId, isDeleted: false } });
  }

  async create(input: {
    tenantId: string;
    employeeId: string;
    employeeName: string;
    homeCountry: string;
    hostCountry: string;
    taxYear: number;
    baseSalary?: number;
    currency?: string;
    equalizationType?: string;
    filingType?: string;
    filingDueDate?: Date;
    notes?: string;
    actorId: string;
  }) {
    const baseSalary = input.baseSalary ?? 0;
    const estimate = this.estimate({
      homeCountry: input.homeCountry,
      hostCountry: input.hostCountry,
      baseSalary,
      currency: input.currency,
    });
    return prisma.expatTaxProfile.create({
      data: {
        tenantId: input.tenantId,
        employeeId: input.employeeId,
        employeeName: input.employeeName,
        homeCountry: input.homeCountry.toUpperCase(),
        hostCountry: input.hostCountry.toUpperCase(),
        taxYear: input.taxYear,
        baseSalary,
        currency: input.currency ?? 'USD',
        hypoTax: estimate.hypoTax,
        hostTax: estimate.hostTax,
        companyCost: estimate.companyCost,
        equalizationType: input.equalizationType ?? 'gross_up',
        filingType: input.filingType ?? null,
        filingDueDate: input.filingDueDate ?? null,
        notes: input.notes ?? null,
        createdBy: input.actorId,
      },
    });
  }

  async update(
    id: string,
    tenantId: string,
    actorId: string,
    patch: Partial<{
      homeCountry: string;
      hostCountry: string;
      taxYear: number;
      baseSalary: number;
      currency: string;
      equalizationType: string;
      filingStatus: FilingStatus;
      filingType: string;
      filingDueDate: Date;
      notes: string;
    }>
  ) {
    const existing = await this.getById(id, tenantId);
    if (!existing) return null;

    // Recompute equalization when any input driver changes.
    const homeCountry = patch.homeCountry ?? existing.homeCountry;
    const hostCountry = patch.hostCountry ?? existing.hostCountry;
    const baseSalary = patch.baseSalary ?? Number(existing.baseSalary);
    const recompute =
      patch.homeCountry !== undefined ||
      patch.hostCountry !== undefined ||
      patch.baseSalary !== undefined;
    const estimate = recompute ? this.estimate({ homeCountry, hostCountry, baseSalary }) : null;

    return prisma.expatTaxProfile.update({
      where: { id: existing.id },
      data: {
        homeCountry: patch.homeCountry ? patch.homeCountry.toUpperCase() : undefined,
        hostCountry: patch.hostCountry ? patch.hostCountry.toUpperCase() : undefined,
        taxYear: patch.taxYear ?? undefined,
        baseSalary: patch.baseSalary ?? undefined,
        currency: patch.currency ?? undefined,
        equalizationType: patch.equalizationType ?? undefined,
        filingStatus: patch.filingStatus ?? undefined,
        filedAt: patch.filingStatus === 'FILED' ? new Date() : undefined,
        filingType: patch.filingType ?? undefined,
        filingDueDate: patch.filingDueDate ?? undefined,
        notes: patch.notes ?? undefined,
        hypoTax: estimate ? estimate.hypoTax : undefined,
        hostTax: estimate ? estimate.hostTax : undefined,
        companyCost: estimate ? estimate.companyCost : undefined,
        updatedBy: actorId,
      },
    });
  }

  async calculateLiability(id: string, tenantId: string, actorId: string) {
    const existing = await this.getById(id, tenantId);
    if (!existing) return null;
    const estimate = this.estimate({
      homeCountry: existing.homeCountry,
      hostCountry: existing.hostCountry,
      baseSalary: Number(existing.baseSalary),
      currency: existing.currency,
    });
    const updated = await prisma.expatTaxProfile.update({
      where: { id: existing.id },
      data: {
        hypoTax: estimate.hypoTax,
        hostTax: estimate.hostTax,
        companyCost: estimate.companyCost,
        updatedBy: actorId,
      },
    });
    return { profile: updated, estimate };
  }

  async softDelete(id: string, tenantId: string, actorId: string) {
    const existing = await this.getById(id, tenantId);
    if (!existing) return null;
    return prisma.expatTaxProfile.update({
      where: { id: existing.id },
      data: { isDeleted: true, deletedAt: new Date(), updatedBy: actorId },
    });
  }
}

export const expatTaxService = new ExpatTaxService();
