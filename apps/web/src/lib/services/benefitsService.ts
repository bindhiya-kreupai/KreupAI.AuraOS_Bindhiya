import { BaseService } from './base.service';

export interface BenefitPlan {
  id: string;
  name: string;
  type: 'medical' | 'dental' | 'vision' | 'life' | 'disability' | 'retirement';
  provider: string;
  coverageLevels: CoverageLevel[];
  eligibilityRules: EligibilityRule[];
  active: boolean;
}

export interface CoverageLevel {
  id: string;
  name: string; // Employee Only, Employee + Spouse, Family
  employeeCost: number;
  employerCost: number;
  deductible: number;
  maxOutOfPocket: number;
}

export interface EligibilityRule {
  type: 'waiting_period' | 'employment_type' | 'hours_per_week';
  value: string;
}

export interface BenefitEnrollment {
  id: string;
  employeeId: string;
  planId: string;
  coverageLevelId: string;
  dependentIds: string[];
  status: 'active' | 'pending' | 'terminated';
  effectiveDate: Date;
  terminationDate?: Date;
}

export class BenefitsService extends BaseService {
  constructor() {
    super('BenefitsService');
  }

  async getAvailablePlans(tenantId: string): Promise<BenefitPlan[]> {
    const plans = await this.prisma.benefitPlan.findMany({
      where: { tenantId, active: true },
      include: { coverageLevels: true },
    });

    return plans.map((p) => ({
      id: p.id,
      name: p.name,
      type: p.type as BenefitPlan['type'],
      provider: p.provider,
      coverageLevels: (p.coverageLevels || []).map((c: any) => ({
        id: c.id,
        name: c.name,
        employeeCost: c.employeeCost,
        employerCost: c.employerCost,
        deductible: c.deductible,
        maxOutOfPocket: c.maxOutOfPocket,
      })),
      eligibilityRules: (p.eligibilityRules as any[]) || [],
      active: p.active,
    }));
  }

  async getPlanById(id: string): Promise<BenefitPlan | null> {
    const plan = await this.prisma.benefitPlan.findUnique({
      where: { id },
      include: { coverageLevels: true },
    });
    if (!plan) return null;
    return {
      id: plan.id,
      name: plan.name,
      type: plan.type as BenefitPlan['type'],
      provider: plan.provider,
      coverageLevels: (plan.coverageLevels || []).map((c: any) => ({
        id: c.id,
        name: c.name,
        employeeCost: c.employeeCost,
        employerCost: c.employerCost,
        deductible: c.deductible,
        maxOutOfPocket: c.maxOutOfPocket,
      })),
      eligibilityRules: (plan.eligibilityRules as any[]) || [],
      active: plan.active,
    };
  }

  async getEnrollments(employeeId: string): Promise<BenefitEnrollment[]> {
    const enrollments = await this.prisma.benefitEnrollment.findMany({
      where: { employeeId, status: { not: 'terminated' } },
    });
    return enrollments.map((e) => ({
      id: e.id,
      employeeId: e.employeeId,
      planId: e.planId,
      coverageLevelId: e.coverageLevelId,
      dependentIds: (e.dependentIds as string[]) || [],
      status: e.status as BenefitEnrollment['status'],
      effectiveDate: e.effectiveDate,
      terminationDate: e.terminationDate || undefined,
    }));
  }

  async enroll(data: {
    employeeId: string;
    planId: string;
    coverageLevelId: string;
    dependentIds: string[];
    effectiveDate: Date;
  }): Promise<BenefitEnrollment> {
    const enrollment = await this.prisma.benefitEnrollment.create({
      data: {
        employeeId: data.employeeId,
        planId: data.planId,
        coverageLevelId: data.coverageLevelId,
        dependentIds: data.dependentIds,
        status: 'active',
        effectiveDate: data.effectiveDate,
      },
    });

    await this.createAuditLog({
      userId: data.employeeId,
      action: 'CREATE',
      module: 'Benefits',
      details: `Enrolled in plan ${data.planId}`,
    });

    return {
      id: enrollment.id,
      employeeId: enrollment.employeeId,
      planId: enrollment.planId,
      coverageLevelId: enrollment.coverageLevelId,
      dependentIds: (enrollment.dependentIds as string[]) || [],
      status: enrollment.status as BenefitEnrollment['status'],
      effectiveDate: enrollment.effectiveDate,
    };
  }

  async updateEnrollment(id: string, data: Partial<{
    coverageLevelId: string;
    dependentIds: string[];
  }>): Promise<BenefitEnrollment> {
    const enrollment = await this.prisma.benefitEnrollment.update({ where: { id }, data });
    return {
      id: enrollment.id,
      employeeId: enrollment.employeeId,
      planId: enrollment.planId,
      coverageLevelId: enrollment.coverageLevelId,
      dependentIds: (enrollment.dependentIds as string[]) || [],
      status: enrollment.status as BenefitEnrollment['status'],
      effectiveDate: enrollment.effectiveDate,
    };
  }

  async cancelEnrollment(id: string, userId: string): Promise<void> {
    await this.prisma.benefitEnrollment.update({
      where: { id },
      data: { status: 'terminated', terminationDate: new Date() },
    });
    await this.createAuditLog({
      userId,
      action: 'UPDATE',
      module: 'Benefits',
      details: `Cancelled enrollment ${id}`,
    });
  }

