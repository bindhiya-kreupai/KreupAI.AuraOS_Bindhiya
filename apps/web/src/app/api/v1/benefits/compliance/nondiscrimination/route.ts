import type { NextRequest } from 'next/server';
import { prisma } from '@aura/database';
import { withEnhancedAuth } from '@/lib/auth';
import { forbidden, serverError, successItem } from '@/lib/api/crud-helpers';

// Nondiscrimination test (NDT): compare highly-compensated employees (HCE)
// participation/benefits to non-HCE. Returns ratios + pass/fail.
export const GET = withEnhancedAuth(async (request: NextRequest, context: any) => {
  try {
    const { user, permissions } = context;
    if (!permissions.includes('benefits:compliance:read'))
      return forbidden('benefits:compliance:read');
    const planId = new URL(request.url).searchParams.get('planId');
    const where: any = { tenantId: user.tenantId, ...(planId ? { planId } : {}) };
    const enrollments = await prisma.benefitEnrollment.findMany({ where });
    const employeeIds = enrollments.map((e: any) => e.employeeId);
    const employees = employeeIds.length
      ? await (prisma as any).employee.findMany({
          where: { id: { in: employeeIds } },
          select: { id: true, baseSalary: true },
        })
      : [];
    const HCE_THRESHOLD = 150000;
    const hceIds = new Set(
      employees.filter((e: any) => Number(e.baseSalary || 0) >= HCE_THRESHOLD).map((e: any) => e.id)
    );
    const hceCount = hceIds.size;
    const nonHceCount = employees.length - hceCount;
    const hceParticipating = enrollments.filter((e: any) => hceIds.has(e.employeeId)).length;
    const nonHceParticipating = enrollments.length - hceParticipating;
    const hceRate = hceCount ? hceParticipating / hceCount : 0;
    const nonHceRate = nonHceCount ? nonHceParticipating / nonHceCount : 0;
    const ratio = hceRate ? nonHceRate / hceRate : 1;
    return successItem({
      planId,
      hceCount,
      nonHceCount,
      hceParticipationRate: hceRate,
      nonHceParticipationRate: nonHceRate,
      ratio,
      passes: ratio >= 0.7, // safe harbor benchmark
      generatedAt: new Date().toISOString(),
    });
  } catch (error: any) {
    return serverError(error, 'compute nondiscrimination test');
  }
});
