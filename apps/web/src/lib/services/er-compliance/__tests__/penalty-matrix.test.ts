import { describe, it, expect } from 'vitest';
import {
  DEFAULT_PENALTY_MATRIX,
  evaluatePenaltyMatrix,
  type PenaltyMatrixRule,
} from '../penalty-matrix.service';

describe('evaluatePenaltyMatrix — EPIC-26-S02', () => {
  it('returns TERMINATION_FOR_CAUSE for THEFT regardless of prior count', () => {
    const r = evaluatePenaltyMatrix(DEFAULT_PENALTY_MATRIX, {
      misconductType: 'THEFT',
      severity: 'CRITICAL',
      priorCount: 0,
    });
    expect(r.recommendedAction).toBe('TERMINATION_FOR_CAUSE');
    expect(r.fallback).toBe(false);
  });

  it('progressively escalates ABSENTEEISM: 0→VERBAL, 1→WRITTEN, 2→SUSPENSION', () => {
    const a = evaluatePenaltyMatrix(DEFAULT_PENALTY_MATRIX, {
      misconductType: 'ABSENTEEISM',
      priorCount: 0,
    });
    const b = evaluatePenaltyMatrix(DEFAULT_PENALTY_MATRIX, {
      misconductType: 'ABSENTEEISM',
      priorCount: 1,
    });
    const c = evaluatePenaltyMatrix(DEFAULT_PENALTY_MATRIX, {
      misconductType: 'ABSENTEEISM',
      priorCount: 2,
    });
    expect(a.recommendedAction).toBe('VERBAL_WARNING');
    expect(b.recommendedAction).toBe('WRITTEN_WARNING');
    expect(c.recommendedAction).toBe('SUSPENSION');
    expect(c.suspensionDays).toBe(3);
  });

  it('jumps ABSENTEEISM to TERMINATION when severity=CRITICAL', () => {
    const r = evaluatePenaltyMatrix(DEFAULT_PENALTY_MATRIX, {
      misconductType: 'ABSENTEEISM',
      severity: 'CRITICAL',
      priorCount: 0,
    });
    expect(r.recommendedAction).toBe('TERMINATION');
  });

  it('SAFETY_VIOLATION progresses with priorCount', () => {
    const a = evaluatePenaltyMatrix(DEFAULT_PENALTY_MATRIX, {
      misconductType: 'SAFETY_VIOLATION',
      severity: 'HIGH',
      priorCount: 0,
    });
    const b = evaluatePenaltyMatrix(DEFAULT_PENALTY_MATRIX, {
      misconductType: 'SAFETY_VIOLATION',
      severity: 'HIGH',
      priorCount: 1,
    });
    const c = evaluatePenaltyMatrix(DEFAULT_PENALTY_MATRIX, {
      misconductType: 'SAFETY_VIOLATION',
      severity: 'HIGH',
      priorCount: 2,
    });
    expect(a.recommendedAction).toBe('WRITTEN_WARNING');
    expect(b.recommendedAction).toBe('FINAL_WRITTEN_WARNING');
    expect(c.recommendedAction).toBe('TERMINATION');
  });

  it('falls back to a safe default when no rule matches', () => {
    const r = evaluatePenaltyMatrix(DEFAULT_PENALTY_MATRIX, {
      misconductType: 'UNKNOWN_MISCONDUCT',
      priorCount: 0,
    });
    expect(r.fallback).toBe(true);
    expect(r.recommendedAction).toBe('VERBAL_WARNING');
    expect(r.matchedRuleIndex).toBe(-1);
  });

  it('respects an overriding matrix passed in', () => {
    const override: PenaltyMatrixRule[] = [
      {
        misconductType: 'ABSENTEEISM',
        recommendedAction: 'SALARY_DEDUCTION',
        salaryDeductionPct: 5,
        justification: 'KSA override',
        justificationAr: 'تجاوز',
      },
    ];
    const r = evaluatePenaltyMatrix(override, {
      misconductType: 'ABSENTEEISM',
      priorCount: 0,
    });
    expect(r.recommendedAction).toBe('SALARY_DEDUCTION');
    expect(r.salaryDeductionPct).toBe(5);
    expect(r.matchedRuleIndex).toBe(0);
  });

  it('preserves bilingual justification on every match', () => {
    const r = evaluatePenaltyMatrix(DEFAULT_PENALTY_MATRIX, {
      misconductType: 'INSUBORDINATION',
      priorCount: 0,
    });
    expect(r.justification.length).toBeGreaterThan(0);
    expect(r.justificationAr.length).toBeGreaterThan(0);
    expect(r.justification).not.toEqual(r.justificationAr);
  });

  it('POLICY_VIOLATION severity routes to different actions', () => {
    const high = evaluatePenaltyMatrix(DEFAULT_PENALTY_MATRIX, {
      misconductType: 'POLICY_VIOLATION',
      severity: 'HIGH',
      priorCount: 0,
    });
    const medium = evaluatePenaltyMatrix(DEFAULT_PENALTY_MATRIX, {
      misconductType: 'POLICY_VIOLATION',
      severity: 'MEDIUM',
      priorCount: 0,
    });
    expect(high.recommendedAction).toBe('WRITTEN_WARNING');
    expect(medium.recommendedAction).toBe('VERBAL_WARNING');
  });

  it('picks the most specific (first matching) rule when multiple could match', () => {
    // priorCount=5 should still pick the priorCount>=2 rule (more specific
    // for SAFETY_VIOLATION HIGH) before falling through to the count-less one.
    const r = evaluatePenaltyMatrix(DEFAULT_PENALTY_MATRIX, {
      misconductType: 'SAFETY_VIOLATION',
      severity: 'HIGH',
      priorCount: 5,
    });
    expect(r.recommendedAction).toBe('TERMINATION');
  });
});
