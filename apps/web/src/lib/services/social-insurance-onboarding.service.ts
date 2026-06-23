import { prisma } from '@aura/database';
import type { Prisma } from '@prisma/client';
import { createLogger } from '@/lib/logger';

type RegistrationStatus = 'PENDING' | 'IN_PROGRESS' | 'REGISTERED' | 'WAIVED' | 'BLOCKED';

interface AuthContext {
  tenantId: string;
  userId: string;
}

interface SocialInsuranceRule {
  countryCode: string;
  authority: string;
  scheme: string;
  currency: string;
  mandatoryFor: 'LOCAL_NATIONALS' | 'ALL_EMPLOYEES';
  registrationDeadlineDays: number;
  wageBasis: 'BASIC' | 'BASIC_PLUS_HOUSING' | 'GROSS';
  wageCap?: number;
  ruleVersion: string;
}

interface RegistrationInput {
  employeeId: string;
  onboardingInstanceId?: string | null;
  contributionWage?: number;
  registrationReference?: string | null;
  status?: RegistrationStatus;
  notes?: string | null;
}

const logger = createLogger({ service: 'social-insurance-onboarding' });

const GCC_SOCIAL_INSURANCE_RULES: Record<string, SocialInsuranceRule> = {
  AE: {
    countryCode: 'AE',
    authority: 'GPSSA',
    scheme: 'UAE_NATIONAL_PENSION',
    currency: 'AED',
    mandatoryFor: 'LOCAL_NATIONALS',
    registrationDeadlineDays: 30,
    wageBasis: 'GROSS',
    ruleVersion: '2026.1',
  },
  SA: {
    countryCode: 'SA',
    authority: 'GOSI',
    scheme: 'KSA_GOSI',
    currency: 'SAR',
    mandatoryFor: 'ALL_EMPLOYEES',
    registrationDeadlineDays: 15,
    wageBasis: 'BASIC_PLUS_HOUSING',
    wageCap: 45000,
    ruleVersion: '2026.1',
  },
  BH: {
    countryCode: 'BH',
    authority: 'SIO',
    scheme: 'BAHRAIN_SIO',
    currency: 'BHD',
    mandatoryFor: 'ALL_EMPLOYEES',
    registrationDeadlineDays: 15,
    wageBasis: 'GROSS',
    ruleVersion: '2026.1',
  },
  OM: {
    countryCode: 'OM',
    authority: 'PASI',
    scheme: 'OMAN_SOCIAL_PROTECTION',
    currency: 'OMR',
    mandatoryFor: 'LOCAL_NATIONALS',
    registrationDeadlineDays: 30,
    wageBasis: 'GROSS',
    ruleVersion: '2026.1',
  },
  QA: {
    countryCode: 'QA',
    authority: 'QATAR_PENSION_AUTHORITY',
    scheme: 'QATAR_PENSION',
    currency: 'QAR',
    mandatoryFor: 'LOCAL_NATIONALS',
    registrationDeadlineDays: 30,
    wageBasis: 'GROSS',
    ruleVersion: '2026.1',
  },
  KW: {
    countryCode: 'KW',
    authority: 'PIFSS',
    scheme: 'KUWAIT_PIFSS',
    currency: 'KWD',
    mandatoryFor: 'LOCAL_NATIONALS',
    registrationDeadlineDays: 30,
    wageBasis: 'GROSS',
    ruleVersion: '2026.1',
  },
};

function addDays(date: Date, days: number): Date {
  const next = new Date(date);
  next.setUTCDate(next.getUTCDate() + days);
  return next;
}

function toNumber(value: unknown): number {
  if (value == null) return 0;
  if (typeof value === 'number') return value;
  if (typeof value === 'string') return Number(value) || 0;
  if (typeof value === 'object' && 'toNumber' in value && typeof value.toNumber === 'function') {
    return value.toNumber();
  }
  return Number(value) || 0;
}

export class SocialInsuranceOnboardingService {
  async list(tenantId: string, filters: { employeeId?: string; status?: string }) {
    const rows = await (prisma as any).socialInsuranceRegistration.findMany({
      where: {
        tenantId,
        ...(filters.employeeId ? { employeeId: filters.employeeId } : {}),
        ...(filters.status ? { status: filters.status } : {}),
      },
      orderBy: [{ deadlineAt: 'asc' }, { createdAt: 'desc' }],
    });

    return rows.map((row: any) => this.toDto(row));
  }

