import { prisma } from '@aura/database';
import type { Prisma } from '@prisma/client';

type CardStatus = 'PENDING' | 'REQUESTED' | 'ISSUED' | 'BLOCKED' | 'WAIVED';

interface AuthContext {
  tenantId: string;
  userId: string;
}

interface BenefitsOnboardingInput {
  employeeId: string;
  planId?: string;
  onboardingInstanceId?: string | null;
  dependentIds?: string[];
  effectiveFrom?: Date;
  notes?: string | null;
}

interface CardIssueInput {
  vendorReference: string;
  insuranceCardStatus?: CardStatus;
  insuranceCardIssuedAt?: Date;
  notes?: string | null;
}

interface MedicalCoverRule {
  countryCode: string;
  mandatory: boolean;
  authority: string;
  vendorFileCode: string;
  cardRequiredForCompletion: boolean;
  ruleVersion: string;
}

const MEDICAL_COVER_RULES: Record<string, MedicalCoverRule> = {
  AE: {
    countryCode: 'AE',
    mandatory: true,
    authority: 'Emirate Health Insurance Authority',
    vendorFileCode: 'UAE_MEDICAL_ENROLLMENT',
    cardRequiredForCompletion: true,
    ruleVersion: '2026.1',
  },
  SA: {
    countryCode: 'SA',
    mandatory: true,
    authority: 'CCHI',
    vendorFileCode: 'KSA_CCHI_ENROLLMENT',
    cardRequiredForCompletion: true,
    ruleVersion: '2026.1',
  },
  BH: {
    countryCode: 'BH',
    mandatory: true,
    authority: 'Bahrain Health Insurance',
    vendorFileCode: 'BH_MEDICAL_ENROLLMENT',
    cardRequiredForCompletion: true,
    ruleVersion: '2026.1',
  },
  OM: {
    countryCode: 'OM',
    mandatory: true,
    authority: 'Oman Health Insurance',
    vendorFileCode: 'OM_MEDICAL_ENROLLMENT',
    cardRequiredForCompletion: true,
    ruleVersion: '2026.1',
  },
  QA: {
    countryCode: 'QA',
    mandatory: true,
    authority: 'Qatar Health Insurance',
    vendorFileCode: 'QA_MEDICAL_ENROLLMENT',
    cardRequiredForCompletion: true,
    ruleVersion: '2026.1',
  },
  KW: {
    countryCode: 'KW',
    mandatory: true,
    authority: 'Kuwait Health Assurance',
    vendorFileCode: 'KW_MEDICAL_ENROLLMENT',
    cardRequiredForCompletion: true,
    ruleVersion: '2026.1',
  },
};

function asStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === 'string');
}

function readEligibility(criteria: unknown, key: string): string[] {
  if (!criteria || typeof criteria !== 'object' || Array.isArray(criteria)) return [];
  return asStringArray((criteria as Record<string, unknown>)[key]);
}

function matchesAny(allowed: string[], value?: string | null) {
  return allowed.length === 0 || (value ? allowed.includes(value) : false);
}

export class BenefitsOnboardingService {
  async list(tenantId: string, filters: { employeeId?: string; cardStatus?: string }) {
    const rows = await prisma.benefitEnrollment.findMany({
      where: {
        tenantId,
        isDeleted: false,
        plan: { category: 'HEALTH_INSURANCE' },
        ...(filters.employeeId ? { employeeId: filters.employeeId } : {}),
        ...(filters.cardStatus ? { insuranceCardStatus: filters.cardStatus } : {}),
      },
      orderBy: [{ updatedAt: 'desc' }],
      include: { plan: true },
    });

    return rows.map((row) => this.toDto(row));
  }

