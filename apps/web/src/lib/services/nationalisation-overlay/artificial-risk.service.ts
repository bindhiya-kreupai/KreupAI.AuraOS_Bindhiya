/**
 * EPIC-16-S06, EPIC-17-S13 — fake / artificial nationalisation detection.
 *
 * Generalises the Bahrainization artificial-risk pattern so the same
 * cross-system signals apply to Emiratisation and Saudization. Each
 * signal is independent — riskBand is derived from the count of
 * triggered signals (LOW < 2, MEDIUM 2, HIGH 3, CRITICAL ≥ 4).
 *
 * Signals (per-employee, per evidence month):
 *   NO_PAYROLL                  — employee not on the payroll run
 *   NO_SOCIAL_INSURANCE         — no GPSSA / GOSI / SIO contribution recorded
 *   NO_WPS_PAYMENT              — WPS / Mudad file has no row for the period
 *   NO_ATTENDANCE               — zero attendance punches all month
 *   NO_LOGIN                    — no system login in the period (info worker)
 *   SALARY_BELOW_MINIMUM        — pay below the country minimum-wage floor
 *   IDENTICAL_PAY_TO_OTHERS     — pay matches >5 other Nationals (templated artifice)
 *   SHARED_BANK_ACCOUNT         — bank account shared with another employee
 *   ABSENT_FROM_ROSTER          — not on any shift roster
 */

import { prisma } from '@aura/database';
import type { AuthContext } from './types';

export const ARTIFICIAL_RISK_SIGNALS = [
  'NO_PAYROLL',
  'NO_SOCIAL_INSURANCE',
  'NO_WPS_PAYMENT',
  'NO_ATTENDANCE',
  'NO_LOGIN',
  'SALARY_BELOW_MINIMUM',
  'IDENTICAL_PAY_TO_OTHERS',
  'SHARED_BANK_ACCOUNT',
  'ABSENT_FROM_ROSTER',
] as const;

export type ArtificialRiskSignal = (typeof ARTIFICIAL_RISK_SIGNALS)[number];

export interface ArtificialRiskInput {
  employeeId: string;
  program: string;
  evidenceMonth: string; // YYYY-MM
  triggeredSignals: ArtificialRiskSignal[];
  notes?: string;
}

/** Pure helper: derive risk band from signal count. */
export function riskBandFromSignals(count: number): 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' {
  if (count >= 4) return 'CRITICAL';
  if (count === 3) return 'HIGH';
  if (count === 2) return 'MEDIUM';
  return 'LOW';
}

export class NationalisationArtificialRiskService {
  async upsert(input: ArtificialRiskInput, auth: AuthContext) {
    const invalid = input.triggeredSignals.filter((s) => !ARTIFICIAL_RISK_SIGNALS.includes(s));
    if (invalid.length) {
      throw new Error(`unknown signal codes: ${invalid.join(', ')}`);
    }
    const band = riskBandFromSignals(input.triggeredSignals.length);
    return (prisma as any).nationalisationArtificialRiskFlag.upsert({
      where: {
        aura_nationalisation_artificial_risk_flag_unique: {
          tenantId: auth.tenantId,
          employeeId: input.employeeId,
          program: input.program,
          evidenceMonth: input.evidenceMonth,
        },
      },
      update: {
        signalsJson: input.triggeredSignals as any,
        signalCount: input.triggeredSignals.length,
        riskBand: band,
        notes: input.notes ?? null,
      },
      create: {
        tenantId: auth.tenantId,
        employeeId: input.employeeId,
        program: input.program,
        evidenceMonth: input.evidenceMonth,
        signalsJson: input.triggeredSignals as any,
        signalCount: input.triggeredSignals.length,
        riskBand: band,
        notes: input.notes ?? null,
      },
    });
  }

  async resolve(id: string, input: { resolutionReason: string }, auth: AuthContext) {
    if (!input.resolutionReason || !input.resolutionReason.trim()) {
      throw new Error('resolutionReason required');
    }
    return (prisma as any).nationalisationArtificialRiskFlag.update({
      where: { id },
      data: {
        isResolved: true,
        resolvedBy: auth.userId,
        resolvedAt: new Date(),
        resolutionReason: input.resolutionReason.trim(),
      },
    });
  }

  async list(
    tenantId: string,
    filter: {
      program?: string;
      riskBand?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
      isResolved?: boolean;
      employeeId?: string;
      evidenceMonth?: string;
    } = {}
  ) {
    return (prisma as any).nationalisationArtificialRiskFlag.findMany({
      where: {
        tenantId,
        ...(filter.program ? { program: filter.program } : {}),
        ...(filter.riskBand ? { riskBand: filter.riskBand } : {}),
        ...(filter.isResolved !== undefined ? { isResolved: filter.isResolved } : {}),
        ...(filter.employeeId ? { employeeId: filter.employeeId } : {}),
        ...(filter.evidenceMonth ? { evidenceMonth: filter.evidenceMonth } : {}),
      },
      orderBy: [{ riskBand: 'desc' }, { evidenceMonth: 'desc' }],
      take: 500,
    });
  }

  async openCriticalCount(tenantId: string, program?: string): Promise<number> {
    return (prisma as any).nationalisationArtificialRiskFlag.count({
      where: {
        tenantId,
        ...(program ? { program } : {}),
        riskBand: { in: ['HIGH', 'CRITICAL'] },
        isResolved: false,
      },
    });
  }
}

export const nationalisationArtificialRiskService = new NationalisationArtificialRiskService();
