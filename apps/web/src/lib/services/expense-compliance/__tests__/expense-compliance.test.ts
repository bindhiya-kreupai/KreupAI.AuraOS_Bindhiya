import { describe, it, expect } from 'vitest';
import {
  evaluatePolicyExceptionCadence,
  detectDuplicateReceipts,
  evaluatePerDiemCap,
  type PerDiemPolicy,
} from '../expense-compliance.service';

describe('EPIC-27-S-EXCEPT — evaluatePolicyExceptionCadence', () => {
  const raised = new Date('2026-06-01T00:00:00Z');

  it('PASS when exception is already decided', () => {
    const v = evaluatePolicyExceptionCadence(
      {
        exceptionId: 'e1',
        raisedAt: raised,
        decidedAt: new Date('2026-06-03T00:00:00Z'),
        slaDays: 5,
      },
      new Date('2026-06-10T00:00:00Z')
    );
    expect(v.outcome).toBe('PASS');
    expect(v.reason.code).toBe('EXC_DECIDED');
    expect(v.ageDays).toBe(2);
  });

  it('PASS when pending and under half SLA', () => {
    const v = evaluatePolicyExceptionCadence(
      { exceptionId: 'e1', raisedAt: raised, slaDays: 10 },
      new Date('2026-06-03T00:00:00Z')
    );
    expect(v.outcome).toBe('PASS');
  });

  it('WARN when past half SLA but still within SLA', () => {
    const v = evaluatePolicyExceptionCadence(
      { exceptionId: 'e1', raisedAt: raised, slaDays: 10 },
      new Date('2026-06-07T00:00:00Z')
    );
    expect(v.outcome).toBe('WARN');
  });

  it('FAIL when overdue', () => {
    const v = evaluatePolicyExceptionCadence(
      { exceptionId: 'e1', raisedAt: raised, slaDays: 5 },
      new Date('2026-06-10T00:00:00Z')
    );
    expect(v.outcome).toBe('FAIL');
    expect(v.reason.code).toBe('EXC_OVERDUE');
  });
});

describe('EPIC-27-S-DUPE — detectDuplicateReceipts', () => {
  it('PASS with no duplicates', () => {
    const v = detectDuplicateReceipts([
      {
        receiptId: 'r1',
        employeeId: 'e1',
        vendor: 'Marriott',
        date: '2026-06-01',
        amount: 500,
        currency: 'AED',
      },
      {
        receiptId: 'r2',
        employeeId: 'e1',
        vendor: 'Emirates',
        date: '2026-06-01',
        amount: 1200,
        currency: 'AED',
      },
    ]);
    expect(v.outcome).toBe('PASS');
    expect(v.duplicates).toHaveLength(0);
  });

  it('WARN with one duplicate group', () => {
    const v = detectDuplicateReceipts([
      {
        receiptId: 'r1',
        employeeId: 'e1',
        vendor: 'Marriott',
        date: '2026-06-01',
        amount: 500,
        currency: 'AED',
      },
      {
        receiptId: 'r2',
        employeeId: 'e1',
        vendor: 'Marriott',
        date: '2026-06-01T15:00:00Z',
        amount: 500,
        currency: 'AED',
      },
    ]);
    expect(v.outcome).toBe('WARN');
    expect(v.duplicates).toHaveLength(1);
    expect(v.duplicates[0].receiptIds).toContain('r1');
    expect(v.duplicates[0].receiptIds).toContain('r2');
  });

  it('FAIL with multiple duplicate groups', () => {
    const v = detectDuplicateReceipts([
      {
        receiptId: 'r1',
        employeeId: 'e1',
        vendor: 'Marriott',
        date: '2026-06-01',
        amount: 500,
        currency: 'AED',
      },
      {
        receiptId: 'r2',
        employeeId: 'e1',
        vendor: 'Marriott',
        date: '2026-06-01',
        amount: 500,
        currency: 'AED',
      },
      {
        receiptId: 'r3',
        employeeId: 'e1',
        vendor: 'Emirates',
        date: '2026-06-02',
        amount: 1200,
        currency: 'AED',
      },
      {
        receiptId: 'r4',
        employeeId: 'e1',
        vendor: 'Emirates',
        date: '2026-06-02',
        amount: 1200,
        currency: 'AED',
      },
    ]);
    expect(v.outcome).toBe('FAIL');
    expect(v.duplicates).toHaveLength(2);
  });

  it('does not group across employees', () => {
    const v = detectDuplicateReceipts([
      {
        receiptId: 'r1',
        employeeId: 'e1',
        vendor: 'Marriott',
        date: '2026-06-01',
        amount: 500,
        currency: 'AED',
      },
      {
        receiptId: 'r2',
        employeeId: 'e2',
        vendor: 'Marriott',
        date: '2026-06-01',
        amount: 500,
        currency: 'AED',
      },
    ]);
    expect(v.outcome).toBe('PASS');
  });

  it('bilingual summary populated', () => {
    const v = detectDuplicateReceipts([
      {
        receiptId: 'r1',
        employeeId: 'e1',
        vendor: 'X',
        date: '2026-06-01',
        amount: 100,
        currency: 'AED',
      },
      {
        receiptId: 'r2',
        employeeId: 'e1',
        vendor: 'X',
        date: '2026-06-01',
        amount: 100,
        currency: 'AED',
      },
    ]);
    expect(v.summary.en.length).toBeGreaterThan(0);
    expect(v.summary.ar.length).toBeGreaterThan(0);
  });
});

