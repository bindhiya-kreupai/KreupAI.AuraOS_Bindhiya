/**
 * LabourMinistrySubmissionService — state machine + payload hashing tests. (#97)
 */

import { describe, it, expect } from 'vitest';
import {
  LabourMinistrySubmissionService,
  InvalidSubmissionTransitionError,
} from '../labour-ministry-submission.service';

const svc = new LabourMinistrySubmissionService();

describe('LabourMinistrySubmissionService transitions', () => {
  it('DRAFT → READY / REJECTED only', () => {
    expect(svc.canTransition('DRAFT', 'READY')).toBe(true);
    expect(svc.canTransition('DRAFT', 'REJECTED')).toBe(true);
    expect(svc.canTransition('DRAFT', 'SUBMITTED')).toBe(false);
    expect(svc.canTransition('DRAFT', 'ACKNOWLEDGED')).toBe(false);
  });

  it('READY ↔ DRAFT and READY → SUBMITTED / REJECTED', () => {
    expect(svc.canTransition('READY', 'SUBMITTED')).toBe(true);
    expect(svc.canTransition('READY', 'DRAFT')).toBe(true);
    expect(svc.canTransition('READY', 'REJECTED')).toBe(true);
    expect(svc.canTransition('READY', 'ACKNOWLEDGED')).toBe(false);
  });

  it('SUBMITTED → ACKNOWLEDGED / REJECTED only', () => {
    expect(svc.canTransition('SUBMITTED', 'ACKNOWLEDGED')).toBe(true);
    expect(svc.canTransition('SUBMITTED', 'REJECTED')).toBe(true);
    expect(svc.canTransition('SUBMITTED', 'DRAFT')).toBe(false);
  });

  it('REJECTED can be redrafted or resubmitted', () => {
    expect(svc.canTransition('REJECTED', 'DRAFT')).toBe(true);
    expect(svc.canTransition('REJECTED', 'RESUBMITTED')).toBe(true);
    expect(svc.canTransition('REJECTED', 'SUBMITTED')).toBe(false);
  });

  it('ACKNOWLEDGED is terminal', () => {
    expect(svc.canTransition('ACKNOWLEDGED', 'DRAFT')).toBe(false);
    expect(svc.canTransition('ACKNOWLEDGED', 'SUBMITTED')).toBe(false);
  });

  it('assertTransition throws on illegal moves', () => {
    expect(() => svc.assertTransition('DRAFT', 'ACKNOWLEDGED')).toThrow(
      InvalidSubmissionTransitionError
    );
  });
});

describe('LabourMinistrySubmissionService.hashPayload', () => {
  it('returns a sha256-shaped hex string', () => {
    const h = svc.hashPayload({ a: 1, b: 'hello' });
    expect(h).toMatch(/^[a-f0-9]{64}$/);
  });

  it('is stable across key ordering', () => {
    const a = svc.hashPayload({ a: 1, b: 'hello' });
    const b = svc.hashPayload({ b: 'hello', a: 1 });
    expect(a).toBe(b);
  });

  it('changes when payload content changes', () => {
    const a = svc.hashPayload({ a: 1, b: 'hello' });
    const b = svc.hashPayload({ a: 1, b: 'world' });
    expect(a).not.toBe(b);
  });
});
