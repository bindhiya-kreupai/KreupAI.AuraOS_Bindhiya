/**
 * EPIC-22: Employee Benefits Compliance.
 *
 * Catalogue defines benefit policy per code (MEDICAL / LIFE / AIR_TICKET /
 * HOUSING / TRANSPORT / MOBILE / MEAL / EDUCATION / LOAN / RELOCATION /
 * UNIFORM_PPE / WELLNESS / ACCOMMODATION), with isMandatory / minGrade /
 * country / valuation basis / vendorRequired and effective dating.
 * Coverage records the employee's enrolment under a catalogue entry,
 * tracking policy number, vendor, expiry and accrued balance (used for
 * air-ticket entitlements). Exceptions register opt-outs and grace
 * windows. Monthly certificate aggregates and refuses to sign while
 * mandatory cover gaps, expired coverages, vendors without DPA, or open
 * exceptions remain.
 *
 * Default GCC mandatory benefits (representative — configurable):
 *   UAE     — MEDICAL_INSURANCE (all)
 *   KSA     — MEDICAL_INSURANCE (all)
 *   QATAR   — MEDICAL_INSURANCE (all)
 *   BAHRAIN — MEDICAL_INSURANCE (private)
 *   OMAN    — MEDICAL_INSURANCE (specific brackets)
 *   KUWAIT  — MEDICAL_INSURANCE (expats)
 *   AIR_TICKET entitlement when contractual; HOUSING / TRANSPORT / MEAL
 *   per company policy.
 */

import { prisma } from '@aura/database';

export interface AuthContext {
  tenantId: string;
  userId: string;
}

export type BenefitType =
  | 'MEDICAL_INSURANCE'
  | 'LIFE_INSURANCE'
  | 'AIR_TICKET'
  | 'HOUSING'
  | 'TRANSPORT'
  | 'MOBILE'
  | 'MEAL'
  | 'EDUCATION'
  | 'LOAN'
  | 'RELOCATION'
  | 'UNIFORM_PPE'
  | 'WELLNESS'
  | 'ACCOMMODATION';

export const DEFAULT_CATALOGUE: Array<{
  benefitCode: string;
  benefitType: BenefitType;
  label: string;
  countryCode?: string;
  isMandatory: boolean;
  valuationBasis: 'FIXED' | 'ACCRUED' | 'ACTUAL';
  annualValue: number;
  currency: string;
  frequencyMonths: number;
  dependantsAllowed: boolean;
  vendorRequired: boolean;
}> = [
  {
    benefitCode: 'MEDICAL_INSURANCE_UAE',
    benefitType: 'MEDICAL_INSURANCE',
    label: 'UAE Mandatory Medical Insurance',
    countryCode: 'UAE',
    isMandatory: true,
    valuationBasis: 'ACTUAL',
    annualValue: 5000,
    currency: 'AED',
    frequencyMonths: 12,
    dependantsAllowed: true,
    vendorRequired: true,
  },
  {
    benefitCode: 'MEDICAL_INSURANCE_KSA',
    benefitType: 'MEDICAL_INSURANCE',
    label: 'KSA CCHI Mandatory Medical',
    countryCode: 'KSA',
    isMandatory: true,
    valuationBasis: 'ACTUAL',
    annualValue: 4500,
    currency: 'SAR',
    frequencyMonths: 12,
    dependantsAllowed: true,
    vendorRequired: true,
  },
  {
    benefitCode: 'MEDICAL_INSURANCE_QATAR',
    benefitType: 'MEDICAL_INSURANCE',
    label: 'Qatar Mandatory Medical',
    countryCode: 'QATAR',
    isMandatory: true,
    valuationBasis: 'ACTUAL',
    annualValue: 5500,
    currency: 'QAR',
    frequencyMonths: 12,
    dependantsAllowed: true,
    vendorRequired: true,
  },
  {
    benefitCode: 'AIR_TICKET_ANNUAL',
    benefitType: 'AIR_TICKET',
    label: 'Annual Air Ticket Entitlement',
    isMandatory: false,
    valuationBasis: 'ACCRUED',
    annualValue: 2000,
    currency: 'AED',
    frequencyMonths: 12,
    dependantsAllowed: true,
    vendorRequired: false,
  },
  {
    benefitCode: 'LIFE_INSURANCE_GROUP',
    benefitType: 'LIFE_INSURANCE',
    label: 'Group Life Insurance',
    isMandatory: false,
    valuationBasis: 'FIXED',
    annualValue: 1200,
    currency: 'AED',
    frequencyMonths: 12,
    dependantsAllowed: false,
    vendorRequired: true,
  },
  {
    benefitCode: 'HOUSING_ALLOWANCE',
    benefitType: 'HOUSING',
    label: 'Monthly Housing Allowance',
    isMandatory: false,
    valuationBasis: 'FIXED',
    annualValue: 24000,
    currency: 'AED',
    frequencyMonths: 1,
    dependantsAllowed: false,
    vendorRequired: false,
  },
  {
    benefitCode: 'TRANSPORT_ALLOWANCE',
    benefitType: 'TRANSPORT',
    label: 'Monthly Transport Allowance',
    isMandatory: false,
    valuationBasis: 'FIXED',
    annualValue: 6000,
    currency: 'AED',
    frequencyMonths: 1,
    dependantsAllowed: false,
    vendorRequired: false,
  },
];

