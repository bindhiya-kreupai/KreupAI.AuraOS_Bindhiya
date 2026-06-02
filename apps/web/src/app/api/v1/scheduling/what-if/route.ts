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
    if (!permissions.includes('scheduling:read')) return forbidden('scheduling:read');
    const body = await safeJson(request);
    if (!body?.proposedHours || !Array.isArray(body.proposedHours)) {
      return validationError({ message: 'proposedHours array required' });
    }
    // Compute cost-impact projection using current SalaryComponent rows
    const employeeIds: string[] = body.proposedHours.map((p: any) => p.employeeId);
    const employees = await (prisma as any).employee.findMany({
      where: { id: { in: employeeIds }, tenantId: user.tenantId },
      select: { id: true, baseSalary: true },
    });
    const byId = new Map<string, number>(
      employees.map((e: any) => [e.id, Number(e.baseSalary || 0) / 173.33])
    );
    let totalCost = 0;
    const details = body.proposedHours.map((p: any) => {
      const hourly: number = byId.get(p.employeeId) ?? 0;
      const cost = hourly * Number(p.hours || 0);
      totalCost += cost;
      return { employeeId: p.employeeId, hours: p.hours, hourlyRate: hourly, cost };
    });
    return successItem({
      totalCost,
      currency: 'USD',
      details,
      projectedAt: new Date().toISOString(),
    });
  } catch (error: any) {
    return serverError(error, 'run what-if');
  }
});
