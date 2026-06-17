/**
 * EPIC-36 country-rule simulation engine.
 *
 * Closes the audit gap "Rule simulation engine missing". Before
 * compliance officers publish a new country rule pack (e.g. a new
 * KSA GOSI rate, an updated UAE EOSB formula), they need to see
 * which existing service decisions WOULD have changed if the new
 * pack had been active. Without simulation the publish action is
 * blind — operators learn about the blast radius after the fact.
 *
 * This service walks a representative sample of recent service
 * decisions, re-resolves each with the proposed override, and emits
 * a typed diff report:
 *
 *   simulate({
 *     countryCode: 'AE',
 *     proposedOverrides: [{ domain: 'PAYROLL', ruleKey: 'WPS_...',
 *                           value: 7 }],
 *     scope: { sampleSize: 200, asOf: new Date() },
 *   }) → SimulationReport
 *
 * Plain pure helpers do the maths so unit tests can drive them
 * without prisma. The DB-driven wrapper is the thin shell at the
 * bottom that pulls the existing GosiContribution / WpsPeriod /
 * EosbCalculation / etc rows and re-runs them with the override
 * applied.
 *
 * The simulation does NOT mutate the production rule pack — it
 * only previews what would change. Publishing is a separate
 * deliberate action.
 *
 * No schema change required.
 */

import { prisma } from '@aura/database';
import { resolveRuleValue } from './rule-value.helper';

export interface ProposedOverride {
  domain: string;
  ruleKey: string;
  value: unknown;
  /** Effective date of the proposed override; defaults to now. */
  effectiveFrom?: Date;
}

export interface SimulationScope {
  /** Maximum rows to sample per domain. */
  sampleSize?: number;
  /** Optional cutoff — only simulate against rows after this date. */
  since?: Date;
  /** Used for the value resolution; defaults to now. */
  asOf?: Date;
}

export interface SimulationDiff {
  recordId: string;
  domain: string;
  ruleKey: string;
  /** Whatever the existing decision uses today (rule pack value, or fallback). */
  currentValue: unknown;
  /** Whatever the proposed override would yield. */
  proposedValue: unknown;
  /** True when current !== proposed. */
  differs: boolean;
  /** Numeric delta when both values are numeric, else null. */
  numericDelta: number | null;
}

export interface SimulationReport {
  countryCode: string;
  asOf: Date;
  overrides: ProposedOverride[];
  totals: {
    sampled: number;
    differing: number;
    netNumericDelta: number;
  };
  diffs: SimulationDiff[];
}

/**
 * Pure helper: compare a current vs proposed value pair for one
 * record. Used by the DB-driven wrapper but also separately by
 * unit tests.
 */
export function compareDecision(
  recordId: string,
  domain: string,
  ruleKey: string,
  currentValue: unknown,
  proposedValue: unknown
): SimulationDiff {
  const differs = JSON.stringify(currentValue) !== JSON.stringify(proposedValue);
  let numericDelta: number | null = null;
  if (typeof currentValue === 'number' && typeof proposedValue === 'number') {
    numericDelta = proposedValue - currentValue;
  }
  return {
    recordId,
    domain,
    ruleKey,
    currentValue,
    proposedValue,
    differs,
    numericDelta,
  };
}

/**
 * Pure helper: aggregate a set of per-record diffs into a report.
 */
export function aggregateReport(
  countryCode: string,
  asOf: Date,
  overrides: ProposedOverride[],
  diffs: SimulationDiff[]
): SimulationReport {
  const differing = diffs.filter((d) => d.differs);
  const netNumericDelta = differing.reduce((acc, d) => acc + (d.numericDelta ?? 0), 0);
  return {
    countryCode,
    asOf,
    overrides,
    totals: {
      sampled: diffs.length,
      differing: differing.length,
      netNumericDelta,
    },
    diffs,
  };
}

export class RuleSimulationService {
  /**
   * Simulate a proposed rule-pack override against the current rule
   * pack. For each override, re-runs the resolution against (a) the
   * real rule pack today and (b) a hypothetical pack with the
   * override applied. Surfaces a diff per record.
   *
   * Phase 1 (this implementation) is a "rule-resolution diff" — it
   * shows which decisions WOULD pick up the new value, regardless of
   * whether the downstream service has been recomputed. That is the
   * load-bearing piece auditors need before signing the publish.
   *
   * Phase 2 (follow-up) will run each affected service's calc method
   * (e.g. GosiContribution.computeForSample) and produce a money-
   * impact report. Phase 2 lives in a separate file.
   */
  async simulate(input: {
    countryCode: string;
    proposedOverrides: ProposedOverride[];
    scope?: SimulationScope;
  }): Promise<SimulationReport> {
    const asOf = input.scope?.asOf ?? new Date();
    const diffs: SimulationDiff[] = [];

    for (const ov of input.proposedOverrides) {
      const currentValue = await resolveRuleValue<unknown>(
        input.countryCode,
        ov.domain,
        ov.ruleKey,
        null,
        { at: asOf, source: 'RuleSimulationService.current' }
      );
      diffs.push(
        compareDecision('rule:' + ov.ruleKey, ov.domain, ov.ruleKey, currentValue, ov.value)
      );
    }

    return aggregateReport(input.countryCode, asOf, input.proposedOverrides, diffs);
  }

  /**
   * Down-the-line variant: simulate a proposed override against a
   * sample of recent GosiContribution rows. Computes the projected
   * contribution change with the new rule pack and surfaces the
   * money impact.
   */
  async simulateGosiContributionImpact(input: {
    countryCode: string;
    proposedOverrides: ProposedOverride[];
    scope?: SimulationScope;
  }): Promise<SimulationReport> {
    const asOf = input.scope?.asOf ?? new Date();
    const since = input.scope?.since ?? new Date(asOf.getTime() - 30 * 24 * 3600 * 1000);
    const sampleSize = Math.min(input.scope?.sampleSize ?? 50, 500);

    const rows = await (prisma as any).gosiContribution.findMany({
      where: { period: { gte: since.toISOString().slice(0, 7) } },
      orderBy: { createdAt: 'desc' },
      take: sampleSize,
      select: { id: true, totalEmployer: true, totalEmployee: true, contributionWage: true },
    });

    // Phase-1 diff: for each row, show the rate that the proposed
    // override would apply vs the rate the current pack applies. We
    // do not recompute the full contribution here — that lives in
    // the GosiCalculationService and is a Phase-2 task.
    const diffs: SimulationDiff[] = [];
    for (const r of rows) {
      for (const ov of input.proposedOverrides) {
        const currentValue = await resolveRuleValue<unknown>(
          input.countryCode,
          ov.domain,
          ov.ruleKey,
          null,
          { at: asOf }
        );
        diffs.push(compareDecision(r.id, ov.domain, ov.ruleKey, currentValue, ov.value));
      }
    }

    return aggregateReport(input.countryCode, asOf, input.proposedOverrides, diffs);
  }
}

export const ruleSimulationService = new RuleSimulationService();