  async evaluate(tenantId: string, employeeId: string) {
    const context = await this.loadEmployeeContext(tenantId, employeeId);
    const rule = GCC_SOCIAL_INSURANCE_RULES[context.countryCode];

    if (!rule) {
      return {
        employeeId,
        applicable: false,
        mandatory: false,
        status: 'WAIVED' as RegistrationStatus,
        blockCompletion: false,
        reason: `No social-insurance onboarding rule configured for ${context.countryCode}`,
      };
    }

    const mandatory =
      rule.mandatoryFor === 'ALL_EMPLOYEES' || context.compliance.isLocalNational === true;
    const contributionWage = this.calculateContributionWage(rule, context.salary);
    const deadlineAt = addDays(
      context.employee.joiningDate ?? new Date(),
      rule.registrationDeadlineDays
    );

    return {
      employeeId,
      applicable: mandatory,
      mandatory,
      status: mandatory ? ('PENDING' as RegistrationStatus) : ('WAIVED' as RegistrationStatus),
      blockCompletion: mandatory,
      countryCode: context.countryCode,
      nationality: context.compliance.nationality,
      authority: rule.authority,
      scheme: rule.scheme,
      contributionWage,
      currency: rule.currency,
      deadlineAt,
      ruleVersion: rule.ruleVersion,
      ruleSnapshot: rule,
    };
  }

  async createOrUpdate(input: RegistrationInput, auth: AuthContext) {
    const evaluated = await this.evaluate(auth.tenantId, input.employeeId);

    if (!('authority' in evaluated)) {
      const waived = await (prisma as any).socialInsuranceRegistration.upsert({
        where: {
          tenantId_employeeId_authority_scheme: {
            tenantId: auth.tenantId,
            employeeId: input.employeeId,
            authority: 'NONE',
            scheme: 'NOT_APPLICABLE',
          },
        },
        create: {
          tenantId: auth.tenantId,
          employeeId: input.employeeId,
          onboardingInstanceId: input.onboardingInstanceId ?? null,
          countryCode: 'UNCONFIGURED',
          authority: 'NONE',
          scheme: 'NOT_APPLICABLE',
          contributionWage: 0,
          currency: 'N/A',
          status: 'WAIVED',
          mandatory: false,
          deadlineAt: new Date(),
          ruleVersion: 'unconfigured',
          ruleSnapshot: { reason: evaluated.reason },
          notes: input.notes ?? evaluated.reason,
          createdBy: auth.userId,
          updatedBy: auth.userId,
        },
        update: {
          status: 'WAIVED',
          notes: input.notes ?? evaluated.reason,
          updatedBy: auth.userId,
        },
      });
      await this.audit(auth, 'CREATE', waived.id, null, waived);
      return this.toDto(waived);
    }

    const status = input.status ?? evaluated.status;
    const registeredAt = status === 'REGISTERED' ? new Date() : null;
    const registration = await (prisma as any).socialInsuranceRegistration.upsert({
      where: {
        tenantId_employeeId_authority_scheme: {
          tenantId: auth.tenantId,
          employeeId: input.employeeId,
          authority: evaluated.authority,
          scheme: evaluated.scheme,
        },
      },
      create: {
        tenantId: auth.tenantId,
        employeeId: input.employeeId,
        onboardingInstanceId: input.onboardingInstanceId ?? null,
        countryCode: evaluated.countryCode,
        nationality: evaluated.nationality ?? null,
        authority: evaluated.authority,
        scheme: evaluated.scheme,
        contributionWage: input.contributionWage ?? evaluated.contributionWage,
        currency: evaluated.currency,
        registrationReference: input.registrationReference ?? null,
        status,
        mandatory: evaluated.mandatory,
        deadlineAt: evaluated.deadlineAt,
        registeredAt,
        ruleVersion: evaluated.ruleVersion,
        ruleSnapshot: evaluated.ruleSnapshot as unknown as Prisma.InputJsonValue,
        notes: input.notes ?? null,
        createdBy: auth.userId,
        updatedBy: auth.userId,
      },
      update: {
        onboardingInstanceId: input.onboardingInstanceId ?? undefined,
        contributionWage: input.contributionWage ?? evaluated.contributionWage,
        registrationReference: input.registrationReference ?? undefined,
        status,
        registeredAt,
        notes: input.notes ?? undefined,
        updatedBy: auth.userId,
      },
    });

    await this.audit(auth, 'CREATE', registration.id, null, registration);
    return this.toDto(registration);
  }

