import { prisma } from '@aura/database';
import type { Prisma } from '@prisma/client';

interface AuthContext {
  tenantId: string;
  userId: string;
}

interface PayrollProfileInput {
  employeeId: string;
  onboardingInstanceId?: string | null;
}

interface PayrollReadinessRule {
  countryCode: string;
  requiresWps: boolean;
  requiresIban: boolean;
  requiresRouting: boolean;
  requiresLabourCard: boolean;
  statutoryFirstPayWindowDays: number;
  ruleVersion: string;
}

const GCC_PAYROLL_READINESS_RULES: Record<string, PayrollReadinessRule> = {
  AE: {
    countryCode: 'AE',
    requiresWps: true,
    requiresIban: true,
    requiresRouting: true,
    requiresLabourCard: true,
    statutoryFirstPayWindowDays: 30,
    ruleVersion: '2026.1',
  },
  SA: {
    countryCode: 'SA',
    requiresWps: true,
    requiresIban: true,
    requiresRouting: false,
    requiresLabourCard: false,
    statutoryFirstPayWindowDays: 30,
    ruleVersion: '2026.1',
  },
  BH: {
    countryCode: 'BH',
    requiresWps: true,
    requiresIban: true,
    requiresRouting: true,
    requiresLabourCard: false,
    statutoryFirstPayWindowDays: 30,
    ruleVersion: '2026.1',
  },
  OM: {
    countryCode: 'OM',
    requiresWps: true,
    requiresIban: true,
    requiresRouting: true,
    requiresLabourCard: false,
    statutoryFirstPayWindowDays: 30,
    ruleVersion: '2026.1',
  },
  QA: {
    countryCode: 'QA',
    requiresWps: true,
    requiresIban: true,
    requiresRouting: true,
    requiresLabourCard: false,
    statutoryFirstPayWindowDays: 30,
    ruleVersion: '2026.1',
  },
  KW: {
    countryCode: 'KW',
    requiresWps: false,
    requiresIban: true,
    requiresRouting: true,
    requiresLabourCard: false,
    statutoryFirstPayWindowDays: 30,
    ruleVersion: '2026.1',
  },
};

function toNumber(value: unknown): number {
  if (value == null) return 0;
  if (typeof value === 'number') return value;
  if (typeof value === 'string') return Number(value) || 0;
  if (typeof value === 'object' && 'toNumber' in value && typeof value.toNumber === 'function') {
    return value.toNumber();
  }
  return Number(value) || 0;
}

function startOfMonth(date: Date) {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1));
}

function endOfMonth(date: Date) {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + 1, 0));
}

