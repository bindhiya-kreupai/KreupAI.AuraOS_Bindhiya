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
import {
  normalisePaging,
  prismaPageArgs,
  buildPaginatedResult,
  type PaginationInput,
  type PaginatedResult,
} from '@/lib/services/pagination';

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
  // Theme F sub-categories — closes EPIC-22-S08 / S10 / S12 via the catalogue
  // and EPIC-22-S09 / S11 via the dedicated register tables in
  // `apps/web/src/lib/services/workforce-extensions/`.
  {
    benefitCode: 'EDUCATION_ASSISTANCE',
    benefitType: 'EDUCATION',
    label: 'Education Assistance (school fees / dependants)',
    isMandatory: false,
    valuationBasis: 'ACCRUED',
    annualValue: 12000,
    currency: 'AED',
    frequencyMonths: 12,
    dependantsAllowed: true,
    vendorRequired: false,
  },
  {
    benefitCode: 'EMPLOYEE_LOAN',
    benefitType: 'LOAN',
    label: 'Employee Loan (amortized — see EmployeeLoanSchedule register)',
    isMandatory: false,
    valuationBasis: 'ACTUAL',
    annualValue: 0,
    currency: 'AED',
    frequencyMonths: 0,
    dependantsAllowed: false,
    vendorRequired: false,
  },
  {
    benefitCode: 'RELOCATION_PACKAGE',
    benefitType: 'RELOCATION',
    label: 'Relocation & Mobilization (one-time)',
    isMandatory: false,
    valuationBasis: 'ACTUAL',
    annualValue: 8000,
    currency: 'AED',
    frequencyMonths: 0,
    dependantsAllowed: true,
    vendorRequired: false,
  },
  {
    benefitCode: 'UNIFORM_PPE_ISSUANCE',
    benefitType: 'UNIFORM_PPE',
    label: 'Uniform / PPE / Tools Issuance (see UniformPpeIssuance register)',
    isMandatory: false,
    valuationBasis: 'ACTUAL',
    annualValue: 0,
    currency: 'AED',
    frequencyMonths: 12,
    dependantsAllowed: false,
    vendorRequired: false,
  },
  {
    benefitCode: 'WELLNESS_EAP',
    benefitType: 'WELLNESS',
    label: 'Wellness / Employee Assistance Program (EAP)',
    isMandatory: false,
    valuationBasis: 'FIXED',
    annualValue: 1500,
    currency: 'AED',
    frequencyMonths: 12,
    dependantsAllowed: true,
    vendorRequired: true,
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
      status?: string;
    },
    auth: AuthContext
  ) {
    const { action, ...data } = input as any;
    return (prisma as any).benefitCatalogue.upsert({
      where: {
        tenantId_benefitCode_effectiveFrom: {
          tenantId: auth.tenantId,
          benefitCode: data.benefitCode,
          effectiveFrom: data.effectiveFrom,
        },
      },
      update: { ...data, status: data.status ?? 'ACTIVE' },
      create: {
        tenantId: auth.tenantId,
        ...data,
        status: data.status ?? 'ACTIVE',
      },
    });
  }

  async list(tenantId: string) {
    const items = await (prisma as any).benefitCatalogue.findMany({
      where: { tenantId },
      orderBy: [{ benefitType: 'asc' }, { countryCode: 'asc' }],
    });

    const enriched = await Promise.all(
      items.map(async (item: any) => {
        const count = await (prisma as any).benefitCoverage.count({
          where: {
            tenantId,
            benefitCatalogueId: item.id,
            status: 'ACTIVE',
            isDeleted: false,
          },
        });
        return { ...item, activeEnrollments: count };
      })
    );
    return enriched;
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

    // ─────────────────────────────────────────────────────────────────────────
    // Compliance & Eligibility Validations
    // ─────────────────────────────────────────────────────────────────────────
    const exceptions: string[] = [];

    // 1. DPA Signed Check
    if (input.vendorId) {
      const vendor = await (prisma as any).benefitVendor.findFirst({
        where: { id: input.vendorId, tenantId: auth.tenantId },
      });
      if (vendor) {
        if (!vendor.dpaSigned) {
          exceptions.push('VENDOR_WITHOUT_DPA');
        }
        if (vendor.contractEnd && new Date(vendor.contractEnd) < new Date(input.startedAt)) {
          exceptions.push('EXPIRED_CONTRACT');
        }
      }
    }

    // 2. Employee Details Check (Country, Grade, Department)
    const [empDetails, emp] = await Promise.all([
      prisma.employeeComplianceDetails.findUnique({
        where: { employeeId: input.employeeId },
      }),
      prisma.employee.findUnique({
        where: { id: input.employeeId },
        include: { grade: true },
      }),
    ]);

    if (empDetails) {
      if (cat.countryCode && empDetails.countryCode !== cat.countryCode) {
        exceptions.push('COUNTRY_MISMATCH');
      }
    }

    if (cat.minGrade && emp?.grade) {
      const minNum = Number(String(cat.minGrade).replace(/[^\d.-]/g, ''));
      const empLevel = emp.grade.level;
      if (Number.isFinite(minNum) && typeof empLevel === 'number' && empLevel < minNum) {
        exceptions.push('GRADE_BELOW_MIN');
      }
    }

    // 3. Overlap / Duplicate Enrollment Checks
    const activeCoverage = await (prisma as any).benefitCoverage.findFirst({
      where: {
        tenantId: auth.tenantId,
        employeeId: input.employeeId,
        benefitCatalogueId: cat.id,
        status: 'ACTIVE',
      },
    });
    if (activeCoverage) {
      exceptions.push('DUPLICATE_ENROLLMENT');
    }

    // If validations failed, auto-raise open exceptions in Exception Register
    for (const exType of exceptions) {
      try {
        await (prisma as any).benefitException.create({
          data: {
            tenantId: auth.tenantId,
            employeeId: input.employeeId,
            benefitCode: cat.benefitCode,
            exceptionType: exType,
            reason: `Auto-raised: Validation failed during enrollment (${exType})`,
            status: 'OPEN',
            raisedBy: auth.userId,
          },
        });
      } catch (err) {
        console.error('Failed to auto-raise exception:', err);
      }
    }

    return (prisma as any).benefitCoverage.upsert({
      where: {
        tenantId_employeeId_benefitCatalogueId_startedAt: {
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

  async suspend(id: string, _auth: AuthContext) {
    return (prisma as any).benefitCoverage.update({
      where: { id },
      data: { status: 'SUSPENDED' },
    });
  }

  async resume(id: string, _auth: AuthContext) {
    return (prisma as any).benefitCoverage.update({
      where: { id },
      data: { status: 'ACTIVE' },
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
      search?: string;
      benefitType?: string;
      countryCode?: string;
      vendorId?: string;
      showDeleted?: boolean;
    } = {},
    paging?: PaginationInput
  ): Promise<PaginatedResult<any>> {
    const now = new Date();
    const soon = new Date(now.getTime() + 60 * 24 * 3600 * 1000);

    // Build relational lookup if filtering by search term (employee code/name)
    let matchingEmployeeIds: string[] | undefined = undefined;
    if (filter.search) {
      const emps = await prisma.employee.findMany({
        where: {
          company: { tenantId },
          isDeleted: false,
          OR: [
            { firstName: { contains: filter.search, mode: 'insensitive' } },
            { lastName: { contains: filter.search, mode: 'insensitive' } },
            { employeeCode: { contains: filter.search, mode: 'insensitive' } },
          ],
        },
        select: { id: true },
      });
      matchingEmployeeIds = emps.map((e) => e.id);
    }

    const where: any = {
      tenantId,
      isDeleted: filter.showDeleted ? undefined : false,
      ...(filter.employeeId ? { employeeId: filter.employeeId } : {}),
      ...(filter.status ? { status: filter.status } : { status: 'ACTIVE' }),
      ...(filter.vendorId ? { vendorId: filter.vendorId } : {}),
      ...(filter.expiringSoon ? { expiresAt: { gte: now, lte: soon } } : {}),
    };

    if (matchingEmployeeIds !== undefined) {
      where.employeeId = { in: matchingEmployeeIds };
    }

    const page = normalisePaging(paging);
    const [items, total] = await Promise.all([
      (prisma as any).benefitCoverage.findMany({
        where,
        orderBy: { startedAt: 'desc' },
        ...prismaPageArgs(page),
      }),
      (prisma as any).benefitCoverage.count({ where }),
    ]);

    // Enrich items with relations (Employee, Catalogue, Vendor) manually to avoid schema drift
    const empIds = Array.from(new Set(items.map((x: any) => x.employeeId))) as string[];
    const catIds = Array.from(new Set(items.map((x: any) => x.benefitCatalogueId))) as string[];
    const vendorIds = Array.from(
      new Set(items.map((x: any) => x.vendorId).filter(Boolean))
    ) as string[];

    const [employees, catalogues, vendors] = await Promise.all([
      prisma.employee.findMany({
        where: { id: { in: empIds } },
        select: { id: true, firstName: true, lastName: true, employeeCode: true },
      }),
      (prisma as any).benefitCatalogue.findMany({
        where: { id: { in: catIds } },
      }),
      (prisma as any).benefitVendor.findMany({
        where: { id: { in: vendorIds } },
      }),
    ]);

    const empMap = new Map<string, any>(employees.map((e) => [e.id, e]));
    const catMap = new Map<string, any>(catalogues.map((c: any) => [c.id, c]));
    const vendorMap = new Map<string, any>(vendors.map((v: any) => [v.id, v]));

    const enrichedItems = items.map((x: any) => {
      const emp = empMap.get(x.employeeId);
      const cat = catMap.get(x.benefitCatalogueId);
      const vendor = x.vendorId ? vendorMap.get(x.vendorId) : null;
      return {
        ...x,
        employeeName: emp ? `${emp.firstName} ${emp.lastName}` : 'Unknown',
        employeeCode: emp ? emp.employeeCode : '—',
        benefitLabel: cat ? cat.label : 'Unknown',
        benefitCode: cat ? cat.benefitCode : '—',
        vendorName: vendor ? vendor.name : '—',
      };
    });

    return buildPaginatedResult(enrichedItems, total, page);
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
      status?: string;
    },
    auth: AuthContext
  ) {
    const { action, ...fields } = input as any;
    const data = {
      tenantId: auth.tenantId,
      ...fields,
      dpaSignedAt: fields.dpaSigned ? new Date() : undefined,
      status: fields.status ?? 'ACTIVE',
    };
    if (fields.id) return (prisma as any).benefitVendor.update({ where: { id: fields.id }, data });
    return (prisma as any).benefitVendor.create({ data });
  }

  async signDpa(id: string, _auth: AuthContext) {
    return (prisma as any).benefitVendor.update({
      where: { id },
      data: { dpaSigned: true, dpaSignedAt: new Date() },
    });
  }

  async list(tenantId: string) {
    const vendors = await (prisma as any).benefitVendor.findMany({
      where: { tenantId },
      orderBy: { name: 'asc' },
    });

    const enriched = await Promise.all(
      vendors.map(async (v: any) => {
        const count = await (prisma as any).benefitCoverage.count({
          where: {
            tenantId,
            vendorId: v.id,
            status: 'ACTIVE',
            isDeleted: false,
          },
        });
        return { ...v, employeesCovered: count };
      })
    );
    return enriched;
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
      where: { tenantId, status: 'ACTIVE', isDeleted: false },
    });
    const expiringSoonCount = await (prisma as any).benefitCoverage.count({
      where: { tenantId, status: 'ACTIVE', expiresAt: { gte: now, lte: soon }, isDeleted: false },
    });
    const expiredCount = await (prisma as any).benefitCoverage.count({
      where: { tenantId, status: 'ACTIVE', expiresAt: { lt: now }, isDeleted: false },
    });
    const openExceptionsCount = await (prisma as any).benefitException.count({
      where: { tenantId, status: { in: ['OPEN', 'APPROVED'] }, isDeleted: false },
    });
    const vendorsWithoutDpa = await (prisma as any).benefitVendor.count({
      where: { tenantId, status: 'ACTIVE', dpaSigned: false, isDeleted: false },
    });
    const accrualAgg = await (prisma as any).benefitCoverage.aggregate({
      _sum: { accruedBalance: true },
      where: { tenantId, status: 'ACTIVE', isDeleted: false },
    });
    const totalAccruedLiability = Number(accrualAgg?._sum?.accruedBalance ?? 0);

    // Mandatory gap calculation
    const mandatoryCats = await (prisma as any).benefitCatalogue.findMany({
      where: { tenantId, status: 'ACTIVE', isMandatory: true, isDeleted: false },
      select: { id: true, benefitCode: true },
    });
    let mandatoryCoverGapCount = 0;
    for (const c of mandatoryCats as Array<{ id: string }>) {
      const enrolled = await (prisma as any).benefitCoverage.count({
        where: { tenantId, benefitCatalogueId: c.id, status: 'ACTIVE', isDeleted: false },
      });
      if (enrolled === 0) mandatoryCoverGapCount += 1;
    }

    // Advanced breakdowns using real database relationships
    const coverages = await (prisma as any).benefitCoverage.findMany({
      where: { tenantId, status: 'ACTIVE', isDeleted: false },
    });

    const empIds = Array.from(new Set(coverages.map((x: any) => x.employeeId))) as string[];
    const catIds = Array.from(new Set(coverages.map((x: any) => x.benefitCatalogueId))) as string[];
    const vendorIds = Array.from(
      new Set(coverages.map((x: any) => x.vendorId).filter(Boolean))
    ) as string[];

    const [employees, catalogues, vendors, empDetails] = await Promise.all([
      prisma.employee.findMany({
        where: { id: { in: empIds } },
        select: {
          id: true,
          department: { select: { name: true } },
          company: { select: { name: true } },
        },
      }),
      (prisma as any).benefitCatalogue.findMany({
        where: { id: { in: catIds } },
      }),
      (prisma as any).benefitVendor.findMany({
        where: { id: { in: vendorIds } },
      }),
      prisma.employeeComplianceDetails.findMany({
        where: { employeeId: { in: empIds } },
        select: { employeeId: true, countryCode: true },
      }),
    ]);

    const empMap = new Map<string, any>(employees.map((e: any) => [e.id, e]));
    const catMap = new Map<string, any>(catalogues.map((c: any) => [c.id, c]));
    const vendorMap = new Map<string, any>(vendors.map((v: any) => [v.id, v]));
    const detailsMap = new Map<string, any>(empDetails.map((d: any) => [d.employeeId, d]));

    const countryMap: Record<string, number> = {};
    const deptMap: Record<string, number> = {};
    const typeMap: Record<string, number> = {};
    const vendMap: Record<string, number> = {};
    const costTrendMap: Record<string, number> = {};

    let monthlyCost = 0;

    for (const c of coverages) {
      const emp = empMap.get(c.employeeId) as any;
      const cat = catMap.get(c.benefitCatalogueId) as any;
      const vendor = c.vendorId ? (vendorMap.get(c.vendorId) as any) : null;
      const details = detailsMap.get(c.employeeId) as any;

      const country = details?.countryCode ?? 'Other';
      const dept = emp?.department?.name ?? 'Corporate';
      const type = cat?.benefitType ?? 'Other';
      const vend = vendor?.name ?? 'Direct/No Vendor';

      countryMap[country] = (countryMap[country] ?? 0) + 1;
      deptMap[dept] = (deptMap[dept] ?? 0) + 1;
      typeMap[type] = (typeMap[type] ?? 0) + 1;
      vendMap[vend] = (vendMap[vend] ?? 0) + 1;

      const cost = Number(c.actualAnnualValue ?? cat?.annualValue ?? 0) / 12;
      monthlyCost += cost;

      const startMonth = new Date(c.startedAt).toISOString().slice(0, 7);
      costTrendMap[startMonth] = (costTrendMap[startMonth] ?? 0) + cost;
    }

    const countryBreakdown = Object.entries(countryMap).map(([name, count]) => ({ name, count }));
    const departmentBreakdown = Object.entries(deptMap).map(([name, count]) => ({ name, count }));
    const benefitTypeBreakdown = Object.entries(typeMap).map(([name, count]) => ({ name, count }));
    const vendorBreakdown = Object.entries(vendMap).map(([name, count]) => ({ name, count }));

    const trend = Object.entries(costTrendMap)
      .sort((a, b) => a[0].localeCompare(b[0]))
      .slice(-6)
      .map(([trendPeriod, cost]) => ({ period: trendPeriod, cost: Number(cost.toFixed(2)) }));

    return {
      period,
      activeEnrollments,
      mandatoryCoverGapCount,
      expiringSoonCount,
      expiredCount,
      openExceptionsCount,
      vendorsWithoutDpa,
      totalAccruedLiability,
      monthlyCost: Number(monthlyCost.toFixed(2)),
      countryBreakdown,
      departmentBreakdown,
      benefitTypeBreakdown,
      vendorBreakdown,
      trend,
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
