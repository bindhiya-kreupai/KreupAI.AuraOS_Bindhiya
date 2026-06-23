import { prisma } from '@aura/database';
import type { AuthContext, RagStatus } from './types';

export interface ThresholdInput {
  kpiCode: string;
  countryCode?: string | null;
  greenMin?: number;
  greenMax?: number;
  amberMin?: number;
  amberMax?: number;
  redMin?: number;
  redMax?: number;
  statutoryRef?: string;
}

export interface BandedValue {
  value: number;
  rag: RagStatus | null;
  statutoryBreach: boolean;
}

/**
 * EPIC-38-S06: threshold library + banding.
 *
 * Banding rule: most KPIs use one-sided thresholds (e.g. only greenMin defined =
 * "higher is better" with anything below greenMin → AMBER, below amberMin → RED).
 * Some are window-based (greenMin..greenMax). Statutory breach fires when
 * value falls outside the red band.
 */
export class KpiThresholdService {
  async list(tenantId: string, filter: { kpiCode?: string; countryCode?: string } = {}) {
    return (prisma as any).kpiThreshold.findMany({
      where: {
        tenantId,
        ...(filter.kpiCode ? { kpiCode: filter.kpiCode } : {}),
        ...(filter.countryCode ? { countryCode: filter.countryCode } : {}),
      },
      orderBy: [{ kpiCode: 'asc' }, { countryCode: 'asc' }],
    });
  }

  async upsert(input: ThresholdInput, auth: AuthContext) {
    return (prisma as any).kpiThreshold.upsert({
      where: {
        aura_kpi_threshold_unique: {
          tenantId: auth.tenantId,
          kpiCode: input.kpiCode,
          countryCode: input.countryCode ?? null,
        },
      },
      update: {
        greenMin: input.greenMin ?? null,
        greenMax: input.greenMax ?? null,
        amberMin: input.amberMin ?? null,
        amberMax: input.amberMax ?? null,
        redMin: input.redMin ?? null,
        redMax: input.redMax ?? null,
        statutoryRef: input.statutoryRef,
        updatedBy: auth.userId,
      },
      create: {
        tenantId: auth.tenantId,
        kpiCode: input.kpiCode,
        countryCode: input.countryCode ?? null,
        greenMin: input.greenMin ?? null,
        greenMax: input.greenMax ?? null,
        amberMin: input.amberMin ?? null,
        amberMax: input.amberMax ?? null,
        redMin: input.redMin ?? null,
        redMax: input.redMax ?? null,
        statutoryRef: input.statutoryRef,
        createdBy: auth.userId,
        updatedBy: auth.userId,
      },
    });
  }

  async resolveThreshold(tenantId: string, kpiCode: string, countryCode?: string | null) {
    if (countryCode) {
      const specific = await (prisma as any).kpiThreshold.findUnique({
        where: {
          aura_kpi_threshold_unique: { tenantId, kpiCode, countryCode },
        },
      });
      if (specific) return specific;
    }
    return (prisma as any).kpiThreshold.findUnique({
      where: {
        aura_kpi_threshold_unique: { tenantId, kpiCode, countryCode: null },
      },
    });
  }

  band(value: number, threshold: Record<string, unknown> | null, direction: string): BandedValue {
    if (!threshold) return { value, rag: null, statutoryBreach: false };
    const t = threshold as Record<string, number | null>;
    const greenMin = numOrNull(t.greenMin);
    const greenMax = numOrNull(t.greenMax);
    const amberMin = numOrNull(t.amberMin);
    const amberMax = numOrNull(t.amberMax);
    const redMin = numOrNull(t.redMin);
    const redMax = numOrNull(t.redMax);

    let rag: RagStatus = 'GREEN';

    if (direction === 'HIGHER_IS_BETTER') {
      if (greenMin != null && value >= greenMin) rag = 'GREEN';
      else if (amberMin != null && value >= amberMin) rag = 'AMBER';
      else rag = 'RED';
    } else if (direction === 'LOWER_IS_BETTER') {
      if (greenMax != null && value <= greenMax) rag = 'GREEN';
      else if (amberMax != null && value <= amberMax) rag = 'AMBER';
      else rag = 'RED';
    } else {
      // EXACT: green if within [greenMin..greenMax], otherwise red
      if (greenMin != null && greenMax != null && value >= greenMin && value <= greenMax)
        rag = 'GREEN';
      else rag = 'RED';
    }

    const statutoryBreach =
      rag === 'RED' &&
      ((redMin != null && value < redMin) ||
        (redMax != null && value > redMax) ||
        (amberMin == null && amberMax == null));

    return { value, rag, statutoryBreach };
  }
}

function numOrNull(v: unknown): number | null {
  if (v == null) return null;
  const n = typeof v === 'number' ? v : Number(v);
  return Number.isFinite(n) ? n : null;
}

export const kpiThresholdService = new KpiThresholdService();
