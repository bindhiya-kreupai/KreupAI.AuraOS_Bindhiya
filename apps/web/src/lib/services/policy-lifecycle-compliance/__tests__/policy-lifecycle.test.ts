import { describe, it, expect } from 'vitest';
import {
  diffPolicyVersions,
  evaluateAckCoverage,
  evaluatePolicyReviewCadence,
} from '../policy-lifecycle.service';

const NOW = new Date('2026-06-17T00:00:00Z');

describe('EPIC-36-PL-01 — evaluatePolicyReviewCadence', () => {
  it('NEVER_REVIEWED for active policy without review', () => {
    const r = evaluatePolicyReviewCadence(
      [{ policyId: 'p1', title: 'X', active: true, reviewCadenceDays: 365 }],
      NOW
    );
    expect(r.results[0].status).toBe('NEVER_REVIEWED');
    expect(r.totals.overdue).toBe(1);
  });

  it('CURRENT within cadence', () => {
    const r = evaluatePolicyReviewCadence(
      [
        {
          policyId: 'p1',
          title: 'X',
          active: true,
          reviewCadenceDays: 365,
          lastReviewedAt: new Date('2026-05-01'),
        },
      ],
      NOW
    );
    expect(r.results[0].status).toBe('CURRENT');
  });

  it('OVERDUE past cadence', () => {
    const r = evaluatePolicyReviewCadence(
      [
        {
          policyId: 'p1',
          title: 'X',
          active: true,
          reviewCadenceDays: 30,
          lastReviewedAt: new Date('2025-12-01'),
        },
      ],
      NOW
    );
    expect(r.results[0].status).toBe('OVERDUE');
  });

  it('INACTIVE policy ignored from overdue count', () => {
    const r = evaluatePolicyReviewCadence(
      [{ policyId: 'p1', title: 'X', active: false, reviewCadenceDays: 30 }],
      NOW
    );
    expect(r.results[0].status).toBe('INACTIVE');
    expect(r.totals.overdue).toBe(0);
  });
});

describe('EPIC-36-PL-02 — diffPolicyVersions', () => {
  it('detects no change when bodies are identical', () => {
    const r = diffPolicyVersions({ policyId: 'p1', previous: 'a\nb\nc', next: 'a\nb\nc' });
    expect(r.changed).toBe(false);
    expect(r.addedLines).toBe(0);
    expect(r.removedLines).toBe(0);
    expect(r.previousHash).toBe(r.nextHash);
  });

  it('counts added lines', () => {
    const r = diffPolicyVersions({
      policyId: 'p1',
      previous: 'a\nb',
      next: 'a\nb\nc',
    });
    expect(r.changed).toBe(true);
    expect(r.addedLines).toBe(1);
    expect(r.removedLines).toBe(0);
  });

  it('counts removed lines', () => {
    const r = diffPolicyVersions({ policyId: 'p1', previous: 'a\nb\nc', next: 'a\nc' });
    expect(r.addedLines).toBe(0);
    expect(r.removedLines).toBe(1);
  });

  it('produces both added and removed in mixed diff', () => {
    const r = diffPolicyVersions({
      policyId: 'p1',
      previous: 'header\nold-content\nfooter',
      next: 'header\nnew-content\nfooter',
    });
    expect(r.addedLines).toBe(1);
    expect(r.removedLines).toBe(1);
    expect(r.segments.find((s) => s.type === 'EQUAL' && s.line === 'header')).toBeTruthy();
  });

  it('hashes are different for different bodies', () => {
    const r = diffPolicyVersions({ policyId: 'p1', previous: 'a', next: 'b' });
    expect(r.previousHash).not.toBe(r.nextHash);
  });
});

describe('EPIC-36-PL-03 — evaluateAckCoverage', () => {
  it('100% when all audience acknowledged', () => {
    const r = evaluateAckCoverage(
      [
        {
          policyId: 'p1',
          publishedAt: new Date('2026-05-01'),
          ackWindowDays: 30,
          audience: ['e1', 'e2'],
        },
      ],
      [
        { policyId: 'p1', employeeId: 'e1', acknowledgedAt: new Date('2026-05-10') },
        { policyId: 'p1', employeeId: 'e2', acknowledgedAt: new Date('2026-05-15') },
      ],
      NOW
    );
    expect(r.results[0].coveragePct).toBe(100);
    expect(r.totals.fullyCovered).toBe(1);
  });

  it('marks pending as overdue when window has passed', () => {
    const r = evaluateAckCoverage(
      [
        {
          policyId: 'p1',
          publishedAt: new Date('2026-04-01'),
          ackWindowDays: 30,
          audience: ['e1', 'e2'],
        },
      ],
      [{ policyId: 'p1', employeeId: 'e1', acknowledgedAt: new Date('2026-04-10') }],
      NOW
    );
    expect(r.results[0].coveragePct).toBe(50);
    expect(r.results[0].overdue).toBe(1);
    expect(r.totals.overdue).toBe(1);
  });

  it('keeps pending within window when not yet expired', () => {
    const r = evaluateAckCoverage(
      [
        {
          policyId: 'p1',
          publishedAt: new Date('2026-06-15'),
          ackWindowDays: 30,
          audience: ['e1', 'e2'],
        },
      ],
      [],
      NOW
    );
    expect(r.results[0].pendingWithinWindow).toBe(2);
    expect(r.results[0].overdue).toBe(0);
  });
});
