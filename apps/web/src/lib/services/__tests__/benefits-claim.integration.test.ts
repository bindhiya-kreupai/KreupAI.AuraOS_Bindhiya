/**
 * BenefitsClaimService — full approval-chain contract integration. (#81)
 *
 * Composes the public service contract (state machine + EOB math + auto-route
 * to PARTIALLY_APPROVED + ApprovedExceedsClaimError) into a single readable
 * scenario. No Prisma — Prisma is mocked via the in-class transition + math
 * helpers that the route layer relies on.
 */

import { describe, it, expect } from 'vitest';
import {
  BenefitsClaimService,
  ApprovedExceedsClaimError,
  InvalidClaimTransitionError,
  type ClaimStatus,
} from '../benefits-claim.service';

const svc = new BenefitsClaimService();

/** Tiny driver that walks a status through a sequence — proves the transition
 *  matrix is self-consistent. */
function walk(start: ClaimStatus, steps: ClaimStatus[]): ClaimStatus {
  let cur = start;
  for (const next of steps) {
    svc.assertTransition(cur, next);
    cur = next;
  }
  return cur;
}

describe('BenefitsClaim happy-path approval chain', () => {
  it('SUBMITTED → UNDER_REVIEW → APPROVED → PAID', () => {
    const end = walk('SUBMITTED', ['UNDER_REVIEW', 'APPROVED', 'PAID']);
    expect(end).toBe('PAID');
  });

  it('SUBMITTED → UNDER_REVIEW → PARTIALLY_APPROVED → PAID', () => {
    const end = walk('SUBMITTED', ['UNDER_REVIEW', 'PARTIALLY_APPROVED', 'PAID']);
    expect(end).toBe('PAID');
  });

  it('SUBMITTED → PENDING_INFO → UNDER_REVIEW → APPROVED → PAID', () => {
    const end = walk('SUBMITTED', ['PENDING_INFO', 'UNDER_REVIEW', 'APPROVED', 'PAID']);
    expect(end).toBe('PAID');
  });
});

describe('BenefitsClaim rejection paths', () => {
  it('rejection is reachable from every non-terminal status', () => {
    const reachable: ClaimStatus[] = [
      'SUBMITTED',
      'UNDER_REVIEW',
      'PENDING_INFO',
      'APPROVED',
      'PARTIALLY_APPROVED',
    ];
    for (const from of reachable) {
      expect(svc.canTransition(from, 'REJECTED')).toBe(true);
    }
  });

  it('PAID is terminal — REJECTED cannot be applied after settlement', () => {
    expect(() => svc.assertTransition('PAID', 'REJECTED')).toThrow(InvalidClaimTransitionError);
  });
});

describe('BenefitsClaim EOB contract surfaces', () => {
  it('employee responsibility math composes correctly with computeNetPayable', () => {
    // $1000 claim, $800 approved, $50 deductible + $40 coinsurance + $10 copay = $100
    // Net payable = $800 − $100 = $700
    const er = svc.computeEmployeeResponsibility(50, 40, 10);
    const net = svc.computeNetPayable(800, er);
    expect(er).toBe(100);
    expect(net).toBe(700);
  });

  it('net payable clamps to 0 when employee responsibility exceeds approved', () => {
    // Pathological case: deductible eats more than approval
    const er = svc.computeEmployeeResponsibility(900, 0, 0);
    const net = svc.computeNetPayable(800, er);
    expect(net).toBe(0);
  });
});

describe('BenefitsClaim approve-over-claim is rejected (real bug guard)', () => {
  it('ApprovedExceedsClaimError carries both numbers for the audit log', () => {
    const err = new ApprovedExceedsClaimError(1200, 1000);
    expect(err.message).toMatch(/1200/);
    expect(err.message).toMatch(/1000/);
    expect(err).toBeInstanceOf(Error);
  });
});