describe('EPIC-27-S-PERDIEM — evaluatePerDiemCap', () => {
  const policy: PerDiemPolicy = {
    countryCode: 'AE',
    capsByTier: { TIER_1: 600, TIER_2: 400, TIER_3: 250 },
    currency: 'AED',
  };

  it('PASS when claim within tier cap', () => {
    const v = evaluatePerDiemCap(
      { countryCode: 'AE', cityTier: 'TIER_1', daysClaimed: 3, totalClaimedAmount: 1500 },
      policy
    );
    expect(v.outcome).toBe('PASS');
    expect(v.effectiveTotalCap).toBe(1800);
    expect(v.overspend).toBe(0);
  });

  it('WARN when overspent <20%', () => {
    const v = evaluatePerDiemCap(
      { countryCode: 'AE', cityTier: 'TIER_2', daysClaimed: 2, totalClaimedAmount: 900 },
      policy
    );
    // cap = 400*2=800, overspend=100, 12.5% > 0 but <20%
    expect(v.outcome).toBe('WARN');
    expect(v.overspend).toBe(100);
  });

  it('FAIL when overspent >20%', () => {
    const v = evaluatePerDiemCap(
      { countryCode: 'AE', cityTier: 'TIER_3', daysClaimed: 1, totalClaimedAmount: 400 },
      policy
    );
    expect(v.outcome).toBe('FAIL');
  });

  it('FAIL on unknown country', () => {
    const v = evaluatePerDiemCap(
      { countryCode: 'XX', cityTier: 'TIER_1', daysClaimed: 1, totalClaimedAmount: 100 },
      policy
    );
    expect(v.outcome).toBe('FAIL');
    expect(v.reason.code).toBe('PER_DIEM_NO_POLICY');
  });

  it('halves cap when meals provided', () => {
    const v = evaluatePerDiemCap(
      {
        countryCode: 'AE',
        cityTier: 'TIER_1',
        daysClaimed: 1,
        totalClaimedAmount: 400,
        mealsProvided: true,
      },
      policy
    );
    // Effective cap = 600 * 0.5 = 300; claim 400 → 33% over → FAIL.
    expect(v.effectiveDailyCap).toBe(300);
    expect(v.outcome).toBe('FAIL');
  });
});
