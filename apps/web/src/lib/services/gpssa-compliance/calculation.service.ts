import { prisma } from '@aura/database';
import type { AuthContext, NationalityClass } from './types';
import { gpssaConfigService } from './config.service';
import { gpssaRegistrationService } from './registration.service';

export interface ContributionWageInput {
  employeeId: string;
  period: string;
  basicWage: number;
  housingAllowance?: number;
  otherAllowances?: number;
  effectiveFrom?: Date;
  salaryChangeId?: string;
  salaryStructureRef?: string;
}

export interface ComputeContributionInput {
  employeeId: string;
  period: string;
  contributionWage?: number;
}

/**
 * EPIC-14-S05 / S06 / S08: derivation + 3-party (employer / employee / government)
 * contribution calculation with floor/ceiling clamping.
 */
export class GpssaCalculationService {
  async recordContributionWage(input: ContributionWageInput, auth: AuthContext) {
    const contributionWage =
      Number(input.basicWage) +
      Number(input.housingAllowance ?? 0) +
      Number(input.otherAllowances ?? 0);
    return prisma.$transaction(async (tx) => {
      const row = await (tx as any).gpssaContributionWage.upsert({
        where: {
          aura_gpssa_contribution_wage_unique: {
            tenantId: auth.tenantId,
            employeeId: input.employeeId,
            period: input.period,
          },
        },
        update: {
          basicWage: input.basicWage,
          housingAllowance: input.housingAllowance ?? 0,
          otherAllowances: input.otherAllowances ?? 0,
          contributionWage,
          effectiveFrom: input.effectiveFrom ?? new Date(),
          salaryChangeId: input.salaryChangeId,
          salaryStructureRef: input.salaryStructureRef,
        },
        create: {
          tenantId: auth.tenantId,
          employeeId: input.employeeId,
          period: input.period,
          basicWage: input.basicWage,
          housingAllowance: input.housingAllowance ?? 0,
          otherAllowances: input.otherAllowances ?? 0,
          contributionWage,
          effectiveFrom: input.effectiveFrom ?? new Date(),
          salaryChangeId: input.salaryChangeId,
          salaryStructureRef: input.salaryStructureRef,
        },
      });
      await (tx as any).gpssaEvent.create({
        data: {
          tenantId: auth.tenantId,
          employeeId: input.employeeId,
          period: input.period,
          eventType: 'WAGE_CHANGE',
          payload: { contributionWage },
        },
      });
      return row;
    });
  }

  async computeContribution(input: ComputeContributionInput, auth: AuthContext) {
    const reg = await gpssaRegistrationService.getActive(auth.tenantId, input.employeeId);
    if (!reg || reg.status !== 'ACTIVE') {
      throw new Error('employee not actively registered in GPSSA');
    }
    const wageRow =
      input.contributionWage != null
        ? { contributionWage: input.contributionWage }
        : await (prisma as any).gpssaContributionWage.findUnique({
            where: {
              aura_gpssa_contribution_wage_unique: {
                tenantId: auth.tenantId,
                employeeId: input.employeeId,
                period: input.period,
              },
            },
          });
    if (!wageRow) throw new Error('contribution wage not recorded for this period');

    const cls = reg.nationalityClass as NationalityClass;
    // Tenant config first; country rule pack as the regulatory baseline
    // when tenant config is missing. (audit 2026-06-17 Pattern 1)
    const rate = await gpssaConfigService.resolveRateWithRulePack(auth.tenantId, cls);
    if (!rate) throw new Error(`no GPSSA rate configured for ${cls}`);

    let wage = Number(wageRow.contributionWage);
    if (rate.wageFloor != null) wage = Math.max(wage, Number(rate.wageFloor));
    if (rate.wageCeiling != null) wage = Math.min(wage, Number(rate.wageCeiling));

    const employer = Number(((wage * Number(rate.employerPct)) / 100).toFixed(2));
    const employee = Number(((wage * Number(rate.employeePct)) / 100).toFixed(2));
    const government = Number(((wage * Number(rate.governmentPct)) / 100).toFixed(2));

    return (prisma as any).gpssaContribution.upsert({
      where: {
        aura_gpssa_contribution_unique: {
          tenantId: auth.tenantId,
          employeeId: input.employeeId,
          period: input.period,
        },
      },
      update: {
        establishmentId: reg.establishmentId,
        nationalityClass: cls,
        contributionWage: wage,
        employerAmount: employer,
        employeeAmount: employee,
        governmentAmount: government,
        rateRef: rate.id,
      },
      create: {
        tenantId: auth.tenantId,
        employeeId: input.employeeId,
        establishmentId: reg.establishmentId,
        period: input.period,
        nationalityClass: cls,
        contributionWage: wage,
        employerAmount: employer,
        employeeAmount: employee,
        governmentAmount: government,
        rateRef: rate.id,
      },
    });
  }

  async listContributions(tenantId: string, filter: { period?: string } = {}) {
    return (prisma as any).gpssaContribution.findMany({
      where: { tenantId, ...filter },
      orderBy: [{ period: 'desc' }, { employeeId: 'asc' }],
      take: 500,
    });
  }
}

export const gpssaCalculationService = new GpssaCalculationService();