  async getEnrollmentStatus(tenantId: string): Promise<{
    isOpenEnrollment: boolean;
    startDate?: Date;
    endDate?: Date;
  }> {
    // Check if currently in open enrollment period
    const config = await this.prisma.benefitConfig.findFirst({
      where: { tenantId },
    });
    if (!config) return { isOpenEnrollment: false };

    const now = new Date();
    const start = config.openEnrollmentStart;
    const end = config.openEnrollmentEnd;

    return {
      isOpenEnrollment: start && end ? now >= start && now <= end : false,
      startDate: start || undefined,
      endDate: end || undefined,
    };
  }

  // --------------------------------------------------------------------------
  // ELIGIBILITY RULES ENGINE
  // --------------------------------------------------------------------------

  /**
   * Check if an employee is eligible for a specific benefit plan
   * Evaluates waiting period, employment type, and hours per week rules
   */
  async checkEligibility(params: {
    employeeId: string;
    planId: string;
    tenantId: string;
  }): Promise<{
    eligible: boolean;
    reasons: string[];
    eligibleDate?: Date;
    rulesEvaluated: Array<{ rule: EligibilityRule; passed: boolean; message: string }>;
  }> {
    const plan = await this.getPlanById(params.planId);
    if (!plan) throw new Error('Plan not found');

    const employee = await this.prisma.employee.findUnique({
      where: { id: params.employeeId },
      select: {
        id: true,
        hireDate: true,
        employmentType: true,
        hoursPerWeek: true,
        status: true,
      },
    });

    if (!employee) throw new Error('Employee not found');

    const rulesEvaluated: Array<{ rule: EligibilityRule; passed: boolean; message: string }> = [];
    const reasons: string[] = [];
    let eligibleDate: Date | undefined;

    for (const rule of plan.eligibilityRules) {
      const result = this.evaluateRule(rule, employee);
      rulesEvaluated.push(result);
      if (!result.passed) {
        reasons.push(result.message);
        if (rule.type === 'waiting_period' && employee.hireDate) {
          const waitDays = parseInt(rule.value) || 30;
          const hireDate = new Date(employee.hireDate);
          eligibleDate = new Date(hireDate.getTime() + waitDays * 24 * 60 * 60 * 1000);
        }
      }
    }

    return {
      eligible: reasons.length === 0,
      reasons,
      eligibleDate: reasons.length > 0 ? eligibleDate : undefined,
      rulesEvaluated,
    };
  }

  /**
   * Evaluate a single eligibility rule against employee data
   */
  private evaluateRule(
    rule: EligibilityRule,
    employee: { hireDate: Date | null; employmentType: string | null; hoursPerWeek: number | null; status: string | null }
  ): { rule: EligibilityRule; passed: boolean; message: string } {
    switch (rule.type) {
      case 'waiting_period': {
        const waitDays = parseInt(rule.value) || 30;
        if (!employee.hireDate) {
          return { rule, passed: false, message: 'No hire date recorded' };
        }
        const hireDate = new Date(employee.hireDate);
        const eligDate = new Date(hireDate.getTime() + waitDays * 24 * 60 * 60 * 1000);
        const passed = new Date() >= eligDate;
        return {
          rule,
          passed,
          message: passed
            ? `Waiting period of ${waitDays} days satisfied`
            : `Waiting period not met. Eligible after ${eligDate.toISOString().split('T')[0]}`,
        };
      }

      case 'employment_type': {
        const allowedTypes = rule.value.split(',').map((t) => t.trim().toLowerCase());
        const empType = (employee.employmentType || '').toLowerCase();
        const passed = allowedTypes.includes(empType);
        return {
          rule,
          passed,
          message: passed
            ? `Employment type "${empType}" is eligible`
            : `Employment type "${empType}" is not eligible. Required: ${rule.value}`,
        };
      }

      case 'hours_per_week': {
        const minHours = parseInt(rule.value) || 0;
        const empHours = employee.hoursPerWeek || 0;
        const passed = empHours >= minHours;
        return {
          rule,
          passed,
          message: passed
            ? `Employee works ${empHours} hours/week (minimum: ${minHours})`
            : `Employee works ${empHours} hours/week but minimum is ${minHours}`,
        };
      }

      default:
        return { rule, passed: true, message: `Unknown rule type: ${rule.type}` };
    }
  }

  /**
   * Get all eligible plans for an employee
   */
  async getEligiblePlans(employeeId: string, tenantId: string): Promise<{
    eligible: BenefitPlan[];
    ineligible: Array<{ plan: BenefitPlan; reasons: string[]; eligibleDate?: Date }>;
  }> {
    const plans = await this.getAvailablePlans(tenantId);
    const eligible: BenefitPlan[] = [];
    const ineligible: Array<{ plan: BenefitPlan; reasons: string[]; eligibleDate?: Date }> = [];

    for (const plan of plans) {
      const result = await this.checkEligibility({ employeeId, planId: plan.id, tenantId });
      if (result.eligible) {
        eligible.push(plan);
      } else {
        ineligible.push({ plan, reasons: result.reasons, eligibleDate: result.eligibleDate });
      }
    }

    return { eligible, ineligible };
  }

  async comparePlans(planIds: string[]): Promise<BenefitPlan[]> {
    const plans = await this.prisma.benefitPlan.findMany({
      where: { id: { in: planIds } },
      include: { coverageLevels: true },
    });
    return plans.map((p) => ({
      id: p.id,
      name: p.name,
      type: p.type as BenefitPlan['type'],
      provider: p.provider,
      coverageLevels: (p.coverageLevels || []).map((c: any) => ({
        id: c.id, name: c.name, employeeCost: c.employeeCost, employerCost: c.employerCost, deductible: c.deductible, maxOutOfPocket: c.maxOutOfPocket,
      })),
      eligibilityRules: (p.eligibilityRules as any[]) || [],
      active: p.active,
    }));
  }
}

export const benefitsService = new BenefitsService();
