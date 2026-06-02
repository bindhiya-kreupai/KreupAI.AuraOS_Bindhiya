import type { NextRequest } from 'next/server';
import { prisma } from '@aura/database';
import { withEnhancedAuth } from '@/lib/auth';
import {
  forbidden,
  safeJson,
  serverError,
  successItem,
  validationError,
} from '@/lib/api/crud-helpers';

export const POST = withEnhancedAuth(async (request: NextRequest, context: any) => {
  try {
    const { user, permissions } = context;
    if (!permissions.includes('benefits:read')) return forbidden('benefits:read');
    const body = await safeJson(request);
    if (!body?.planId) return validationError({ message: 'planId required' });
    const plan: any = await prisma.benefitPlan.findFirst({
      where: { id: body.planId, tenantId: user.tenantId },
    });
    if (!plan) return validationError({ message: 'Plan not found' });
    const dependents = Number(body.dependentCount || 0);
    const baseMonthly = Number(
      plan.monthlyEmployeeContribution || plan.employeePremiumMonthly || 0
    );
    const depMonthly = Number(
      plan.monthlyDependentContribution || plan.dependentPremiumMonthly || 0
    );
    const employeeMonthly = baseMonthly + dependents * depMonthly;
    const employerMonthly = Number(
      plan.monthlyEmployerContribution || plan.employerPremiumMonthly || 0
    );
    return successItem({
      planId: plan.id,
      employeeMonthly,
      employerMonthly,
      totalMonthly: employeeMonthly + employerMonthly,
      employeeAnnual: employeeMonthly * 12,
      employerAnnual: employerMonthly * 12,
      totalAnnual: (employeeMonthly + employerMonthly) * 12,
      dependentCount: dependents,
    });
  } catch (error: any) {
    return serverError(error, 'estimate cost');
  }
});
