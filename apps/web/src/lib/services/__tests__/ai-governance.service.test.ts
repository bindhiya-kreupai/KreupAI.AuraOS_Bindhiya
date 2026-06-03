/**
 * AIGovernanceService — state machine + 4/5ths rule + publish gate tests. (#115)
 */

import { describe, it, expect } from 'vitest';
import {
  AIGovernanceService,
  InvalidModelTransitionError,
  fourFifthsPassed,
} from '../ai-governance.service';

const svc = new AIGovernanceService();

describe('fourFifthsPassed (EEOC 4/5ths rule)', () => {
  it('passes when worst cohort ratio ≥ 0.8', () => {
    const r = fourFifthsPassed([
      { name: 'male', n: 100, positiveRate: 0.5 },
      { name: 'female', n: 100, positiveRate: 0.42 },
    ]);
    expect(r.passed).toBe(true);
    expect(r.worstRatio).toBeCloseTo(0.84, 2);
  });

  it('fails when worst cohort ratio < 0.8', () => {
    const r = fourFifthsPassed([
      { name: 'male', n: 100, positiveRate: 0.5 },
      { name: 'female', n: 100, positiveRate: 0.3 },
    ]);
    expect(r.passed).toBe(false);
    expect(r.worstRatio).toBeCloseTo(0.6, 2);
  });

  it('handles single cohort (ratio = 1.0)', () => {
    const r = fourFifthsPassed([{ name: 'all', n: 100, positiveRate: 0.5 }]);
    expect(r.passed).toBe(true);
    expect(r.worstRatio).toBe(1);
  });

  it('handles empty cohorts (passes vacuously)', () => {
    const r = fourFifthsPassed([]);
    expect(r.passed).toBe(true);
  });

  it('computes worstCohortGap correctly', () => {
    const r = fourFifthsPassed([
      { name: 'a', n: 100, positiveRate: 0.8 },
      { name: 'b', n: 100, positiveRate: 0.4 },
      { name: 'c', n: 100, positiveRate: 0.6 },
    ]);
    expect(r.worstCohortGap).toBeCloseTo(0.4, 2);
  });
});

describe('AIGovernanceService.canModelTransition', () => {
  it('DRAFT → UNDER_REVIEW / RECALLED only', () => {
    expect(svc.canModelTransition('DRAFT', 'UNDER_REVIEW')).toBe(true);
    expect(svc.canModelTransition('DRAFT', 'RECALLED')).toBe(true);
    expect(svc.canModelTransition('DRAFT', 'PUBLISHED')).toBe(false);
  });

  it('UNDER_REVIEW ↔ DRAFT and UNDER_REVIEW → PUBLISHED', () => {
    expect(svc.canModelTransition('UNDER_REVIEW', 'PUBLISHED')).toBe(true);
    expect(svc.canModelTransition('UNDER_REVIEW', 'DRAFT')).toBe(true);
    expect(svc.canModelTransition('UNDER_REVIEW', 'RECALLED')).toBe(true);
  });

  it('PUBLISHED → DEPRECATED / RECALLED only', () => {
    expect(svc.canModelTransition('PUBLISHED', 'DEPRECATED')).toBe(true);
    expect(svc.canModelTransition('PUBLISHED', 'RECALLED')).toBe(true);
    expect(svc.canModelTransition('PUBLISHED', 'DRAFT')).toBe(false);
  });

  it('RECALLED is terminal', () => {
    expect(svc.canModelTransition('RECALLED', 'DRAFT')).toBe(false);
    expect(svc.canModelTransition('RECALLED', 'PUBLISHED')).toBe(false);
  });

  it('assertModelTransition throws on illegal moves', () => {
    expect(() => svc.assertModelTransition('DRAFT', 'PUBLISHED')).toThrow(
      InvalidModelTransitionError
    );
  });
});

describe('AIGovernanceService.validateHighRiskPublishable', () => {
  const baseValid = {
    riskTier: 'HIGH',
    intendedUse: 'Score employee attrition risk for proactive retention intervention.',
    knownLimitations: 'Trained on US-only data; may underperform for non-US tenants.',
    fairnessMetrics: { demographicParity: 0.85 },
    performanceMetrics: { auc: 0.78 },
    biasAudits: [{ passed: true, auditDate: new Date() }],
  };

  it('returns no reasons for a complete HIGH-risk card', () => {
    expect(svc.validateHighRiskPublishable(baseValid)).toEqual([]);
  });

  it('returns empty array for non-HIGH risk tiers (no gate)', () => {
    expect(svc.validateHighRiskPublishable({ ...baseValid, riskTier: 'LIMITED' })).toEqual([]);
  });

  it('flags short intendedUse', () => {
    const r = svc.validateHighRiskPublishable({ ...baseValid, intendedUse: 'too short' });
    expect(r.some((x) => /intendedUse/.test(x))).toBe(true);
  });

  it('flags missing knownLimitations', () => {
    const r = svc.validateHighRiskPublishable({ ...baseValid, knownLimitations: null });
    expect(r.some((x) => /knownLimitations/.test(x))).toBe(true);
  });

  it('flags missing fairnessMetrics', () => {
    const r = svc.validateHighRiskPublishable({ ...baseValid, fairnessMetrics: {} });
    expect(r.some((x) => /fairnessMetrics/.test(x))).toBe(true);
  });

  it('flags missing recent passing bias audit', () => {
    const r = svc.validateHighRiskPublishable({ ...baseValid, biasAudits: [] });
    expect(r.some((x) => /bias audit/.test(x))).toBe(true);
  });

  it('flags failing most-recent bias audit', () => {
    const r = svc.validateHighRiskPublishable({
      ...baseValid,
      biasAudits: [{ passed: false, auditDate: new Date() }],
    });
    expect(r.some((x) => /must pass/.test(x))).toBe(true);
  });

  it('flags stale bias audit (> 12 months)', () => {
    const oldDate = new Date();
    oldDate.setFullYear(oldDate.getFullYear() - 2);
    const r = svc.validateHighRiskPublishable({
      ...baseValid,
      biasAudits: [{ passed: true, auditDate: oldDate }],
    });
    expect(r.some((x) => /12 months/.test(x))).toBe(true);
  });
});