  async evaluate(tenantId: string, employeeId: string) {
    const context = await this.loadEmployeeContext(tenantId, employeeId);
    const rule = MEDICAL_COVER_RULES[context.countryCode] ?? {
      countryCode: context.countryCode,
      mandatory: false,
      authority: 'Not configured',
      vendorFileCode: 'NOT_APPLICABLE',
      cardRequiredForCompletion: false,
      ruleVersion: 'unconfigured',
    };

    const plans = await prisma.benefitPlan.findMany({
      where: {
        tenantId,
        category: 'HEALTH_INSURANCE',
        status: 'ACTIVE',
        isDeleted: false,
        effectiveFrom: { lte: new Date() },
        OR: [{ effectiveTo: null }, { effectiveTo: { gte: new Date() } }],
      },
      orderBy: [{ displayOrder: 'asc' }, { planName: 'asc' }],
    });
    const eligiblePlans = plans.filter((plan) => this.planMatches(plan, context));
    const selectedPlan = eligiblePlans[0] ?? null;

    const existing = selectedPlan
      ? await prisma.benefitEnrollment.findFirst({
          where: {
            tenantId,
            employeeId,
            planId: selectedPlan.id,
            isDeleted: false,
            status: { in: ['DRAFT', 'PENDING_APPROVAL', 'APPROVED', 'ACTIVE'] },
          },
          include: { plan: true },
          orderBy: { updatedAt: 'desc' },
        })
      : await prisma.benefitEnrollment.findFirst({
          where: {
            tenantId,
            employeeId,
            isDeleted: false,
            plan: { category: 'HEALTH_INSURANCE' },
            status: { in: ['DRAFT', 'PENDING_APPROVAL', 'APPROVED', 'ACTIVE'] },
          },
          include: { plan: true },
          orderBy: { updatedAt: 'desc' },
        });

    const dependents = await this.loadDependents(tenantId, employeeId, undefined);

    return {
      employeeId,
      countryCode: context.countryCode,
      regionCode: context.regionCode,
      gradeCode: context.gradeCode,
      mandatory: rule.mandatory,
      authority: rule.authority,
      ruleVersion: rule.ruleVersion,
      selectedPlan: selectedPlan ? this.planDto(selectedPlan) : null,
      eligiblePlanCount: eligiblePlans.length,
      dependentCount: dependents.length,
      existingEnrollment: existing ? this.toDto(existing) : null,
      blockCompletion: rule.mandatory,
    };
  }

  async createOrUpdate(input: BenefitsOnboardingInput, auth: AuthContext) {
    const context = await this.loadEmployeeContext(auth.tenantId, input.employeeId);
    const evaluated = await this.evaluate(auth.tenantId, input.employeeId);
    const planId = input.planId ?? evaluated.selectedPlan?.id;
    if (!planId) {
      throw new Error('No active eligible medical insurance plan found for employee');
    }

    const plan = await prisma.benefitPlan.findFirst({
      where: {
        id: planId,
        tenantId: auth.tenantId,
        category: 'HEALTH_INSURANCE',
        status: 'ACTIVE',
      },
    });
    if (!plan) {
      throw new Error('Medical insurance plan not found or inactive');
    }
    if (!this.planMatches(plan, context)) {
      throw new Error('Medical insurance plan is not eligible for employee location or grade');
    }

    const dependents = await this.loadDependents(
      auth.tenantId,
      input.employeeId,
      input.dependentIds
    );
    const coverageLevel = this.coverageLevelForDependents(dependents);
    const totalPremium = this.totalPremium(plan, coverageLevel);
    const vendorFile = this.buildVendorEnrollmentFile(context, plan, dependents);

    const existing = await prisma.benefitEnrollment.findFirst({
      where: {
        tenantId: auth.tenantId,
        employeeId: input.employeeId,
        planId,
        isDeleted: false,
        status: { in: ['DRAFT', 'PENDING_APPROVAL', 'APPROVED', 'ACTIVE'] },
      },
      include: { plan: true },
    });

    const data = {
      onboardingInstanceId: input.onboardingInstanceId ?? existing?.onboardingInstanceId ?? null,
      employeeName: `${context.employee.firstName} ${context.employee.lastName}`,
      employeeCode: context.employee.employeeCode,
      departmentId: context.employee.departmentId,
      departmentName: context.employee.department?.name ?? null,
      coverageLevel,
      enrollmentType: 'NEW_HIRE' as const,
      status: 'PENDING_APPROVAL' as const,
      effectiveFrom: input.effectiveFrom ?? context.employee.joiningDate ?? new Date(),
      employeePremium: plan.employeePremium,
      employerPremium: plan.employerPremium,
      totalPremium,
      enrolledDependents: dependents as unknown as Prisma.InputJsonValue,
      vendorEnrollmentFile: vendorFile as unknown as Prisma.InputJsonValue,
      insuranceCardStatus: 'REQUESTED',
      notes: input.notes ?? existing?.notes ?? null,
      updatedBy: auth.userId,
    };

    const enrollment = existing
      ? await prisma.benefitEnrollment.update({
          where: { id: existing.id },
          data,
          include: { plan: true },
        })
      : await prisma.benefitEnrollment.create({
          data: {
            tenantId: auth.tenantId,
            employeeId: input.employeeId,
            planId,
            paymentFrequency: 'MONTHLY',
            createdBy: auth.userId,
            ...data,
          },
          include: { plan: true },
        });

    await this.audit(auth, existing ? 'UPDATE' : 'CREATE', enrollment.id, existing, enrollment);
    return this.toDto(enrollment);
  }

