import { describe, it, expect } from 'vitest';
import {
  DEFAULT_WINDOWS,
  daysBetween,
  selectAlertWindow,
  buildAlert,
  type VisaSnapshot,
} from '../renewal-alerts.service';

function visa(opts: Partial<VisaSnapshot> & { expiryDate: Date }): VisaSnapshot {
  return {
    id: 'v1',
    employeeId: 'e1',
    documentType: 'visa',
    documentNumber: 'X-123',
    expiryDate: opts.expiryDate,
    status: 'ACTIVE',
    ...opts,
  };
}

const ASOF = new Date('2026-06-17T00:00:00Z');

describe('daysBetween', () => {
  it('positive for future expiry', () => {
    expect(daysBetween(ASOF, new Date('2026-06-24T00:00:00Z'))).toBe(7);
  });
  it('zero on expiry day', () => {
    expect(daysBetween(ASOF, new Date('2026-06-17T00:00:00Z'))).toBe(0);
  });
  it('negative after expiry', () => {
    expect(daysBetween(ASOF, new Date('2026-06-10T00:00:00Z'))).toBe(-7);
  });
});

describe('selectAlertWindow — EPIC-29 multi-stage alerts', () => {
  it('picks T-60 for ~60d horizon', () => {
    const w = selectAlertWindow(visa({ expiryDate: new Date('2026-08-15') }), ASOF);
    expect(w?.code).toBe('T-60');
  });

  it('picks T-30 for 16-30d horizon (tightest match)', () => {
    const w = selectAlertWindow(visa({ expiryDate: new Date('2026-07-10') }), ASOF);
    expect(w?.code).toBe('T-30');
  });

  it('picks T-15 for 8-15d horizon', () => {
    const w = selectAlertWindow(visa({ expiryDate: new Date('2026-06-30') }), ASOF);
    expect(w?.code).toBe('T-15');
  });

  it('picks T-7 for 2-7d horizon', () => {
    const w = selectAlertWindow(visa({ expiryDate: new Date('2026-06-22') }), ASOF);
    expect(w?.code).toBe('T-7');
  });

  it('picks T-1 for 0-1d horizon', () => {
    const w = selectAlertWindow(visa({ expiryDate: new Date('2026-06-18') }), ASOF);
    expect(w?.code).toBe('T-1');
  });

  it('picks T+1 (OVERDUE) for any past expiry', () => {
    const w = selectAlertWindow(visa({ expiryDate: new Date('2026-06-10') }), ASOF);
    expect(w?.code).toBe('T+1');
    expect(w?.severity).toBe('OVERDUE');
  });

  it('returns null when expiry is >60d away', () => {
    const w = selectAlertWindow(visa({ expiryDate: new Date('2026-12-31') }), ASOF);
    expect(w).toBeNull();
  });
});

describe('buildAlert', () => {
  it('emits a bilingual message with severity and dependents', () => {
    const primary = visa({
      expiryDate: new Date('2026-06-25'),
      label: 'UAE Work Permit ABC-99',
      labelAr: 'تصريح عمل إماراتي ABC-99',
      familyUnitId: 'fam-1',
    });
    const deps = [
      visa({
        id: 'v-dep-1',
        documentType: 'visa',
        documentNumber: 'DEP-1',
        expiryDate: new Date('2026-06-27'),
        isDependent: true,
        familyUnitId: 'fam-1',
      }),
    ];
    const alert = buildAlert(primary, ASOF, deps)!;
    expect(alert.severity).toBe('URGENT');
    expect(alert.code).toBe('T-15');
    expect(alert.dependents).toHaveLength(1);
    expect(alert.dependents[0].visaId).toBe('v-dep-1');
    expect(alert.messageAr.length).toBeGreaterThan(0);
    expect(alert.message).not.toBe(alert.messageAr);
  });

  it('produces null when the visa is outside all windows', () => {
    const alert = buildAlert(visa({ expiryDate: new Date('2027-01-01') }), ASOF, []);
    expect(alert).toBeNull();
  });
});
