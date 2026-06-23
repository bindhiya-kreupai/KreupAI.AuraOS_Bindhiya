import { describe, it, expect } from 'vitest';
import {
  computeReportHash,
  detectRetaliation,
  evaluateCaseSla,
  reduceReportTrail,
} from '../whistleblower.service';

describe('EPIC-31-WB-01 — computeReportHash + reduceReportTrail', () => {
  it('hashes deterministically for the same inputs', () => {
    const h1 = computeReportHash('t1', 'FRAUD', 'body', 'n');
    const h2 = computeReportHash('t1', 'FRAUD', 'body', 'n');
    expect(h1).toBe(h2);
  });

  it('produces different hashes per tenant (no cross-tenant leak)', () => {
    expect(computeReportHash('t1', 'C', 'b', 'n')).not.toBe(computeReportHash('t2', 'C', 'b', 'n'));
  });

  it('reduceReportTrail returns null on empty trail', () => {
    expect(reduceReportTrail([])).toBeNull();
  });

  it('reduceReportTrail returns INTAKE state from a single intake row', () => {
    const r = reduceReportTrail([
      {
        timestamp: new Date('2026-06-01'),
        metadata: {
          reportId: 'r1',
          status: 'INTAKE',
          category: 'FRAUD',
          severity: 'HIGH',
          contentHash: 'abc',
          intakeAt: '2026-06-01T00:00:00Z',
        },
      },
    ])!;
    expect(r.status).toBe('INTAKE');
    expect(r.category).toBe('FRAUD');
    expect(r.severity).toBe('HIGH');
  });

  it('reduceReportTrail handles TRIAGED + INTAKE rows', () => {
    const r = reduceReportTrail([
      {
        timestamp: new Date('2026-06-03'),
        metadata: { status: 'TRIAGED', triagedBy: 'u-checker', triagedAt: '2026-06-03T00:00:00Z' },
      },
      {
        timestamp: new Date('2026-06-01'),
        metadata: {
          reportId: 'r1',
          status: 'INTAKE',
          category: 'FRAUD',
          severity: 'HIGH',
          contentHash: 'abc',
          intakeAt: '2026-06-01T00:00:00Z',
        },
      },
    ])!;
    expect(r.status).toBe('TRIAGED');
    expect(r.triagedBy).toBe('u-checker');
  });

  it('reduceReportTrail handles REJECTED with reason', () => {
    const r = reduceReportTrail([
      {
        timestamp: new Date('2026-06-05'),
        metadata: {
          status: 'REJECTED',
          rejectedBy: 'u-x',
          rejectedAt: '2026-06-05T00:00:00Z',
          reason: 'Out of scope',
        },
      },
      {
        timestamp: new Date('2026-06-01'),
        metadata: {
          reportId: 'r1',
          status: 'INTAKE',
          category: 'C',
          severity: 'LOW',
          contentHash: 'abc',
          intakeAt: '2026-06-01T00:00:00Z',
        },
      },
    ])!;
    expect(r.status).toBe('REJECTED');
    expect(r.rejectionReason).toBe('Out of scope');
  });
});

describe('EPIC-31-WB-02 — detectRetaliation', () => {
  const filedAt = new Date('2026-04-01T00:00:00Z');

  it('returns NONE when no adverse events follow the report', () => {
    const r = detectRetaliation([{ sealedId: 's1', filedAt }], []);
    expect(r.findings[0].likelihood).toBe('NONE');
    expect(r.totals.flagged).toBe(0);
  });

  it('returns HIGH when a TERMINATION occurs within the window', () => {
    const r = detectRetaliation(
      [{ sealedId: 's1', filedAt }],
      [
        {
          sealedId: 's1',
          eventType: 'TERMINATION',
          occurredAt: new Date('2026-05-01T00:00:00Z'),
        },
      ]
    );
    expect(r.findings[0].likelihood).toBe('HIGH');
    expect(r.totals.high).toBe(1);
  });

  it('returns MEDIUM when 2+ soft signals within window', () => {
    const r = detectRetaliation(
      [{ sealedId: 's1', filedAt }],
      [
        { sealedId: 's1', eventType: 'SHIFT_CHANGE', occurredAt: new Date('2026-04-15') },
        { sealedId: 's1', eventType: 'OT_CUT', occurredAt: new Date('2026-05-01') },
      ]
    );
    expect(r.findings[0].likelihood).toBe('MEDIUM');
    expect(r.totals.medium).toBe(1);
  });

  it('ignores events outside the window', () => {
    const r = detectRetaliation(
      [{ sealedId: 's1', filedAt }],
      [
        {
          sealedId: 's1',
          eventType: 'TERMINATION',
          occurredAt: new Date('2026-10-01T00:00:00Z'),
        },
      ],
      90
    );
    expect(r.findings[0].likelihood).toBe('NONE');
  });

  it('does not flag reporters that have no matching events', () => {
    const r = detectRetaliation(
      [
        { sealedId: 's1', filedAt },
        { sealedId: 's2', filedAt },
      ],
      [{ sealedId: 's2', eventType: 'DEMOTION', occurredAt: new Date('2026-04-30') }]
    );
    expect(r.findings.find((f) => f.sealedId === 's1')!.likelihood).toBe('NONE');
    expect(r.findings.find((f) => f.sealedId === 's2')!.likelihood).toBe('HIGH');
  });
});

describe('EPIC-31-WB-03 — evaluateCaseSla', () => {
  const config = { triageDays: 5, investigationDays: 30, closureDays: 90 };
  const NOW = new Date('2026-06-17T00:00:00Z');

  it('marks all stages BREACHED for an old untouched case', () => {
    const r = evaluateCaseSla(
      [{ caseId: 'c1', intakeAt: new Date('2026-01-01T00:00:00Z') }],
      config,
      NOW
    );
    expect(r.results[0].triageStatus).toBe('BREACHED');
    expect(r.results[0].closureStatus).toBe('BREACHED');
    expect(r.totals.breachPct).toBe(100);
  });

  it('marks ON_TRACK for a fresh case', () => {
    const r = evaluateCaseSla(
      [{ caseId: 'c1', intakeAt: new Date('2026-06-15T00:00:00Z') }],
      config,
      NOW
    );
    expect(r.results[0].triageStatus).toBe('ON_TRACK');
    expect(r.results[0].closureStatus).toBe('ON_TRACK');
    expect(r.totals.breaches).toBe(0);
  });

  it('marks CLOSED_ON_TIME when closed within target', () => {
    const r = evaluateCaseSla(
      [
        {
          caseId: 'c1',
          intakeAt: new Date('2026-04-01T00:00:00Z'),
          triagedAt: new Date('2026-04-03T00:00:00Z'),
          investigationStartedAt: new Date('2026-04-05T00:00:00Z'),
          closedAt: new Date('2026-05-15T00:00:00Z'),
        },
      ],
      config,
      NOW
    );
    expect(r.results[0].closureStatus).toBe('CLOSED_ON_TIME');
  });

  it('marks CLOSED_LATE when closure exceeded target', () => {
    const r = evaluateCaseSla(
      [
        {
          caseId: 'c1',
          intakeAt: new Date('2026-01-01T00:00:00Z'),
          triagedAt: new Date('2026-01-03'),
          investigationStartedAt: new Date('2026-01-15'),
          closedAt: new Date('2026-05-01T00:00:00Z'),
        },
      ],
      config,
      NOW
    );
    expect(r.results[0].closureStatus).toBe('CLOSED_LATE');
    expect(r.totals.breachPct).toBe(100);
  });
});