  async markCardIssued(tenantId: string, id: string, input: CardIssueInput, actorId: string) {
    const existing = await prisma.benefitEnrollment.findFirst({
      where: { id, tenantId, isDeleted: false, plan: { category: 'HEALTH_INSURANCE' } },
      include: { plan: true },
    });
    if (!existing) {
      throw new Error('Medical benefits enrollment not found');
    }

    const status = input.insuranceCardStatus ?? 'ISSUED';
    const updated = await prisma.benefitEnrollment.update({
      where: { id },
      data: {
        vendorReference: input.vendorReference,
        insuranceCardStatus: status,
        insuranceCardIssuedAt:
          status === 'ISSUED' ? (input.insuranceCardIssuedAt ?? new Date()) : null,
        status: status === 'ISSUED' ? 'ACTIVE' : existing.status,
        approvedDate: status === 'ISSUED' ? new Date() : existing.approvedDate,
        approvedBy: status === 'ISSUED' ? actorId : existing.approvedBy,
        notes: input.notes ?? existing.notes,
        updatedBy: actorId,
      },
      include: { plan: true },
    });

    await this.audit({ tenantId, userId: actorId }, 'UPDATE', id, existing, updated);
    return this.toDto(updated);
  }

  async getCompletionGate(tenantId: string, employeeId: string) {
    const evaluated = await this.evaluate(tenantId, employeeId);
    if (!evaluated.mandatory) {
      return { employeeId, blocked: false, reasons: [], evaluated };
    }

    const enrollment = await prisma.benefitEnrollment.findFirst({
      where: {
        tenantId,
        employeeId,
        isDeleted: false,
        plan: { category: 'HEALTH_INSURANCE' },
        status: { in: ['DRAFT', 'PENDING_APPROVAL', 'APPROVED', 'ACTIVE'] },
      },
      include: { plan: true },
      orderBy: { updatedAt: 'desc' },
    });

    const reasons: string[] = [];
    if (!evaluated.selectedPlan) {
      reasons.push('No active eligible medical insurance plan is configured');
    }
    if (!enrollment) {
      reasons.push('Medical insurance enrollment has not been initiated');
    } else {
      if (!enrollment.vendorEnrollmentFile) {
        reasons.push('Vendor enrollment record has not been generated');
      }
      if (!enrollment.vendorReference) {
        reasons.push('Vendor policy/card reference is missing');
      }
      if (enrollment.insuranceCardStatus !== 'ISSUED') {
        reasons.push(`Insurance card status is ${enrollment.insuranceCardStatus}`);
      }
    }

    return {
      employeeId,
      blocked: reasons.length > 0,
      reasons,
      evaluated,
      enrollment: enrollment ? this.toDto(enrollment) : null,
    };
  }

  private async loadEmployeeContext(tenantId: string, employeeId: string) {
    const employee = await prisma.employee.findFirst({
      where: { id: employeeId, isDeleted: false, company: { tenantId } },
      select: {
        id: true,
        employeeCode: true,
        firstName: true,
        lastName: true,
        joiningDate: true,
        departmentId: true,
        department: { select: { name: true } },
        location: {
          select: {
            code: true,
            name: true,
            address: {
              select: {
                state: { select: { code: true, name: true } },
                country: { select: { isoCode: true } },
              },
            },
          },
        },
        grade: { select: { code: true, level: true } },
      },
    });
    if (!employee) {
      throw new Error('Employee not found for tenant');
    }

    const compliance = await prisma.employeeComplianceDetails.findFirst({
      where: { tenantId, employeeId },
    });
    if (!compliance) {
      throw new Error(
        'Employee compliance details are required before medical benefits evaluation'
      );
    }

    return {
      employee,
      compliance,
      countryCode: compliance.countryCode.toUpperCase(),
      regionCode: employee.location.address.state.code,
      locationCode: employee.location.code,
      gradeCode: employee.grade.code,
      gradeLevel: employee.grade.level,
    };
  }

  private planMatches(
    plan: { eligibilityCriteria: unknown },
    context: Awaited<ReturnType<BenefitsOnboardingService['loadEmployeeContext']>>
  ) {
    const countryCodes = readEligibility(plan.eligibilityCriteria, 'countryCodes');
    const regionCodes = readEligibility(plan.eligibilityCriteria, 'regionCodes');
    const locationCodes = readEligibility(plan.eligibilityCriteria, 'locationCodes');
    const gradeCodes = readEligibility(plan.eligibilityCriteria, 'gradeCodes');

    return (
      matchesAny(countryCodes, context.countryCode) &&
      matchesAny(regionCodes, context.regionCode) &&
      matchesAny(locationCodes, context.locationCode) &&
      matchesAny(gradeCodes, context.gradeCode)
    );
  }

