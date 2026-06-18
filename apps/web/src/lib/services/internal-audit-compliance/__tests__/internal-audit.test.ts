import { describe, it, expect } from 'vitest';
import {
  detectRepeatFindings,
  evaluateControlTestCadence,
  evaluateFindingClosureSla,
} from '../internal-audit.service';

const NOW = new Date('2026-06-17T00:00:00Z');

describe('EPIC-37-IA-01 — evaluateControlTestCadence', () => {
  it('NEVER_TESTED for in-scope control without test', () => {
    const r = evaluateControlTestCadence(
      [{ controlId: 'c1', name: 'X', inScope: true, testCadenceDays: 90 }],
      NOW
    );
    expect(r.results[0].status).toBe('NEVER_TESTED');
    expect(r.totals.overdue).toBe(1);
  });

  it('CURRENT within cadence', () => {
    const r = evaluateControlTestCadence(
      [
        {
          controlId: 'c1',
          name: 'X',
          inScope: true,
          testCadenceDays: 90,
          lastTestedAt: new Date('2026-06-01'),
        },
      ],
      NOW
    );
    expect(r.results[0].status).toBe('CURRENT');
  });

  it('OVERDUE past cadence', () => {
    const r = evaluateControlTestCadence(
      [
        {
          controlId: 'c1',
          name: 'X',
          inScope: true,
          testCadenceDays: 30,
          lastTestedAt: new Date('2025-12-01'),
        },
      ],
      NOW
    );
    expect(r.results[0].status).toBe('OVERDUE');
  });

  it('OUT_OF_SCOPE excluded from overdue', () => {
    const r = evaluateControlTestCadence(
      [{ controlId: 'c1', name: 'X', inScope: false, testCadenceDays: 30 }],
      NOW
    );
    expect(r.results[0].status).toBe('OUT_OF_SCOPE');
    expect(r.totals.overdue).toBe(0);
  });
});

describe('EPIC-37-IA-02 — evaluateFindingClosureSla', () => {
  it('OPEN_ON_TRACK for fresh LOW finding', () => {
    const r = evaluateFindingClosureSla(
      [{ findingId: 'f1', raisedAt: new Date('2026-06-10'), severity: 'LOW' }],
      NOW
    );
    expect(r.results[0].status).toBe('OPEN_ON_TRACK');
  });

  it('OPEN_BREACHED past severity SLA', () => {
    const r = evaluateFindingClosureSla(
      [{ findingId: 'f1', raisedAt: new Date('2026-04-01'), severity: 'CRITICAL' }],
      NOW
    );
    expect(r.results[0].status).toBe('OPEN_BREACHED');
    expect(r.totals.breachPct).toBe(100);
  });

  it('CLOSED_ON_TIME when closed within SLA', () => {
    const r = evaluateFindingClosureSla(
      [
        {
          findingId: 'f1',
          raisedAt: new Date('2026-04-01'),
          severity: 'HIGH',
          closedAt: new Date('2026-04-15'),
        },
      ],
      NOW
    );
    expect(r.results[0].status).toBe('CLOSED_ON_TIME');
  });

  it('CLOSED_LATE past SLA', () => {
    const r = evaluateFindingClosureSla(
      [
        {
          findingId: 'f1',
          raisedAt: new Date('2026-01-01'),
          severity: 'HIGH',
          closedAt: new Date('2026-06-01'),
        },
      ],
      NOW
    );
    expect(r.results[0].status).toBe('CLOSED_LATE');
  });

  it('respects overrideSlaDays', () => {
    const r = evaluateFindingClosureSla(
      [
        {
          findingId: 'f1',
          raisedAt: new Date('2026-06-10'),
          severity: 'LOW',
          overrideSlaDays: 1,
        },
      ],
      NOW
    );
    expect(r.results[0].status).toBe('OPEN_BREACHED');
  });
});

describe('EPIC-37-IA-03 — detectRepeatFindings', () => {
  it('no repeats when each finding unique', () => {
    const r = detectRepeatFindings([
      { findingId: 'f1', controlId: 'c1', category: 'A', raisedAt: new Date() },
      { findingId: 'f2', controlId: 'c2', category: 'A', raisedAt: new Date() },
    ]);
    expect(r.groups).toHaveLength(0);
  });

  it('flags repeats when same control+category appears 2+ times', () => {
    const r = detectRepeatFindings([
      { findingId: 'f1', controlId: 'c1', category: 'A', raisedAt: new Date() },
      { findingId: 'f2', controlId: 'c1', category: 'A', raisedAt: new Date() },
    ]);
    expect(r.groups).toHaveLength(1);
    expect(r.groups[0].occurrences).toBe(2);
    expect(r.totals.controls).toBe(1);
  });

  it('respects minOccurrences override', () => {
    const r = detectRepeatFindings(
      [
        { findingId: 'f1', controlId: 'c1', category: 'A', raisedAt: new Date() },
        { findingId: 'f2', controlId: 'c1', category: 'A', raisedAt: new Date() },
      ],
      3
    );
    expect(r.groups).toHaveLength(0);
  });
});
