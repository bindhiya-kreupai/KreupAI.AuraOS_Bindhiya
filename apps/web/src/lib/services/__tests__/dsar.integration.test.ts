/**
 * DSARService — full SLA-aware DSAR lifecycle integration. (#81 + #99)
 *
 * Exercises the per-jurisdiction SLA contract and the transition matrix that
 * the privacy-ops dashboard depends on.
 */

import { describe, it, expect } from 'vitest';
import { DSARService, InvalidDSARTransitionError, type DSARStatus } from '../dsar.service';

const svc = new DSARService();

function walk(start: DSARStatus, steps: DSARStatus[]): DSARStatus {
  let cur = start;
  for (const next of steps) {
    svc.assertTransition(cur, next);
    cur = next;
  }
  return cur;
}

describe('DSAR full happy-path lifecycle', () => {
  it('RECEIVED → VERIFYING → IN_PROGRESS → FULFILLED', () => {
    const end = walk('RECEIVED', ['VERIFYING', 'IN_PROGRESS', 'FULFILLED']);
    expect(end).toBe('FULFILLED');
  });

  it('IN_PROGRESS → EXTENDED → IN_PROGRESS → FULFILLED', () => {
    const end = walk('RECEIVED', [
      'VERIFYING',
      'IN_PROGRESS',
      'EXTENDED',
      'IN_PROGRESS',
      'FULFILLED',
    ]);
    expect(end).toBe('FULFILLED');
  });

  it('RECEIVED → REJECTED (early rejection at intake)', () => {
    const end = walk('RECEIVED', ['REJECTED']);
    expect(end).toBe('REJECTED');
  });
});

describe('DSAR SLA computation per jurisdiction', () => {
  const receivedAt = new Date('2026-06-04T00:00:00Z');

  it('GDPR Article 15 default = 30 days', () => {
    const due = svc.computeDueBy('ACCESS', receivedAt, 'GDPR_ART_15');
    expect(due.toISOString().slice(0, 10)).toBe('2026-07-04');
  });

  it('CCPA = 45 days', () => {
    const due = svc.computeDueBy('ACCESS', receivedAt, 'CCPA');
    expect(due.toISOString().slice(0, 10)).toBe('2026-07-19');
  });

  it('UAE PDPL Art. 18 = 30 days', () => {
    const due = svc.computeDueBy('DELETION', receivedAt, 'UAE_PDPL_ART_18');
    expect(due.toISOString().slice(0, 10)).toBe('2026-07-04');
  });

  it('KSA PDPL = 30 days', () => {
    const due = svc.computeDueBy('RECTIFICATION', receivedAt, 'KSA_PDPL');
    expect(due.toISOString().slice(0, 10)).toBe('2026-07-04');
  });

  it('defaults to the request-type → basis map when basis omitted', () => {
    // OBJECTION → GDPR_ART_21 → 30 days
    const due = svc.computeDueBy('OBJECTION', receivedAt);
    expect(due.toISOString().slice(0, 10)).toBe('2026-07-04');
  });
});

describe('DSAR illegal transitions throw', () => {
  it('FULFILLED is terminal', () => {
    expect(() => svc.assertTransition('FULFILLED', 'IN_PROGRESS')).toThrow(
      InvalidDSARTransitionError
    );
  });

  it('cannot skip VERIFYING to FULFILLED', () => {
    expect(() => svc.assertTransition('VERIFYING', 'FULFILLED')).toThrow(
      InvalidDSARTransitionError
    );
  });

  it('REJECTED is terminal', () => {
    expect(() => svc.assertTransition('REJECTED', 'RECEIVED')).toThrow(InvalidDSARTransitionError);
  });
});

describe('DSAR canTransition reflects the public matrix', () => {
  it('every allowed move is symmetric with the assertTransition method', () => {
    const states: DSARStatus[] = [
      'RECEIVED',
      'VERIFYING',
      'IN_PROGRESS',
      'FULFILLED',
      'REJECTED',
      'EXTENDED',
    ];
    for (const from of states) {
      for (const to of states) {
        const allowed = svc.canTransition(from, to);
        if (allowed) {
          expect(() => svc.assertTransition(from, to)).not.toThrow();
        } else {
          expect(() => svc.assertTransition(from, to)).toThrow(InvalidDSARTransitionError);
        }
      }
    }
  });
});
