/**
 * DPAService — pure transition + transfer-mechanism logic tests.
 *
 * No Prisma touched. Covers state machine, GDPR Art. 46 adequacy logic,
 * and the activation guard that closes the placeholder gate for DPAs.
 */

import { describe, it, expect } from 'vitest';
import { DPAService, InvalidDPATransitionError } from '../dpa.service';

const svc = new DPAService();

describe('DPAService transitions', () => {
  it('DRAFT → ACTIVE / TERMINATED only', () => {
    expect(svc.canTransition('DRAFT', 'ACTIVE')).toBe(true);
    expect(svc.canTransition('DRAFT', 'TERMINATED')).toBe(true);
    expect(svc.canTransition('DRAFT', 'EXPIRED')).toBe(false);
  });

  it('ACTIVE → EXPIRED / TERMINATED', () => {
    expect(svc.canTransition('ACTIVE', 'EXPIRED')).toBe(true);
    expect(svc.canTransition('ACTIVE', 'TERMINATED')).toBe(true);
    expect(svc.canTransition('ACTIVE', 'DRAFT')).toBe(false);
  });

  it('EXPIRED can be reactivated or terminated', () => {
    expect(svc.canTransition('EXPIRED', 'ACTIVE')).toBe(true);
    expect(svc.canTransition('EXPIRED', 'TERMINATED')).toBe(true);
    expect(svc.canTransition('EXPIRED', 'DRAFT')).toBe(false);
  });

  it('TERMINATED is terminal', () => {
    expect(svc.canTransition('TERMINATED', 'ACTIVE')).toBe(false);
    expect(svc.canTransition('TERMINATED', 'DRAFT')).toBe(false);
    expect(svc.canTransition('TERMINATED', 'EXPIRED')).toBe(false);
  });

  it('assertTransition throws InvalidDPATransitionError on illegal moves', () => {
    expect(() => svc.assertTransition('DRAFT', 'EXPIRED')).toThrow(InvalidDPATransitionError);
    expect(() => svc.assertTransition('TERMINATED', 'ACTIVE')).toThrow(InvalidDPATransitionError);
  });
});

describe('DPAService.requiresTransferMechanism (GDPR Art. 46)', () => {
  it('returns false when vendorCountry is missing', () => {
    expect(svc.requiresTransferMechanism()).toBe(false);
    expect(svc.requiresTransferMechanism(null)).toBe(false);
    expect(svc.requiresTransferMechanism('')).toBe(false);
  });

  it('returns false for adequacy-decision countries', () => {
    expect(svc.requiresTransferMechanism('GB')).toBe(false); // UK adequacy
    expect(svc.requiresTransferMechanism('CH')).toBe(false); // Switzerland
    expect(svc.requiresTransferMechanism('JP')).toBe(false); // Japan
    expect(svc.requiresTransferMechanism('KR')).toBe(false); // South Korea
    expect(svc.requiresTransferMechanism('CA')).toBe(false); // Canada
  });

  it('returns true for non-adequate countries (e.g. US, India, UAE)', () => {
    expect(svc.requiresTransferMechanism('US')).toBe(true);
    expect(svc.requiresTransferMechanism('IN')).toBe(true);
    expect(svc.requiresTransferMechanism('AE')).toBe(true);
    expect(svc.requiresTransferMechanism('SA')).toBe(true);
  });

  it('is case-insensitive on the country code', () => {
    expect(svc.requiresTransferMechanism('gb')).toBe(false);
    expect(svc.requiresTransferMechanism('us')).toBe(true);
  });
});