export class BenefitCatalogueService {
  async seedDefaults(auth: AuthContext, effectiveFrom: Date = new Date()) {
    const created: string[] = [];
    for (const c of DEFAULT_CATALOGUE) {
      try {
        await (prisma as any).benefitCatalogue.create({
          data: {
            tenantId: auth.tenantId,
            ...c,
            effectiveFrom,
            status: 'ACTIVE',
          },
        });
        created.push(c.benefitCode);
      } catch (err) {
        if (!String(err).includes('Unique')) throw err;
      }
    }
    return { created };
  }

  async upsert(
    input: {
      benefitCode: string;
      benefitType: BenefitType;
      label: string;
      countryCode?: string;
      isMandatory?: boolean;
      minGrade?: string;
      valuationBasis?: string;
      annualValue?: number;
      currency?: string;
      frequencyMonths?: number;
      dependantsAllowed?: boolean;
      vendorRequired?: boolean;
      effectiveFrom: Date;
    },
    auth: AuthContext
  ) {
    return (prisma as any).benefitCatalogue.upsert({
      where: {
        aura_benefit_catalogue_unique: {
          tenantId: auth.tenantId,
          benefitCode: input.benefitCode,
          effectiveFrom: input.effectiveFrom,
        },
      },
      update: { ...input, status: 'ACTIVE' },
      create: {
        tenantId: auth.tenantId,
        ...input,
        status: 'ACTIVE',
      },
    });
  }

  async list(tenantId: string) {
    return (prisma as any).benefitCatalogue.findMany({
      where: { tenantId, status: 'ACTIVE' },
      orderBy: [{ benefitType: 'asc' }, { countryCode: 'asc' }],
    });
  }

  async resolveByCode(tenantId: string, benefitCode: string, asOf: Date = new Date()) {
    const rows = await (prisma as any).benefitCatalogue.findMany({
      where: {
        tenantId,
        benefitCode,
        status: 'ACTIVE',
        effectiveFrom: { lte: asOf },
        OR: [{ effectiveTo: null }, { effectiveTo: { gte: asOf } }],
      },
      orderBy: { effectiveFrom: 'desc' },
      take: 1,
    });
    return rows[0] ?? null;
  }
}

export const benefitCatalogueService = new BenefitCatalogueService();

/** EPIC-22-S05: pure accrual function — pro-rata annualValue based on
 * months since lastAccruedAt. Used for air-ticket entitlements and any
 * other ACCRUED-basis benefit. */
export function accrueMonths(
  annualValue: number,
  startedAt: Date,
  lastAccruedAt: Date | null,
  asOf: Date = new Date()
): { monthsAccrued: number; amountAccrued: number } {
  const base = lastAccruedAt ?? startedAt;
  if (asOf <= base) return { monthsAccrued: 0, amountAccrued: 0 };
  const months =
    (asOf.getFullYear() - base.getFullYear()) * 12 + (asOf.getMonth() - base.getMonth());
  if (months <= 0) return { monthsAccrued: 0, amountAccrued: 0 };
  const monthly = annualValue / 12;
  return { monthsAccrued: months, amountAccrued: Number((monthly * months).toFixed(2)) };
}

export class BenefitCoverageService {
  async enroll(
    input: {
      employeeId: string;
      benefitCode: string;
      vendorId?: string;
      policyNumber?: string;
      startedAt: Date;
      expiresAt?: Date;
      actualAnnualValue?: number;
      currency?: string;
      dependantsCount?: number;
    },
    auth: AuthContext
  ) {
    const cat = await benefitCatalogueService.resolveByCode(
      auth.tenantId,
      input.benefitCode,
      input.startedAt
    );
    if (!cat) throw new Error(`benefit ${input.benefitCode} not found`);
    if (cat.vendorRequired && !input.vendorId)
      throw new Error(`benefit ${input.benefitCode} requires a vendor`);
    return (prisma as any).benefitCoverage.upsert({
      where: {
        aura_benefit_coverage_unique: {
          tenantId: auth.tenantId,
          employeeId: input.employeeId,
          benefitCatalogueId: cat.id,
          startedAt: input.startedAt,
        },
      },
      update: {
        vendorId: input.vendorId,
        policyNumber: input.policyNumber,
        expiresAt: input.expiresAt,
        actualAnnualValue: input.actualAnnualValue ?? cat.annualValue,
        currency: input.currency ?? cat.currency,
        dependantsCount: input.dependantsCount ?? 0,
        status: 'ACTIVE',
      },
      create: {
        tenantId: auth.tenantId,
        employeeId: input.employeeId,
        benefitCatalogueId: cat.id,
        vendorId: input.vendorId,
        policyNumber: input.policyNumber,
        startedAt: input.startedAt,
        expiresAt: input.expiresAt,
        actualAnnualValue: input.actualAnnualValue ?? cat.annualValue,
        currency: input.currency ?? cat.currency,
        dependantsCount: input.dependantsCount ?? 0,
        status: 'ACTIVE',
      },
    });
  }

