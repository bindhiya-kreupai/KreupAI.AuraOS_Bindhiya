/**
 * BenefitsClaimService — pure transition + EOB math tests. (#108)
 */

import { describe, it, expect } from 'vitest';
import {
  BenefitsClaimService,
  InvalidClaimTransitionError,
  ApprovedExceedsClaimError,
} from '../benefits-claim.service';

const svc = new BenefitsClaimService();

describe('BenefitsClaimService transitions', () => {
  it('SUBMITTED → UNDER_REVIEW / PENDING_INFO / REJECTED', () => {
    expect(svc.canTransition('SUBMITTED', 'UNDER_REVIEW')).toBe(true);
    expect(svc.canTransition('SUBMITTED', 'PENDING_INFO')).toBe(true);
    expect(svc.canTransition('SUBMITTED', 'REJECTED')).toBe(true);
    expect(svc.canTransition('SUBMITTED', 'PAID')).toBe(false);
    expect(svc.canTransition('SUBMITTED', 'APPROVED')).toBe(false);
  });

  it('UNDER_REVIEW → APPROVED / PARTIALLY_APPROVED / REJECTED / PENDING_INFO', () => {
    expect(svc.canTransition('UNDER_REVIEW', 'APPROVED')).toBe(true);
    expect(svc.canTransition('UNDER_REVIEW', 'PARTIALLY_APPROVED')).toBe(true);
    expect(svc.canTransition('UNDER_REVIEW', 'REJECTED')).toBe(true);
    expect(svc.canTransition('UNDER_REVIEW', 'PENDING_INFO')).toBe(true);
    expect(svc.canTransition('UNDER_REVIEW', 'PAID')).toBe(false);
  });

  it('PENDING_INFO → UNDER_REVIEW / REJECTED only', () => {
    expect(svc.canTransition('PENDING_INFO', 'UNDER_REVIEW')).toBe(true);
    expect(svc.canTransition('PENDING_INFO', 'REJECTED')).toBe(true);
    expect(svc.canTransition('PENDING_INFO', 'APPROVED')).toBe(false);
  });

  it('APPROVED / PARTIALLY_APPROVED → PAID / REJECTED', () => {
    expect(svc.canTransition('APPROVED', 'PAID')).toBe(true);
    expect(svc.canTransition('APPROVED', 'REJECTED')).toBe(true);
    expect(svc.canTransition('PARTIALLY_APPROVED', 'PAID')).toBe(true);
    expect(svc.canTransition('PARTIALLY_APPROVED', 'REJECTED')).toBe(true);
    expect(svc.canTransition('APPROVED', 'UNDER_REVIEW')).toBe(false);
  });

  it('PAID and REJECTED are terminal', () => {
    expect(svc.canTransition('PAID', 'APPROVED')).toBe(false);
    expect(svc.canTransition('REJECTED', 'UNDER_REVIEW')).toBe(false);
  });

  it('assertTransition throws on illegal moves', () => {
    expect(() => svc.assertTransition('SUBMITTED', 'PAID')).toThrow(InvalidClaimTransitionError);
    expect(() => svc.assertTransition('PAID', 'APPROVED')).toThrow(InvalidClaimTransitionError);
  });
});

describe('BenefitsClaimService EOB math', () => {
  it('employee responsibility = deductible + coinsurance + copay', () => {
    expect(svc.computeEmployeeResponsibility(100, 50, 25)).toBe(175);
    expect(svc.computeEmployeeResponsibility(0, 0, 0)).toBe(0);
    expect(svc.computeEmployeeResponsibility(33.33, 16.67, 10)).toBeCloseTo(60, 2);
  });

  it('net payable = approved − employee responsibility, clamped ≥ 0', () => {
    expect(svc.computeNetPayable(500, 100)).toBe(400);
    expect(svc.computeNetPayable(100, 200)).toBe(0); // clamped
    expect(svc.computeNetPayable(500, 0)).toBe(500);
  });
});

describe('ApprovedExceedsClaimError', () => {
  it('is a real Error subclass with both values in the message', () => {
    const err = new ApprovedExceedsClaimError(1000, 500);
    expect(err).toBeInstanceOf(Error);
    expect(err.name).toBe('ApprovedExceedsClaimError');
    expect(err.message).toMatch(/1000/);
    expect(err.message).toMatch(/500/);
  });
});
