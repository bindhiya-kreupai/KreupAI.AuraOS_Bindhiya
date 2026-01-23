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
