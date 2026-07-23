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
  payrollContribution: number; // employee SI deduction recorded in payroll
}

/**
 * EPIC-13-S13 / S21: GOSI ↔ payroll reconciliation + variance register.
 *
 * Compares `gosiContribution.totalEmployee` to the payroll SI deduction.
 * Differences above `tolerance` (default 0.01) are persisted as
 * `GosiVariance` with severity MEDIUM by default; > 50 SAR = HIGH;
 * > 500 SAR = CRITICAL.
 */
function severityFor(diffAbs: number): 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' {
  if (diffAbs > 500) return 'CRITICAL';
  if (diffAbs > 50) return 'HIGH';
  if (diffAbs > 5) return 'MEDIUM';
  return 'LOW';
}

export class GosiReconciliationService {
  async reconcile(
    input: {
      establishmentId: string;
      period: string;
      payrollRows: PayrollSiRow[];
      tolerance?: number;
    },
    auth: AuthContext
  ) {
    let tolerance = input.tolerance;
    if (tolerance == null) {
      const config = await (prisma as any).gosiBranchConfig.findUnique({
        where: { tenantId_branch: { tenantId: auth.tenantId, branch: 'TOLERANCE' } },
      });
      if (config && config.appliesTo && config.appliesTo[0]) {
        tolerance = parseFloat(config.appliesTo[0]);
      }
    }
    if (tolerance == null || isNaN(tolerance)) {
      tolerance = 0.01;
    }
    const gosi = await (prisma as any).gosiContribution.findMany({
      where: {
        tenantId: auth.tenantId,
        establishmentId: input.establishmentId,
        period: input.period,
      },
    });
    const gosiByEmp = new Map(
      (gosi as Array<{ employeeId: string; totalEmployee: unknown }>).map((g) => [
        g.employeeId,
        Number(g.totalEmployee),
      ])
    );
    const payrollByEmp = new Map(
      input.payrollRows.map((r) => [r.employeeId, r.payrollContribution])
    );
    const seen = new Set<string>();
    const variances: Array<Record<string, unknown>> = [];

    for (const [empId, gosiAmt] of gosiByEmp) {
      seen.add(empId);
      const payAmt = payrollByEmp.get(empId);
      if (payAmt == null) {
        variances.push(await this.raise(input, empId, 'PAYROLL_MISSING', gosiAmt, null, auth));
        continue;
      }
      const diff = Number((payAmt - gosiAmt).toFixed(2));
      if (Math.abs(diff) > tolerance) {
        variances.push(
          await this.raise(input, empId, 'AMOUNT_DIFFERENCE', gosiAmt, payAmt, auth, diff)
        );
      }
    }
    for (const [empId, payAmt] of payrollByEmp) {
      if (seen.has(empId)) continue;
      variances.push(await this.raise(input, empId, 'GOSI_MISSING', null, payAmt, auth));
    }
    return {
      variances: variances.length,
      reconciled: gosiByEmp.size - variances.length,
    };
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
    const sev = severityFor(Math.abs(diff ?? 0));
    return (prisma as any).gosiVariance.create({
      data: {
        tenantId: auth.tenantId,
        employeeId,
        establishmentId: input.establishmentId,
        period: input.period,
        type,
        expected,
        actual,
        difference: diff,
        severity: sev,
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
      (prisma as any).gosiVariance.findMany({
        where,
        orderBy: [{ severity: 'asc' }, { createdAt: 'desc' }],
        ...prismaPageArgs(page),
      }),
      (prisma as any).gosiVariance.count({ where }),
    ]);
    return buildPaginatedResult(items, total, page);
  }

  async resolve(varianceId: string, notes: string | undefined) {
    return (prisma as any).gosiVariance.update({
      where: { id: varianceId },
      data: { status: 'RESOLVED', notes },
    });
  }
}

export const gosiReconciliationService = new GosiReconciliationService();