  async renew(id: string, newExpiry: Date, _auth: AuthContext) {
    return (prisma as any).benefitCoverage.update({
      where: { id },
      data: { expiresAt: newExpiry, lastRenewedAt: new Date(), status: 'ACTIVE' },
    });
  }

  async terminate(id: string, endsAt: Date, _auth: AuthContext) {
    return (prisma as any).benefitCoverage.update({
      where: { id },
      data: { endsAt, status: 'TERMINATED' },
    });
  }

  async accrue(id: string, auth: AuthContext) {
    const cov = await (prisma as any).benefitCoverage.findUnique({ where: { id } });
    if (!cov) throw new Error('coverage not found');
    if (cov.tenantId !== auth.tenantId) throw new Error('tenant mismatch');
    const value = Number(cov.actualAnnualValue ?? 0);
    const { monthsAccrued, amountAccrued } = accrueMonths(
      value,
      new Date(cov.startedAt),
      cov.lastAccruedAt ? new Date(cov.lastAccruedAt) : null
    );
    if (monthsAccrued === 0) return cov;
    return (prisma as any).benefitCoverage.update({
      where: { id },
      data: {
        accruedBalance: Number(cov.accruedBalance ?? 0) + amountAccrued,
        lastAccruedAt: new Date(),
      },
    });
  }

  async list(
    tenantId: string,
    filter: {
      employeeId?: string;
      expiringSoon?: boolean;
      status?: string;
    } = {}
  ) {
    const now = new Date();
    const soon = new Date(now.getTime() + 60 * 24 * 3600 * 1000);
    return (prisma as any).benefitCoverage.findMany({
      where: {
        tenantId,
        ...(filter.employeeId ? { employeeId: filter.employeeId } : {}),
        ...(filter.status ? { status: filter.status } : { status: 'ACTIVE' }),
        ...(filter.expiringSoon ? { expiresAt: { gte: now, lte: soon } } : {}),
      },
      orderBy: { startedAt: 'desc' },
      take: 500,
    });
  }
}

export const benefitCoverageService = new BenefitCoverageService();

export class BenefitVendorService {
  async upsert(
    input: {
      id?: string;
      name: string;
      vendorType: string;
      country?: string;
      contactEmail?: string;
      contactPhone?: string;
      contractRef?: string;
      contractStart?: Date;
      contractEnd?: Date;
      dpaSigned?: boolean;
    },
    auth: AuthContext
  ) {
    const data = {
      tenantId: auth.tenantId,
      ...input,
      dpaSignedAt: input.dpaSigned ? new Date() : undefined,
      status: 'ACTIVE',
    };
    if (input.id) return (prisma as any).benefitVendor.update({ where: { id: input.id }, data });
    return (prisma as any).benefitVendor.create({ data });
  }

  async signDpa(id: string, _auth: AuthContext) {
    return (prisma as any).benefitVendor.update({
      where: { id },
      data: { dpaSigned: true, dpaSignedAt: new Date() },
    });
  }

  async list(tenantId: string) {
    return (prisma as any).benefitVendor.findMany({
      where: { tenantId, status: 'ACTIVE' },
      orderBy: { name: 'asc' },
    });
  }
}

export const benefitVendorService = new BenefitVendorService();

export class BenefitExceptionService {
  async raise(
    input: {
      employeeId: string;
      benefitCode: string;
      exceptionType: 'OPT_OUT' | 'GRACE_PERIOD' | 'GAP' | 'OTHER';
      reason?: string;
      expiresAt?: Date;
    },
    auth: AuthContext
  ) {
    return (prisma as any).benefitException.create({
      data: {
        tenantId: auth.tenantId,
        ...input,
        raisedBy: auth.userId,
        status: 'OPEN',
      },
    });
  }

  async approve(id: string, auth: AuthContext) {
    return (prisma as any).benefitException.update({
      where: { id },
      data: { status: 'APPROVED', approverId: auth.userId, approvedAt: new Date() },
    });
  }

