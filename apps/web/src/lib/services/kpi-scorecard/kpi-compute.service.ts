import { prisma } from '@aura/database';
import type { AuthContext } from './types';
import { kpiCatalogService } from './kpi-catalog.service';
import { kpiThresholdService } from './kpi-threshold.service';
import { kpiDataQualityService } from './kpi-data-quality.service';
import { evaluateFormula, type EvaluationContext } from '../expression-dsl/expression.service';

export interface RecordValueInput {
  kpiCode: string;
  period: string;
  value: number;
  countryCode?: string | null;
  legalEntityId?: string | null;
  inputs?: Record<string, unknown>;
  dataQualityPass?: boolean;
}

/**
 * EPIC-38-S02–S05: KPI compute + persistence.
 *
 * This service is the publication gate: a KPI value is only written when
 * the catalogue has an ACTIVE definition for the code and (if data-quality
 * is enforced) the dataQualityPass flag is true. Bands and statutory-breach
 * flags are resolved from the threshold library.
 */
export class KpiComputeService {
  async record(input: RecordValueInput, auth: AuthContext) {
    const def = await kpiCatalogService.getActive(auth.tenantId, input.kpiCode);
    if (!def) {
      throw new Error(`KPI ${input.kpiCode} has no ACTIVE definition; approve a draft first`);
    }
    const threshold = await kpiThresholdService.resolveThreshold(
      auth.tenantId,
      input.kpiCode,
      input.countryCode ?? null
    );
    const banded = kpiThresholdService.band(input.value, threshold, def.direction);
    const dqPass = input.dataQualityPass ?? true;
    if (!dqPass) {
      throw new Error(`data-quality failed for ${input.kpiCode}; publication gated`);
    }
    return (prisma as any).kpiValue.upsert({
      where: {
        aura_kpi_value_unique: {
          tenantId: auth.tenantId,
          kpiCode: input.kpiCode,
          countryCode: input.countryCode ?? null,
          legalEntityId: input.legalEntityId ?? null,
          period: input.period,
        },
      },
      update: {
        value: banded.value,
        ragStatus: banded.rag,
        statutoryBreach: banded.statutoryBreach,
        dataQualityPass: dqPass,
        computedAt: new Date(),
        inputsJson: input.inputs ?? {},
      },
      create: {
        tenantId: auth.tenantId,
        kpiCode: input.kpiCode,
        countryCode: input.countryCode ?? null,
        legalEntityId: input.legalEntityId ?? null,
        period: input.period,
        value: banded.value,
        ragStatus: banded.rag,
        statutoryBreach: banded.statutoryBreach,
        dataQualityPass: dqPass,
        inputsJson: input.inputs ?? {},
      },
    });
  }

  async values(
    tenantId: string,
    filter: { period?: string; kpiCode?: string; countryCode?: string; ragStatus?: string } = {}
  ) {
    return (prisma as any).kpiValue.findMany({
      where: {
        tenantId,
        ...(filter.period ? { period: filter.period } : {}),
        ...(filter.kpiCode ? { kpiCode: filter.kpiCode } : {}),
        ...(filter.countryCode ? { countryCode: filter.countryCode } : {}),
        ...(filter.ragStatus ? { ragStatus: filter.ragStatus } : {}),
      },
      orderBy: [{ period: 'desc' }, { kpiCode: 'asc' }],
    });
  }

  async recordWithDq(
    input: RecordValueInput & {
      rowCount: number;
      expectedMinRows?: number;
      computedAt?: Date;
      cutoffAt?: Date;
      sourceMatches?: boolean;
    },
    auth: AuthContext
  ) {
    const checks = kpiDataQualityService.runStandardChecks({
      rowCount: input.rowCount,
      expectedMinRows: input.expectedMinRows,
      computedAt: input.computedAt ?? new Date(),
      cutoffAt: input.cutoffAt ?? new Date(Date.now() + 24 * 3600 * 1000),
      sourceMatches: input.sourceMatches,
    });
    const { passed } = await kpiDataQualityService.record(
      auth.tenantId,
      input.kpiCode,
      input.period,
      checks
    );
    if (!passed) {
      throw new Error(`data-quality failed for ${input.kpiCode}`);
    }
    return this.record({ ...input, dataQualityPass: true }, auth);
  }

  /**
   * Compute a KPI value from its stored formula expression instead of
   * accepting a pre-computed number. The active catalogue definition
   * supplies the formula (KpiDefinition.formula). The supplied `inputs`
   * object becomes the evaluation context.
   *
   * (audit Pattern 8 closure: KPI formulas used to be inert TEXT that
   * external code had to parse; now they're executed by the safe DSL.)
   *
   * Throws if the catalogue definition is missing or its `formula`
   * field is empty.
   */
  async computeFromFormula(
    input: Omit<RecordValueInput, 'value'> & { inputs: EvaluationContext },
    auth: AuthContext
  ) {
    const def = await kpiCatalogService.getActive(auth.tenantId, input.kpiCode);
    if (!def) {
      throw new Error(`KPI ${input.kpiCode} has no ACTIVE definition; approve a draft first`);
    }
    if (!def.formula || typeof def.formula !== 'string' || def.formula.trim().length === 0) {
      throw new Error(`KPI ${input.kpiCode} has no formula expression to compute from`);
    }
    const value = evaluateFormula(def.formula, input.inputs);
    return this.record({ ...input, value, inputs: input.inputs as Record<string, unknown> }, auth);
  }
}

export const kpiComputeService = new KpiComputeService();
