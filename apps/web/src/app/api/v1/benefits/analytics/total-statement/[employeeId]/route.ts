import type { NextRequest } from 'next/server';
import { prisma } from '@aura/database';
import { withEnhancedAuth } from '@/lib/auth';
import { forbidden, notFound, serverError, successItem } from '@/lib/api/crud-helpers';

export const GET = withEnhancedAuth(async (_request: NextRequest, context: any) => {
  try {
    const { user, params, permissions } = context;
    if (!permissions.includes('benefits:read')) return forbidden('benefits:read');
    const employee = await (prisma as any).employee.findFirst({
      where: { id: params.employeeId, tenantId: user.tenantId },
    });
    if (!employee) return notFound('Employee');
    const enrollments = await prisma.benefitEnrollment.findMany({
      where: { tenantId: user.tenantId, employeeId: params.employeeId },
      include: { plan: true } as any,
    });
    const totalEmployeeContribution = enrollments.reduce(
      (sum: number, e: any) => sum + Number(e.monthlyEmployeeContribution || 0),
      0
    );
    const totalEmployerContribution = enrollments.reduce(
      (sum: number, e: any) => sum + Number(e.monthlyEmployerContribution || 0),
      0
    );
    return successItem({
      employeeId: params.employeeId,
      employeeName: `${employee.firstName} ${employee.lastName}`,
      baseSalary: employee.baseSalary || 0,
      monthlyEmployeeContribution: totalEmployeeContribution,
      monthlyEmployerContribution: totalEmployerContribution,
      annualEmployerContribution: totalEmployerContribution * 12,
      totalCompensation: Number(employee.baseSalary || 0) + totalEmployerContribution * 12,
      enrollments: enrollments.map((e: any) => ({
        planId: e.planId,
        planName: e.plan?.name,
        tier: e.tier,
        monthlyEmployeeContribution: e.monthlyEmployeeContribution,
        monthlyEmployerContribution: e.monthlyEmployerContribution,
      })),
    });
  } catch (error: any) {
    return serverError(error, 'fetch total compensation statement');
  }
});
