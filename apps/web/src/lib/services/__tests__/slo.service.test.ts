/**
 * SLOService — pure validateTarget + errorBudgetMinutes tests. (#100)
 */

import { describe, it, expect } from 'vitest';
import { SLOService, InvalidSLOTargetError } from '../slo.service';

const svc = new SLOService();

describe('SLOService.validateTarget', () => {
  it('accepts a valid availability target', () => {
    expect(() => svc.validateTarget('AVAILABILITY', 'PCT', 99.95)).not.toThrow();
  });

  it('rejects PCT outside (0, 100]', () => {
    expect(() => svc.validateTarget('AVAILABILITY', 'PCT', 0)).toThrow(InvalidSLOTargetError);
    expect(() => svc.validateTarget('AVAILABILITY', 'PCT', 101)).toThrow(InvalidSLOTargetError);
    expect(() => svc.validateTarget('AVAILABILITY', 'PCT', -1)).toThrow(InvalidSLOTargetError);
  });

  it('rejects AVAILABILITY with non-PCT unit', () => {
    expect(() => svc.validateTarget('AVAILABILITY', 'MS', 99.95)).toThrow(InvalidSLOTargetError);
  });

  it('rejects LATENCY_P95/P99 with non-MS unit', () => {
    expect(() => svc.validateTarget('LATENCY_P95', 'PCT', 250)).toThrow(InvalidSLOTargetError);
    expect(() => svc.validateTarget('LATENCY_P99', 'PCT', 500)).toThrow(InvalidSLOTargetError);
  });

  it('rejects non-finite targetValue', () => {
    expect(() => svc.validateTarget('LATENCY_P95', 'MS', Number.NaN)).toThrow(
      InvalidSLOTargetError
    );
    expect(() => svc.validateTarget('LATENCY_P95', 'MS', Number.POSITIVE_INFINITY)).toThrow(
      InvalidSLOTargetError
    );
  });

  it('rejects MS/RPS/COUNT <= 0', () => {
    expect(() => svc.validateTarget('LATENCY_P95', 'MS', 0)).toThrow(InvalidSLOTargetError);
    expect(() => svc.validateTarget('THROUGHPUT', 'RPS', -5)).toThrow(InvalidSLOTargetError);
    expect(() => svc.validateTarget('ERROR_RATE', 'COUNT', -1)).toThrow(InvalidSLOTargetError);
  });
});

describe('SLOService.errorBudgetMinutes', () => {
  it('returns ~21.6 minutes for 99.95% over 30 days', () => {
    const minutes = svc.errorBudgetMinutes(99.95, 30);
    expect(minutes).toBeCloseTo(21.6, 1);
  });

  it('returns ~4.32 minutes for 99.99% over 30 days', () => {
    const minutes = svc.errorBudgetMinutes(99.99, 30);
    expect(minutes).toBeCloseTo(4.32, 2);
  });

  it('returns 0 for impossible targets', () => {
    expect(svc.errorBudgetMinutes(0, 30)).toBe(0);
    expect(svc.errorBudgetMinutes(100, 30)).toBe(0);
  });
});
