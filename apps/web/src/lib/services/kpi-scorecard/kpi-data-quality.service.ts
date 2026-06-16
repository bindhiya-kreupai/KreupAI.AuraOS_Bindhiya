import { prisma } from '@aura/database';
import type { AuthContext } from './types';

export interface DataQualityCheck {
  name: string;
  passed: boolean;
  message?: string;
}

/**
 * EPIC-38-S06: KPI data-quality controls.
 *
 * `runStandardChecks` evaluates completeness, timeliness, accuracy and source
 * reconciliation. If any required check fails, publication should be gated.
 */
export class KpiDataQualityService {
  async record(tenantId: string, kpiCode: string, period: string, checks: DataQualityCheck[]) {
    for (const check of checks) {
      await (prisma as any).kpiDataQualityCheck.create({
        data: {
          tenantId,
          kpiCode,
          period,
          checkName: check.name,
          passed: check.passed,
          message: check.message,
        },
      });
    }
    return { checks: checks.length, passed: checks.every((c) => c.passed) };
  }

  runStandardChecks(opts: {
    rowCount: number;
    expectedMinRows?: number;
    computedAt: Date;
    cutoffAt: Date;
    sourceMatches?: boolean;
    accuracyTolerancePct?: number;
    deltaVsLastPeriodPct?: number | null;
  }): DataQualityCheck[] {
    const checks: DataQualityCheck[] = [];
    checks.push({
      name: 'COMPLETENESS',
      passed:
        opts.expectedMinRows == null ? opts.rowCount > 0 : opts.rowCount >= opts.expectedMinRows,
      message: `${opts.rowCount} rows`,
    });
    checks.push({
      name: 'TIMELINESS',
      passed: opts.computedAt <= opts.cutoffAt,
      message: `computedAt ${opts.computedAt.toISOString()} cutoff ${opts.cutoffAt.toISOString()}`,
    });
    if (opts.sourceMatches != null) {
      checks.push({
        name: 'SOURCE_RECONCILIATION',
        passed: opts.sourceMatches,
        message: opts.sourceMatches ? 'sources match' : 'source counts diverge',
      });
    }
    if (opts.deltaVsLastPeriodPct != null) {
      const tol = opts.accuracyTolerancePct ?? 50;
      checks.push({
        name: 'ACCURACY',
        passed: Math.abs(opts.deltaVsLastPeriodPct) <= tol,
        message: `Δ vs last period = ${opts.deltaVsLastPeriodPct.toFixed(2)}%`,
      });
    }
    return checks;
  }

  async listForPeriod(tenantId: string, period: string) {
    return (prisma as any).kpiDataQualityCheck.findMany({
      where: { tenantId, period },
      orderBy: { checkedAt: 'desc' },
    });
  }
}

export const kpiDataQualityService = new KpiDataQualityService();
