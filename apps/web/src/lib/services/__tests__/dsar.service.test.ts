/**
 * DSARService — state machine + SLA computation tests. (#99)
 */

import { describe, it, expect } from 'vitest';
import { DSARService, InvalidDSARTransitionError } from '../dsar.service';

const svc = new DSARService();

describe('DSARService.computeDueBy (SLA defaults)', () => {
  const receivedAt = new Date('2026-06-01T00:00:00Z');

  it('GDPR Art. 15 access → 30 days', () => {
    const due = svc.computeDueBy('ACCESS', receivedAt);
    expect(due.toISOString().slice(0, 10)).toBe('2026-07-01');
  });

  it('GDPR Art. 17 deletion → 30 days', () => {
    const due = svc.computeDueBy('DELETION', receivedAt);
    expect(due.toISOString().slice(0, 10)).toBe('2026-07-01');
  });

  it('CCPA basis override → 45 days', () => {
    const due = svc.computeDueBy('ACCESS', receivedAt, 'CCPA');
    expect(due.toISOString().slice(0, 10)).toBe('2026-07-16');
  });

  it('PDPL basis → 30 days', () => {
    const due = svc.computeDueBy('ACCESS', receivedAt, 'UAE_PDPL_ART_18');
    expect(due.toISOString().slice(0, 10)).toBe('2026-07-01');
  });
});

describe('DSARService transitions', () => {
  it('RECEIVED → VERIFYING / REJECTED only', () => {
    expect(svc.canTransition('RECEIVED', 'VERIFYING')).toBe(true);
    expect(svc.canTransition('RECEIVED', 'REJECTED')).toBe(true);
    expect(svc.canTransition('RECEIVED', 'IN_PROGRESS')).toBe(false);
    expect(svc.canTransition('RECEIVED', 'FULFILLED')).toBe(false);
  });

  it('VERIFYING → IN_PROGRESS / REJECTED only', () => {
    expect(svc.canTransition('VERIFYING', 'IN_PROGRESS')).toBe(true);
    expect(svc.canTransition('VERIFYING', 'REJECTED')).toBe(true);
    expect(svc.canTransition('VERIFYING', 'FULFILLED')).toBe(false);
  });

  it('IN_PROGRESS → FULFILLED / REJECTED / EXTENDED', () => {
    expect(svc.canTransition('IN_PROGRESS', 'FULFILLED')).toBe(true);
    expect(svc.canTransition('IN_PROGRESS', 'REJECTED')).toBe(true);
    expect(svc.canTransition('IN_PROGRESS', 'EXTENDED')).toBe(true);
  });

  it('EXTENDED can return to IN_PROGRESS or close out', () => {
    expect(svc.canTransition('EXTENDED', 'IN_PROGRESS')).toBe(true);
    expect(svc.canTransition('EXTENDED', 'FULFILLED')).toBe(true);
    expect(svc.canTransition('EXTENDED', 'REJECTED')).toBe(true);
  });

  it('terminal states reject', () => {
    expect(svc.canTransition('FULFILLED', 'IN_PROGRESS')).toBe(false);
    expect(svc.canTransition('REJECTED', 'IN_PROGRESS')).toBe(false);
  });

  it('assertTransition throws on illegal moves', () => {
    expect(() => svc.assertTransition('RECEIVED', 'FULFILLED')).toThrow(InvalidDSARTransitionError);
  });
});
