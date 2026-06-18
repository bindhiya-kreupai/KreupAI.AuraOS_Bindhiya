import { describe, it, expect } from 'vitest';
import {
  evaluateConflictOfInterest,
  evaluateVendorDueDiligence,
  screenAgainstSanctionList,
} from '../vendor-compliance.service';

const NOW = new Date('2026-06-17T00:00:00Z');

describe('EPIC-34-VC-01 — evaluateVendorDueDiligence', () => {
  it('NEVER_REVIEWED when lastDdAt missing', () => {
    const r = evaluateVendorDueDiligence(
      [{ vendorId: 'v1', name: 'X', riskTier: 'HIGH' }],
      {},
      NOW
    );
    expect(r.results[0].status).toBe('NEVER_REVIEWED');
    expect(r.totals.overdue).toBe(1);
  });

  it('CURRENT within cadence', () => {
    const r = evaluateVendorDueDiligence(
      [
        {
          vendorId: 'v1',
          name: 'X',
          riskTier: 'HIGH',
          lastDdAt: new Date('2026-04-01'),
        },
      ],
      {},
      NOW
    );
    expect(r.results[0].status).toBe('CURRENT');
  });

  it('OVERDUE past cadence', () => {
    const r = evaluateVendorDueDiligence(
      [
        {
          vendorId: 'v1',
          name: 'X',
          riskTier: 'CRITICAL',
          lastDdAt: new Date('2025-01-01'),
        },
      ],
      {},
      NOW
    );
    expect(r.results[0].status).toBe('OVERDUE');
  });

  it('DUE_SOON when within 85% of cadence', () => {
    const ddAt = new Date(NOW.getTime() - 160 * 24 * 3600 * 1000); // 160d ago with 180d cadence (CRITICAL)
    const r = evaluateVendorDueDiligence(
      [{ vendorId: 'v1', name: 'X', riskTier: 'CRITICAL', lastDdAt: ddAt }],
      {},
      NOW
    );
    expect(r.results[0].status).toBe('DUE_SOON');
  });

  it('honours config override', () => {
    const r = evaluateVendorDueDiligence(
      [{ vendorId: 'v1', name: 'X', riskTier: 'LOW', lastDdAt: new Date('2026-01-01') }],
      { cadenceByTier: { LOW: 30 } },
      NOW
    );
    expect(r.results[0].status).toBe('OVERDUE');
  });
});

describe('EPIC-34-VC-02 — evaluateConflictOfInterest', () => {
  it('flags UNDISCLOSED_LINK when no disclosure on file', () => {
    const r = evaluateConflictOfInterest([{ vendorId: 'v1', employeeId: 'e1' }], []);
    expect(r.results[0].status).toBe('UNDISCLOSED_LINK');
    expect(r.totals.undisclosed).toBe(1);
  });

  it('OK when no link and no disclosure', () => {
    const r = evaluateConflictOfInterest(
      [],
      [{ vendorId: 'v1', declaredAt: new Date('2026-01-01'), hasRelationship: false }]
    );
    expect(r.results[0].status).toBe('OK');
  });

  it('DECLARED_LINK when disclosure on file matches link', () => {
    const r = evaluateConflictOfInterest(
      [{ vendorId: 'v1', employeeId: 'e1' }],
      [
        {
          vendorId: 'v1',
          declaredAt: new Date('2026-01-01'),
          hasRelationship: true,
          relatedEmployeeIds: ['e1'],
        },
      ]
    );
    expect(r.results[0].status).toBe('DECLARED_LINK');
    expect(r.totals.declared).toBe(1);
  });

  it('UNDISCLOSED_LINK when link not in disclosure list', () => {
    const r = evaluateConflictOfInterest(
      [{ vendorId: 'v1', employeeId: 'e2' }],
      [
        {
          vendorId: 'v1',
          declaredAt: new Date('2026-01-01'),
          hasRelationship: false,
          relatedEmployeeIds: ['e1'],
        },
      ]
    );
    expect(r.results[0].status).toBe('UNDISCLOSED_LINK');
  });
});

describe('EPIC-34-VC-03 — screenAgainstSanctionList', () => {
  it('CLEAR when no match', () => {
    const r = screenAgainstSanctionList(
      [{ vendorId: 'v1', name: 'Acme Corp' }],
      [{ listCode: 'OFAC', name: 'Bad Guys LLC' }]
    );
    expect(r.results[0].status).toBe('CLEAR');
  });

  it('CONFIRMED_HIT on exact name', () => {
    const r = screenAgainstSanctionList(
      [{ vendorId: 'v1', name: 'Bad Guys LLC' }],
      [{ listCode: 'OFAC', name: 'Bad Guys LLC' }]
    );
    expect(r.results[0].status).toBe('CONFIRMED_HIT');
    expect(r.totals.hits).toBe(1);
  });

  it('POSSIBLE_MATCH on substring', () => {
    const r = screenAgainstSanctionList(
      [{ vendorId: 'v1', name: 'Bad Guys LLC International' }],
      [{ listCode: 'OFAC', name: 'Bad Guys LLC' }]
    );
    expect(r.results[0].status).toBe('POSSIBLE_MATCH');
  });

  it('case-insensitive matching', () => {
    const r = screenAgainstSanctionList(
      [{ vendorId: 'v1', name: 'bad guys llc' }],
      [{ listCode: 'OFAC', name: 'Bad Guys LLC' }]
    );
    expect(r.results[0].status).toBe('CONFIRMED_HIT');
  });
});