function payrollMonth(date: Date) {
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}`;
}

function addMonths(date: Date, months: number) {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + months, 1));
}

function daysBetween(start: Date, end: Date) {
  const ms =
    Date.UTC(end.getUTCFullYear(), end.getUTCMonth(), end.getUTCDate()) -
    Date.UTC(start.getUTCFullYear(), start.getUTCMonth(), start.getUTCDate());
  return Math.floor(ms / 86_400_000);
}

export class PayrollOnboardingService {
  async list(tenantId: string, filters: { employeeId?: string; readinessStatus?: string }) {
    const rows = await (prisma as any).employeePayrollProfile.findMany({
      where: {
        tenantId,
        isDeleted: false,
        ...(filters.employeeId ? { employeeId: filters.employeeId } : {}),
        ...(filters.readinessStatus ? { readinessStatus: filters.readinessStatus } : {}),
      },
      orderBy: [{ readinessStatus: 'asc' }, { updatedAt: 'desc' }],
    });
    return rows.map((row: any) => this.toDto(row));
  }

  async evaluate(tenantId: string, employeeId: string) {
    const context = await this.loadContext(tenantId, employeeId);
    return this.buildSnapshot(context);
  }

  async createOrRefresh(input: PayrollProfileInput, auth: AuthContext) {
    const context = await this.loadContext(auth.tenantId, input.employeeId);
    const snapshot = this.buildSnapshot(context);

    const existing = await (prisma as any).employeePayrollProfile.findUnique({
      where: {
        tenantId_employeeId: {
          tenantId: auth.tenantId,
          employeeId: input.employeeId,
        },
      },
    });

    const data = {
      companyId: context.employee.companyId,
      payrollConfigId: context.payrollConfig?.id ?? null,
      countryCode: context.countryCode,
      onboardingInstanceId: input.onboardingInstanceId ?? existing?.onboardingInstanceId ?? null,
      salaryStructureId: context.salary.id,
      salaryComponents: snapshot.salaryComponents as unknown as Prisma.InputJsonValue,
      bankName: context.compliance.bankName,
      bankAccountNumber: context.compliance.bankAccountNumber,
      bankIBAN: context.compliance.bankIBAN,
      bankRoutingCode: context.compliance.bankRoutingCode,
      wpsAgentCode: context.wpsConfig?.wpsAgentCode ?? null,
      wpsEmployerCode: context.wpsConfig?.employerCode ?? null,
      wpsPersonCode: context.compliance.wpsPersonalNumber ?? context.compliance.iqamaNumber ?? null,
      labourCardNumber: context.compliance.labourCardNumber ?? null,
      costCenterCode: context.employee.department.costCenter?.code ?? null,
      prorationBasis: 'CALENDAR_DAYS',
      joiningDate: context.employee.joiningDate,
      firstPayrollMonth: snapshot.firstPayrollMonth,
      firstPeriodStart: snapshot.firstPeriodStart,
      firstPeriodEnd: snapshot.firstPeriodEnd,
      firstPeriodPaidDays: snapshot.firstPeriodPaidDays,
      firstPeriodCalendarDays: snapshot.firstPeriodCalendarDays,
      firstPeriodProrationFactor: snapshot.firstPeriodProrationFactor,
      firstPeriodGrossProrated: snapshot.firstPeriodGrossProrated,
      firstPayDueAt: snapshot.firstPayDueAt,
      readinessStatus: snapshot.blockReasons.length ? 'BLOCKED' : 'READY',
      blockReasons: snapshot.blockReasons as unknown as Prisma.InputJsonValue,
      alertReasons: snapshot.alertReasons as unknown as Prisma.InputJsonValue,
      approvalStatus: snapshot.blockReasons.length ? 'PENDING_FIX' : 'PENDING_APPROVAL',
      updatedBy: auth.userId,
    };

    const profile = existing
      ? await (prisma as any).employeePayrollProfile.update({
          where: { id: existing.id },
          data,
        })
      : await (prisma as any).employeePayrollProfile.create({
          data: {
            tenantId: auth.tenantId,
            employeeId: input.employeeId,
            createdBy: auth.userId,
            ...data,
          },
        });

    await this.audit(auth, existing ? 'UPDATE' : 'CREATE', profile.id, existing, profile);
    return this.toDto(profile);
  }

  async approve(tenantId: string, id: string, actorId: string) {
    const existing = await (prisma as any).employeePayrollProfile.findFirst({
      where: { id, tenantId, isDeleted: false },
    });
    if (!existing) {
      throw new Error('Payroll profile not found');
    }
    if (existing.readinessStatus !== 'READY') {
      throw new Error('Blocked payroll profiles cannot be approved');
    }

    const updated = await (prisma as any).employeePayrollProfile.update({
      where: { id },
      data: {
        approvalStatus: 'APPROVED',
        approvedBy: actorId,
        approvedAt: new Date(),
        updatedBy: actorId,
      },
    });
    await this.audit({ tenantId, userId: actorId }, 'UPDATE', id, existing, updated);
    return this.toDto(updated);
  }

  async getCompletionGate(tenantId: string, employeeId: string) {
    const profile = await (prisma as any).employeePayrollProfile.findUnique({
      where: {
        tenantId_employeeId: {
          tenantId,
          employeeId,
        },
      },
    });

    if (!profile) {
      const evaluated = await this.evaluate(tenantId, employeeId);
      return {
        employeeId,
        blocked: true,
        reasons: ['Payroll profile has not been created'],
        evaluated,
        profile: null,
      };
    }

    const blockReasons = Array.isArray(profile.blockReasons) ? profile.blockReasons : [];
    const reasons = [...blockReasons];
    if (profile.approvalStatus !== 'APPROVED') {
      reasons.push(`Payroll profile approval status is ${profile.approvalStatus}`);
    }

    return {
      employeeId,
      blocked: reasons.length > 0,
      reasons,
      profile: this.toDto(profile),
    };
  }

  async validatePayrollLock(tenantId: string, employeeIds: string[]) {
    const profiles = await (prisma as any).employeePayrollProfile.findMany({
      where: { tenantId, employeeId: { in: employeeIds }, isDeleted: false },
    });
    const byEmployee = new Map<string, any>(
      profiles.map((profile: any) => [profile.employeeId, profile])
    );
    const blockers: Array<{ employeeId: string; reasons: string[] }> = [];

    for (const employeeId of employeeIds) {
      const profile = byEmployee.get(employeeId);
      if (!profile) {
        blockers.push({ employeeId, reasons: ['Payroll profile has not been created'] });
        continue;
      }
      const reasons = Array.isArray(profile.blockReasons) ? [...profile.blockReasons] : [];
      if (profile.readinessStatus !== 'READY') {
        reasons.push(`Payroll readiness status is ${profile.readinessStatus}`);
      }
      if (profile.approvalStatus !== 'APPROVED') {
        reasons.push(`Payroll profile approval status is ${profile.approvalStatus}`);
      }
      if (reasons.length) {
        blockers.push({ employeeId, reasons });
      }
    }

    return {
      blocked: blockers.length > 0,
      blockers,
    };
  }

  private async loadContext(tenantId: string, employeeId: string) {
    const employee = await prisma.employee.findFirst({
      where: { id: employeeId, isDeleted: false, company: { tenantId } },
      select: {
        id: true,
        employeeCode: true,
        firstName: true,
        lastName: true,
        joiningDate: true,
        companyId: true,
        department: { select: { name: true, costCenter: { select: { code: true } } } },
      },
    });
    if (!employee) {
      throw new Error('Employee not found for tenant');
    }

    const [compliance, salary, payrollConfig, wpsConfig] = await Promise.all([
      prisma.employeeComplianceDetails.findFirst({ where: { tenantId, employeeId } }),
      prisma.employeeSalaryStructure.findFirst({
        where: { tenantId, employeeId, isActive: true },
        orderBy: { effectiveFrom: 'desc' },
      }),
      prisma.payrollConfiguration.findFirst({
        where: { tenantId, companyId: employee.companyId, isActive: true },
      }),
      prisma.wPSConfiguration.findFirst({
        where: { tenantId, companyId: employee.companyId, isActive: true },
      }),
    ]);

    if (!compliance) {
      throw new Error('Employee compliance details are required before payroll readiness');
    }
    if (!salary) {
      throw new Error('Active salary structure is required before payroll readiness');
    }

    return {
      employee,
      compliance,
      salary,
      payrollConfig,
      wpsConfig,
      countryCode: compliance.countryCode.toUpperCase(),
    };
  }

  private buildSnapshot(context: Awaited<ReturnType<PayrollOnboardingService['loadContext']>>) {
    const rule = GCC_PAYROLL_READINESS_RULES[context.countryCode] ?? {
      countryCode: context.countryCode,
      requiresWps: false,
      requiresIban: true,
      requiresRouting: false,
      requiresLabourCard: false,
      statutoryFirstPayWindowDays: 30,
      ruleVersion: 'unconfigured',
    };
    const blockReasons: string[] = [];
    const alertReasons: string[] = [];
    const grossSalary = toNumber(context.salary.grossSalary);
    const basicSalary = toNumber(context.salary.basicSalary);
    const housing = toNumber(context.salary.houseRentAllowance);
    const transport = toNumber(context.salary.transportAllowance);
    const otherAllowances = context.salary.otherAllowances ?? [];

    if (basicSalary <= 0 || grossSalary <= 0) {
      blockReasons.push('Active salary structure must include positive basic and gross salary');
    }
    if (rule.requiresIban && !context.compliance.bankIBAN) {
      blockReasons.push('Bank IBAN is required for payroll readiness');
    }
    if (!context.compliance.bankAccountNumber) {
      blockReasons.push('Bank account number is required for payroll readiness');
    }
    if (rule.requiresRouting && !context.compliance.bankRoutingCode) {
      blockReasons.push('WPS bank routing code is required');
    }
    if (rule.requiresLabourCard && !context.compliance.labourCardNumber) {
      blockReasons.push('Labour card number is required for WPS payroll readiness');
    }
    if (rule.requiresWps && !context.wpsConfig) {
      blockReasons.push('Active WPS/Mudad configuration is required for company');
    }
    if (!context.employee.department.costCenter?.code) {
      blockReasons.push('Department cost centre is required for payroll posting');
    }
    if (!context.payrollConfig) {
      blockReasons.push('Active payroll configuration is required for company');
    }

    const firstMonthDate =
      context.payrollConfig &&
      context.employee.joiningDate.getUTCDate() > context.payrollConfig.cutoffDay
        ? addMonths(context.employee.joiningDate, 1)
        : startOfMonth(context.employee.joiningDate);
    const firstPeriodStart =
      payrollMonth(firstMonthDate) === payrollMonth(context.employee.joiningDate)
        ? context.employee.joiningDate
        : startOfMonth(firstMonthDate);
    const firstPeriodEnd = endOfMonth(firstMonthDate);
    const firstPeriodCalendarDays = firstPeriodEnd.getUTCDate();
    const firstPeriodPaidDays = daysBetween(firstPeriodStart, firstPeriodEnd) + 1;
    const firstPeriodProrationFactor = firstPeriodPaidDays / firstPeriodCalendarDays;
    const firstPeriodGrossProrated = Number((grossSalary * firstPeriodProrationFactor).toFixed(2));
    const payDay = Math.min(context.payrollConfig?.payDay ?? 28, firstPeriodCalendarDays);
    const firstPayDueAt = new Date(
      Date.UTC(firstMonthDate.getUTCFullYear(), firstMonthDate.getUTCMonth(), payDay)
    );

    if (
      daysBetween(context.employee.joiningDate, firstPayDueAt) > rule.statutoryFirstPayWindowDays
    ) {
      alertReasons.push(
        `First pay date exceeds ${rule.statutoryFirstPayWindowDays}-day statutory wage window`
      );
    }

    return {
      employeeId: context.employee.id,
      countryCode: context.countryCode,
      ruleVersion: rule.ruleVersion,
      readinessStatus: blockReasons.length ? 'BLOCKED' : 'READY',
      salaryComponents: {
        basicSalary,
        houseRentAllowance: housing,
        transportAllowance: transport,
        otherAllowances,
        grossSalary,
        ctc: toNumber(context.salary.ctc),
        payFrequency: context.salary.payFrequency,
      },
      firstPayrollMonth: payrollMonth(firstMonthDate),
      firstPeriodStart,
      firstPeriodEnd,
      firstPeriodPaidDays,
      firstPeriodCalendarDays,
      firstPeriodProrationFactor,
      firstPeriodGrossProrated,
      firstPayDueAt,
      blockReasons,
      alertReasons,
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
        resourceType: 'employee_payroll_profile',
        resourceId,
        module: 'onboarding',
        beforeValues: beforeValues as Prisma.InputJsonValue,
        afterValues: afterValues as Prisma.InputJsonValue,
        metadata: {
          story: 'EPIC-06-S07',
          event: 'payroll_onboarding_profile',
        },
      },
    });
  }

  private toDto(row: any) {
    return {
      ...row,
      firstPeriodPaidDays: toNumber(row.firstPeriodPaidDays),
      firstPeriodProrationFactor: toNumber(row.firstPeriodProrationFactor),
      firstPeriodGrossProrated: toNumber(row.firstPeriodGrossProrated),
    };
  }
}

export const payrollOnboardingService = new PayrollOnboardingService();
