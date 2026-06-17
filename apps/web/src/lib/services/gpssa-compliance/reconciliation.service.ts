import { prisma } from '@aura/database';
import type { AuthContext } from './types';
import {
  normalisePaging,
  prismaPageArgs,
  buildPaginatedResult,
  type PaginationInput,
  type PaginatedResult,
} from '@/lib/services/pagination';

export interface PayrollSiRow {
  employeeId: string;
  payrollContribution: number;
}

function severityFor(diffAbs: number): 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' {
  if (diffAbs > 500) return 'CRITICAL';
  if (diffAbs > 50) return 'HIGH';
  if (diffAbs > 5) return 'MEDIUM';
  return 'LOW';
}

/**
 * EPIC-14-S12 / S20: GPSSA ↔ payroll reconciliation + variance register.
 */
export class GpssaReconciliationService {
  async reconcile(
    input: {
      establishmentId: string;
      period: string;
      payrollRows: PayrollSiRow[];
      tolerance?: number;
    },
    auth: AuthContext
  ) {
    const tolerance = input.tolerance ?? 0.01;
    const gpssa = await (prisma as any).gpssaContribution.findMany({
      where: {
        tenantId: auth.tenantId,
        establishmentId: input.establishmentId,
        period: input.period,
      },
    });
    const gpssaByEmp = new Map(
      (gpssa as Array<{ employeeId: string; employeeAmount: unknown }>).map((g) => [
        g.employeeId,
        Number(g.employeeAmount),
      ])
    );
    const payByEmp = new Map(input.payrollRows.map((r) => [r.employeeId, r.payrollContribution]));
    const seen = new Set<string>();
    let varCount = 0;
    for (const [empId, gpssaAmt] of gpssaByEmp) {
      seen.add(empId);
      const payAmt = payByEmp.get(empId);
      if (payAmt == null) {
        await this.raise(input, empId, 'PAYROLL_MISSING', gpssaAmt, null, auth);
        varCount += 1;
        continue;
      }
      const diff = Number((payAmt - gpssaAmt).toFixed(2));
      if (Math.abs(diff) > tolerance) {
        await this.raise(input, empId, 'AMOUNT_DIFFERENCE', gpssaAmt, payAmt, auth, diff);
        varCount += 1;
      }
    }
    for (const [empId, payAmt] of payByEmp) {
      if (seen.has(empId)) continue;
      await this.raise(input, empId, 'GPSSA_MISSING', null, payAmt, auth);
      varCount += 1;
    }
    return { variances: varCount };
  }

  private async raise(
    input: { establishmentId: string; period: string },
    employeeId: string,
    type: string,
    expected: number | null,
    actual: number | null,
    auth: AuthContext,
    explicitDiff?: number
  ) {
    const diff =
      explicitDiff ??
      (expected != null && actual != null ? Number((actual - expected).toFixed(2)) : null);
    return (prisma as any).gpssaVariance.create({
      data: {
        tenantId: auth.tenantId,
        employeeId,
        establishmentId: input.establishmentId,
        period: input.period,
        type,
        expected,
        actual,
        difference: diff,
        severity: severityFor(Math.abs(diff ?? 0)),
        ownerRole: 'PAYROLL_OFFICER',
        status: 'OPEN',
      },
    });
  }

  async list(
    tenantId: string,
    filter: { period?: string; status?: string; severity?: string } = {},
    paging?: PaginationInput
  ): Promise<PaginatedResult<unknown>> {
    const where = { tenantId, ...filter };
    const page = normalisePaging(paging);
    const [items, total] = await Promise.all([
      (prisma as any).gpssaVariance.findMany({
        where,
        orderBy: [{ severity: 'asc' }, { createdAt: 'desc' }],
        ...prismaPageArgs(page),
      }),
      (prisma as any).gpssaVariance.count({ where }),
    ]);
    return buildPaginatedResult(items, total, page);
  }

  async resolve(id: string, notes?: string) {
    return (prisma as any).gpssaVariance.update({
      where: { id },
      data: { status: 'RESOLVED', notes },
    });
  }
}

export const gpssaReconciliationService = new GpssaReconciliationService();
