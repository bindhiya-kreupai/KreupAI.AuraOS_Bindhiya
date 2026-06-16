import { prisma } from '@aura/database';
import type { AuthContext, GosiBranch, NationalityClass } from './types';
import { gosiConfigService } from './config.service';
import { gosiRegistrationService } from './registration.service';

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
  contributionWage?: number; // resolved from store if missing
}

/**
 * EPIC-13-S07 / S08 / S10 / S12: contribution-wage derivation +
 * contribution calculation.
 *
 * Contribution wage formula (default):
 *   contributionWage = basicWage + housingAllowance + otherAllowances
 * Annuities calculation (Saudi only):
 *   employer = wage * employerPct
 *   employee = wage * employeePct
 *   wage is clamped to [floor, ceiling] if the rate carries them.
 * Occupational Hazards calculation (all classes):
 *   employer = wage * employerPct (typically 2%)
 *   employee = 0
 */
export class GosiCalculationService {
  async recordContributionWage(input: ContributionWageInput, auth: AuthContext) {
    const contributionWage =
      Number(input.basicWage) +
      Number(input.housingAllowance ?? 0) +
      Number(input.otherAllowances ?? 0);
    return prisma.$transaction(async (tx) => {
      const row = await (tx as any).gosiContributionWage.upsert({
        where: {
          aura_gosi_contribution_wage_unique: {
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
      await (tx as any).gosiEvent.create({
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
    const reg = await gosiRegistrationService.getActive(auth.tenantId, input.employeeId);
    if (!reg || reg.status !== 'ACTIVE') {
      throw new Error('employee not actively registered in GOSI');
    }
    const wageRow =
      input.contributionWage != null
        ? { contributionWage: input.contributionWage }
        : await (prisma as any).gosiContributionWage.findUnique({
            where: {
              aura_gosi_contribution_wage_unique: {
                tenantId: auth.tenantId,
                employeeId: input.employeeId,
                period: input.period,
              },
            },
          });
    if (!wageRow) throw new Error('contribution wage not recorded for this period');
    const wage = Number(wageRow.contributionWage);

    const cls = reg.nationalityClass as NationalityClass;
    const annuities = await gosiConfigService.resolveRate(auth.tenantId, 'ANNUITIES', cls);
    const oh = await gosiConfigService.resolveRate(auth.tenantId, 'OCCUPATIONAL_HAZARDS', cls);

    const apply = (rate: Record<string, unknown> | null, wageValue: number) => {
      if (!rate) return { employer: 0, employee: 0, wageUsed: 0 };
      const floor = rate.wageFloor != null ? Number(rate.wageFloor) : null;
      const ceil = rate.wageCeiling != null ? Number(rate.wageCeiling) : null;
      let w = wageValue;
      if (floor != null) w = Math.max(w, floor);
      if (ceil != null) w = Math.min(w, ceil);
      const er = Number(((w * Number(rate.employerPct)) / 100).toFixed(2));
      const ee = Number(((w * Number(rate.employeePct)) / 100).toFixed(2));
      return { employer: er, employee: ee, wageUsed: w };
    };

    const annResult = apply(annuities, wage);
    const ohResult = apply(oh, wage);
    const totalEmployer = annResult.employer + ohResult.employer;
    const totalEmployee = annResult.employee + ohResult.employee;

    return prisma.$transaction(async (tx) => {
      return (tx as any).gosiContribution.upsert({
        where: {
          aura_gosi_contribution_unique: {
            tenantId: auth.tenantId,
            employeeId: input.employeeId,
            period: input.period,
          },
        },
        update: {
          establishmentId: reg.establishmentId,
          nationalityClass: cls,
          contributionWage: wage,
          annuitiesEmployer: annResult.employer,
          annuitiesEmployee: annResult.employee,
          ohEmployer: ohResult.employer,
          totalEmployer,
          totalEmployee,
          rateRefs: {
            annuitiesRateId: annuities?.id ?? null,
            ohRateId: oh?.id ?? null,
          },
        },
        create: {
          tenantId: auth.tenantId,
          employeeId: input.employeeId,
          establishmentId: reg.establishmentId,
          period: input.period,
          nationalityClass: cls,
          contributionWage: wage,
          annuitiesEmployer: annResult.employer,
          annuitiesEmployee: annResult.employee,
          ohEmployer: ohResult.employer,
          totalEmployer,
          totalEmployee,
          rateRefs: {
            annuitiesRateId: annuities?.id ?? null,
            ohRateId: oh?.id ?? null,
          },
        },
      });
    });
  }

  async listContributions(
    tenantId: string,
    filter: { period?: string; nationalityClass?: string } = {}
  ) {
    return (prisma as any).gosiContribution.findMany({
      where: { tenantId, ...filter },
      orderBy: [{ period: 'desc' }, { employeeId: 'asc' }],
      take: 500,
    });
  }
}

export const gosiCalculationService = new GosiCalculationService();