  async markRegistered(
    tenantId: string,
    id: string,
    data: { registrationReference: string; registeredAt?: Date; notes?: string | null },
    actorId: string
  ) {
    const existing = await (prisma as any).socialInsuranceRegistration.findFirst({
      where: { id, tenantId },
    });
    if (!existing) {
      throw new Error('Social insurance registration not found');
    }

    const updated = await (prisma as any).socialInsuranceRegistration.update({
      where: { id },
      data: {
        registrationReference: data.registrationReference,
        registeredAt: data.registeredAt ?? new Date(),
        status: 'REGISTERED',
        notes: data.notes ?? existing.notes,
        updatedBy: actorId,
      },
    });

    await this.audit({ tenantId, userId: actorId }, 'UPDATE', id, existing, updated);
    return this.toDto(updated);
  }

  async getCompletionGate(tenantId: string, employeeId: string) {
    const evaluated = await this.evaluate(tenantId, employeeId);
    if (!('authority' in evaluated) || !evaluated.mandatory) {
      return {
        employeeId,
        blocked: false,
        reasons: [],
        evaluated,
      };
    }

    const registration = await (prisma as any).socialInsuranceRegistration.findUnique({
      where: {
        tenantId_employeeId_authority_scheme: {
          tenantId,
          employeeId,
          authority: evaluated.authority,
          scheme: evaluated.scheme,
        },
      },
    });

    const reasons: string[] = [];
    if (!registration) {
      reasons.push(`${evaluated.authority} registration has not been initiated`);
    } else if (registration.status !== 'REGISTERED') {
      reasons.push(`${evaluated.authority} registration status is ${registration.status}`);
    }
    if (registration && !registration.registrationReference) {
      reasons.push(`${evaluated.authority} registration reference is missing`);
    }

    return {
      employeeId,
      blocked: reasons.length > 0,
      reasons,
      evaluated,
      registration: registration ? this.toDto(registration) : null,
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
        companyId: true,
      },
    });
    if (!employee) {
      throw new Error('Employee not found for tenant');
    }

    const [compliance, salary] = await Promise.all([
      prisma.employeeComplianceDetails.findFirst({ where: { tenantId, employeeId } }),
      prisma.employeeSalaryStructure.findFirst({
        where: { tenantId, employeeId, isActive: true },
        orderBy: { effectiveFrom: 'desc' },
      }),
    ]);

    if (!compliance) {
      throw new Error(
        'Employee compliance details are required before social insurance evaluation'
      );
    }
    if (!salary) {
      throw new Error('Active salary structure is required before social insurance evaluation');
    }

    return {
      employee,
      compliance,
      salary,
      countryCode: compliance.countryCode.toUpperCase(),
    };
  }

  private calculateContributionWage(rule: SocialInsuranceRule, salary: any): number {
    const basic = toNumber(salary.basicSalary);
    const housing = toNumber(salary.houseRentAllowance);
    const gross = toNumber(salary.grossSalary);
    const raw =
      rule.wageBasis === 'BASIC'
        ? basic
        : rule.wageBasis === 'BASIC_PLUS_HOUSING'
          ? basic + housing
          : gross;

    return rule.wageCap ? Math.min(raw, rule.wageCap) : raw;
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
        resourceType: 'social_insurance_registration',
        resourceId,
        module: 'onboarding',
        beforeValues: beforeValues as Prisma.InputJsonValue,
        afterValues: afterValues as Prisma.InputJsonValue,
        metadata: {
          story: 'EPIC-06-S09',
          event: 'social_insurance_onboarding_registration',
        },
      },
    });
  }

  private toDto(row: any) {
    return {
      ...row,
      contributionWage: toNumber(row.contributionWage),
    };
  }
}

export const socialInsuranceOnboardingService = new SocialInsuranceOnboardingService();