  private async loadDependents(tenantId: string, employeeId: string, dependentIds?: string[]) {
    const rows = await prisma.dependent.findMany({
      where: {
        tenantId,
        employeeId,
        status: { in: ['ACTIVE', 'VERIFIED', 'PENDING_VERIFICATION'] },
        ...(dependentIds?.length ? { id: { in: dependentIds } } : {}),
      },
      orderBy: [{ relationship: 'asc' }, { dateOfBirth: 'asc' }],
    });

    return rows.map((dependent) => ({
      id: dependent.id,
      firstName: dependent.firstName,
      lastName: dependent.lastName,
      relationship: dependent.relationship,
      dateOfBirth: dependent.dateOfBirth.toISOString(),
      status: dependent.status,
      verificationDocuments: dependent.verificationDocuments,
    }));
  }

  private coverageLevelForDependents(dependents: Array<{ relationship: string }>) {
    if (dependents.length === 0) return 'EMPLOYEE_ONLY' as const;
    const hasSpouse = dependents.some((dependent) =>
      ['SPOUSE', 'DOMESTIC_PARTNER'].includes(dependent.relationship)
    );
    const hasChild = dependents.some((dependent) =>
      ['CHILD', 'STEPCHILD', 'ADOPTED_CHILD', 'FOSTER_CHILD'].includes(dependent.relationship)
    );
    if (hasSpouse && hasChild) return 'FAMILY' as const;
    if (hasSpouse) return 'EMPLOYEE_SPOUSE' as const;
    return 'EMPLOYEE_CHILDREN' as const;
  }

  private totalPremium(
    plan: {
      employeePremium: number;
      spousePremium: number | null;
      childPremium: number | null;
      familyPremium: number | null;
    },
    coverageLevel: 'EMPLOYEE_ONLY' | 'EMPLOYEE_SPOUSE' | 'EMPLOYEE_CHILDREN' | 'FAMILY'
  ) {
    if (coverageLevel === 'FAMILY') return plan.familyPremium ?? plan.employeePremium;
    if (coverageLevel === 'EMPLOYEE_SPOUSE') return plan.spousePremium ?? plan.employeePremium;
    if (coverageLevel === 'EMPLOYEE_CHILDREN') return plan.childPremium ?? plan.employeePremium;
    return plan.employeePremium;
  }

  private buildVendorEnrollmentFile(
    context: Awaited<ReturnType<BenefitsOnboardingService['loadEmployeeContext']>>,
    plan: { id: string; planCode: string; planName: string; carrierName: string },
    dependents: unknown[]
  ) {
    const rule = MEDICAL_COVER_RULES[context.countryCode];
    return {
      fileType: rule?.vendorFileCode ?? 'MEDICAL_ENROLLMENT',
      generatedAt: new Date().toISOString(),
      authority: rule?.authority ?? 'Not configured',
      employee: {
        id: context.employee.id,
        employeeCode: context.employee.employeeCode,
        name: `${context.employee.firstName} ${context.employee.lastName}`,
        countryCode: context.countryCode,
        regionCode: context.regionCode,
        locationCode: context.locationCode,
        gradeCode: context.gradeCode,
      },
      plan: {
        id: plan.id,
        planCode: plan.planCode,
        planName: plan.planName,
        carrierName: plan.carrierName,
      },
      dependents,
    };
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
        resourceType: 'benefit_enrollment',
        resourceId,
        module: 'onboarding',
        beforeValues: beforeValues as Prisma.InputJsonValue,
        afterValues: afterValues as Prisma.InputJsonValue,
        metadata: {
          story: 'EPIC-06-S08',
          event: 'medical_benefits_onboarding',
        },
      },
    });
  }

  private planDto(plan: {
    id: string;
    planCode: string;
    planName: string;
    carrierName: string;
    planTier: unknown;
    employeePremium: number;
    employerPremium: number;
  }) {
    return {
      id: plan.id,
      planCode: plan.planCode,
      planName: plan.planName,
      carrierName: plan.carrierName,
      planTier: plan.planTier,
      employeePremium: plan.employeePremium,
      employerPremium: plan.employerPremium,
    };
  }

  private toDto(row: any) {
    return {
      ...row,
      plan: row.plan ? this.planDto(row.plan) : undefined,
    };
  }
}

export const benefitsOnboardingService = new BenefitsOnboardingService();
