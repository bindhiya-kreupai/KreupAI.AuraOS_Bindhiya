import { describe, it, expect } from 'vitest';
import {
  detectLegalHoldConflicts,
  evaluateRetentionSchedule,
  validateDestructionLog,
} from '../records-retention.service';

const NOW = new Date('2026-06-17T00:00:00Z');

describe('EPIC-32-RR-01 — evaluateRetentionSchedule', () => {
  it('WITHIN_RETENTION when ageDays < retention', () => {
    const r = evaluateRetentionSchedule(
      [{ recordId: 'r1', category: 'HR', createdAt: new Date('2026-06-01'), retentionDays: 365 }],
      NOW
    );
    expect(r.results[0].status).toBe('WITHIN_RETENTION');
  });

  it('DUE_FOR_REVIEW when slightly past retention', () => {
    const r = evaluateRetentionSchedule(
      [{ recordId: 'r1', category: 'HR', createdAt: new Date('2024-06-01'), retentionDays: 365 }],
      NOW
    );
    expect(r.results[0].status).toBe('OVERDUE_FOR_DESTRUCTION');
  });

  it('DUE_FOR_REVIEW within 30-day grace', () => {
    const created = new Date(NOW.getTime() - 380 * 24 * 3600 * 1000);
    const r = evaluateRetentionSchedule(
      [{ recordId: 'r1', category: 'HR', createdAt: created, retentionDays: 365 }],
      NOW
    );
    expect(r.results[0].status).toBe('DUE_FOR_REVIEW');
  });

  it('PROPERLY_DESTROYED when destroyed after retention', () => {
    const r = evaluateRetentionSchedule(
      [
        {
          recordId: 'r1',
          category: 'HR',
          createdAt: new Date('2024-01-01'),
          destroyedAt: new Date('2026-02-01'),
          retentionDays: 365,
        },
      ],
      NOW
    );
    expect(r.results[0].status).toBe('PROPERLY_DESTROYED');
  });

  it('PREMATURELY_DESTROYED when destroyed before retention period', () => {
    const r = evaluateRetentionSchedule(
      [
        {
          recordId: 'r1',
          category: 'HR',
          createdAt: new Date('2026-01-01'),
          destroyedAt: new Date('2026-03-01'),
          retentionDays: 365,
        },
      ],
      NOW
    );
    expect(r.results[0].status).toBe('PREMATURELY_DESTROYED');
  });
});

describe('EPIC-32-RR-02 — detectLegalHoldConflicts', () => {
  it('flags a destruction request during active hold', () => {
    const r = detectLegalHoldConflicts(
      [
        {
          holdId: 'h1',
          recordId: 'r1',
          startedAt: new Date('2026-01-01'),
          reason: 'Litigation',
        },
      ],
      [{ recordId: 'r1', requestedAt: new Date('2026-03-01') }]
    );
    expect(r.conflicts).toHaveLength(1);
    expect(r.totals.conflicts).toBe(1);
  });

  it('does not flag if hold was released before request', () => {
    const r = detectLegalHoldConflicts(
      [
        {
          holdId: 'h1',
          recordId: 'r1',
          startedAt: new Date('2026-01-01'),
          releasedAt: new Date('2026-02-01'),
          reason: 'X',
        },
      ],
      [{ recordId: 'r1', requestedAt: new Date('2026-03-01') }]
    );
    expect(r.conflicts).toHaveLength(0);
  });

  it('does not flag if no hold on this record', () => {
    const r = detectLegalHoldConflicts(
      [{ holdId: 'h1', recordId: 'r2', startedAt: new Date('2026-01-01'), reason: 'X' }],
      [{ recordId: 'r1', requestedAt: new Date('2026-03-01') }]
    );
    expect(r.conflicts).toHaveLength(0);
  });
});

describe('EPIC-32-RR-03 — validateDestructionLog', () => {
  it('marks fully-populated entry as valid', () => {
    const r = validateDestructionLog(
      [
        {
          recordId: 'r1',
          destroyedAt: new Date('2026-06-01'),
          destroyedBy: 'u1',
          method: 'SHRED',
          witnessId: 'u2',
          certificateRef: 'CERT-1',
        },
      ],
      NOW
    );
    expect(r.results[0].defects).toHaveLength(0);
    expect(r.totals.validityPct).toBe(100);
  });

  it('flags missing fields', () => {
    const r = validateDestructionLog(
      [{ recordId: 'r1', destroyedAt: new Date('2026-06-01') }],
      NOW
    );
    expect(r.results[0].defects).toEqual(
      expect.arrayContaining([
        'MISSING_OPERATOR',
        'MISSING_METHOD',
        'MISSING_WITNESS',
        'MISSING_CERTIFICATE',
      ])
    );
  });

  it('flags duplicates', () => {
    const r = validateDestructionLog(
      [
        {
          recordId: 'r1',
          destroyedAt: new Date('2026-06-01'),
          destroyedBy: 'u',
          method: 'SHRED',
          witnessId: 'u2',
          certificateRef: 'C',
        },
        {
          recordId: 'r1',
          destroyedAt: new Date('2026-06-02'),
          destroyedBy: 'u',
          method: 'SHRED',
          witnessId: 'u2',
          certificateRef: 'C',
        },
      ],
      NOW
    );
    expect(r.results[1].defects).toContain('DUPLICATE_ENTRY');
  });

  it('flags backdated entries', () => {
    const r = validateDestructionLog(
      [
        {
          recordId: 'r1',
          destroyedAt: new Date('2030-01-01'),
          destroyedBy: 'u',
          method: 'SHRED',
          witnessId: 'u2',
          certificateRef: 'C',
        },
      ],
      NOW
    );
    expect(r.results[0].defects).toContain('BACKDATED_ENTRY');
  });
});