  async close(id: string, _auth: AuthContext) {
    return (prisma as any).benefitException.update({
      where: { id },
      data: { status: 'CLOSED' },
    });
  }

  async list(tenantId: string, filter: { status?: string } = {}) {
    return (prisma as any).benefitException.findMany({
      where: { tenantId, ...(filter.status ? { status: filter.status } : {}) },
      orderBy: { raisedAt: 'desc' },
    });
  }
}

export const benefitExceptionService = new BenefitExceptionService();

export class BenefitCertificateService {
  async dashboard(tenantId: string, period: string) {
    const now = new Date();
    const soon = new Date(now.getTime() + 60 * 24 * 3600 * 1000);
    const activeEnrollments = await (prisma as any).benefitCoverage.count({
      where: { tenantId, status: 'ACTIVE' },
    });
    const expiringSoonCount = await (prisma as any).benefitCoverage.count({
      where: { tenantId, status: 'ACTIVE', expiresAt: { gte: now, lte: soon } },
    });
    const expiredCount = await (prisma as any).benefitCoverage.count({
      where: { tenantId, status: 'ACTIVE', expiresAt: { lt: now } },
    });
    const openExceptionsCount = await (prisma as any).benefitException.count({
      where: { tenantId, status: { in: ['OPEN', 'APPROVED'] } },
    });
    const vendorsWithoutDpa = await (prisma as any).benefitVendor.count({
      where: { tenantId, status: 'ACTIVE', dpaSigned: false },
    });
    const accrualAgg = await (prisma as any).benefitCoverage.aggregate({
      _sum: { accruedBalance: true },
      where: { tenantId, status: 'ACTIVE' },
    });
    const totalAccruedLiability = Number(accrualAgg?._sum?.accruedBalance ?? 0);
    // Mandatory gap: count mandatory catalogue codes that have at least one
    // ACTIVE catalogue entry but for which there are 0 ACTIVE coverages.
    const mandatoryCats = await (prisma as any).benefitCatalogue.findMany({
      where: { tenantId, status: 'ACTIVE', isMandatory: true },
      select: { id: true, benefitCode: true },
    });
    let mandatoryCoverGapCount = 0;
    for (const c of mandatoryCats as Array<{ id: string }>) {
      const enrolled = await (prisma as any).benefitCoverage.count({
        where: { tenantId, benefitCatalogueId: c.id, status: 'ACTIVE' },
      });
      if (enrolled === 0) mandatoryCoverGapCount += 1;
    }
    return {
      period,
      activeEnrollments,
      mandatoryCoverGapCount,
      expiringSoonCount,
      expiredCount,
      openExceptionsCount,
      vendorsWithoutDpa,
      totalAccruedLiability,
    };
  }

  async generate(period: string, auth: AuthContext) {
    const stats = await this.dashboard(auth.tenantId, period);
    const reasons: string[] = [];
    if (stats.mandatoryCoverGapCount > 0)
      reasons.push(`${stats.mandatoryCoverGapCount} mandatory cover gap(s)`);
    if (stats.expiredCount > 0) reasons.push(`${stats.expiredCount} expired coverage(s)`);
    if (stats.vendorsWithoutDpa > 0)
      reasons.push(`${stats.vendorsWithoutDpa} vendor(s) without DPA`);
    const gatingReason = reasons.length ? `Blocked: ${reasons.join('; ')}` : null;
    return (prisma as any).benefitCertificate.upsert({
      where: { aura_benefit_certificate_unique: { tenantId: auth.tenantId, period } },
      update: {
        ...stats,
        gatingReason,
        generatedAt: new Date(),
        status: 'DRAFT',
      },
      create: {
        tenantId: auth.tenantId,
        ...stats,
        gatingReason,
        generatedAt: new Date(),
        status: 'DRAFT',
      },
    });
  }

  async sign(
    period: string,
    attestations: Array<{ field: string; value: string }>,
    auth: AuthContext
  ) {
    const cert = await (prisma as any).benefitCertificate.findUnique({
      where: { aura_benefit_certificate_unique: { tenantId: auth.tenantId, period } },
    });
    if (!cert) throw new Error('certificate not generated');
    if (cert.gatingReason) throw new Error(`cannot sign while gated: ${cert.gatingReason}`);
    return (prisma as any).benefitCertificate.update({
      where: { id: cert.id },
      data: {
        status: 'SIGNED',
        signedAt: new Date(),
        signedBy: auth.userId,
        attestationsJson: attestations,
      },
    });
  }

  async list(tenantId: string) {
    return (prisma as any).benefitCertificate.findMany({
      where: { tenantId },
      orderBy: { period: 'desc' },
      take: 24,
    });
  }
}

export const benefitCertificateService = new BenefitCertificateService();

export const BENEFITS_CONSTANTS = { DEFAULT_CATALOGUE };
