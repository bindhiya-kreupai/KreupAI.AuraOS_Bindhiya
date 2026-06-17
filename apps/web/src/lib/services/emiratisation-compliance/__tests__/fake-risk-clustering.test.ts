import { describe, it, expect } from 'vitest';
import {
  profileHireRisk,
  profileCohort,
  DEFAULT_CLUSTERING_CONFIG,
  type HireSnapshot,
} from '../fake-risk-clustering.service';

function hire(opts: Partial<HireSnapshot> = {}): HireSnapshot {
  return {
    employeeId: 'e1',
    basicSalary: 6000,
    currency: 'AED',
    bankAccountIban: 'IBAN_OK',
    permanentAddress: 'Block A',
    hiredOn: new Date('2026-06-01'),
    recruiterId: 'r1',
    costCenterId: 'cc1',
    hasVisaOnFile: true,
    isOnRoster: true,
    attendanceDaysLast30: 22,
    familyLinkedToHr: false,
    ...opts,
  };
}

describe('profileHireRisk — EPIC-16 fake-risk clustering', () => {
  it('returns 0 / LOW for a clean record with no signals', () => {
    const p = profileHireRisk(hire(), []);
    expect(p.riskScore).toBe(0);
    expect(p.riskBand).toBe('LOW');
    expect(p.signals).toHaveLength(0);
  });

  it('flags SALARY_BELOW_MIN_WAGE for an extremely low salary', () => {
    const p = profileHireRisk(hire({ basicSalary: 1000 }), []);
    expect(p.signals.find((s) => s.code === 'SALARY_BELOW_MIN_WAGE')).toBeTruthy();
  });

  it('flags LOW_PAYROLL_AMOUNT for a below-cohort-floor salary', () => {
    const p = profileHireRisk(hire({ basicSalary: 3500 }), []);
    expect(p.signals.find((s) => s.code === 'LOW_PAYROLL_AMOUNT')).toBeTruthy();
  });

  it('flags NO_ATTENDANCE_LAST_30D when attendance is < 5 days', () => {
    const p = profileHireRisk(hire({ attendanceDaysLast30: 2 }), []);
    expect(p.signals.find((s) => s.code === 'NO_ATTENDANCE_LAST_30D')).toBeTruthy();
  });

  it('flags ABSENT_FROM_ROSTER', () => {
    const p = profileHireRisk(hire({ isOnRoster: false }), []);
    expect(p.signals.find((s) => s.code === 'ABSENT_FROM_ROSTER')).toBeTruthy();
  });

  it('flags NO_VISA_ON_FILE', () => {
    const p = profileHireRisk(hire({ hasVisaOnFile: false }), []);
    expect(p.signals.find((s) => s.code === 'NO_VISA_ON_FILE')).toBeTruthy();
  });

  it('flags SHARED_BANK_ACCOUNT when 2+ others share the IBAN', () => {
    const cohort = [
      hire({ employeeId: 'e2', bankAccountIban: 'SHARED' }),
      hire({ employeeId: 'e3', bankAccountIban: 'SHARED' }),
    ];
    const p = profileHireRisk(hire({ bankAccountIban: 'SHARED' }), cohort);
    expect(p.signals.find((s) => s.code === 'SHARED_BANK_ACCOUNT')).toBeTruthy();
  });

  it('flags SHARED_ADDRESS when 3+ others share the address', () => {
    const cohort = [
      hire({ employeeId: 'e2', permanentAddress: 'Block Z' }),
      hire({ employeeId: 'e3', permanentAddress: 'Block Z' }),
      hire({ employeeId: 'e4', permanentAddress: 'Block Z' }),
    ];
    const p = profileHireRisk(hire({ permanentAddress: 'Block Z' }), cohort);
    expect(p.signals.find((s) => s.code === 'SHARED_ADDRESS')).toBeTruthy();
  });

  it('flags HIRED_SAME_DAY_SAME_RECRUITER at the cluster threshold', () => {
    const day = new Date('2026-06-10');
    const cohort = [
      hire({ employeeId: 'e2', recruiterId: 'r1', hiredOn: day }),
      hire({ employeeId: 'e3', recruiterId: 'r1', hiredOn: day }),
    ];
    const p = profileHireRisk(hire({ recruiterId: 'r1', hiredOn: day }), cohort);
    expect(p.signals.find((s) => s.code === 'HIRED_SAME_DAY_SAME_RECRUITER')).toBeTruthy();
  });

  it('flags SAME_COST_CENTER_SPIKE at the threshold', () => {
    const day = new Date('2026-06-10');
    const cohort = Array.from({ length: 4 }, (_, i) =>
      hire({ employeeId: `e${i + 2}`, costCenterId: 'cc1', hiredOn: day })
    );
    const p = profileHireRisk(hire({ costCenterId: 'cc1', hiredOn: day }), cohort);
    expect(p.signals.find((s) => s.code === 'SAME_COST_CENTER_SPIKE')).toBeTruthy();
  });

  it('rolls multiple signals into a HIGH or CRITICAL band', () => {
    const p = profileHireRisk(
      hire({
        isOnRoster: false,
        hasVisaOnFile: false,
        attendanceDaysLast30: 1,
        basicSalary: 1500,
      }),
      []
    );
    expect(p.riskScore).toBeGreaterThanOrEqual(50);
    expect(p.riskBand === 'HIGH' || p.riskBand === 'CRITICAL').toBe(true);
  });

  it('clamps total score at 100', () => {
    const day = new Date('2026-06-10');
    const cohort = [
      hire({ employeeId: 'e2', bankAccountIban: 'SHARED' }),
      hire({ employeeId: 'e3', bankAccountIban: 'SHARED' }),
      hire({ employeeId: 'e4', permanentAddress: 'Block Z' }),
      hire({ employeeId: 'e5', permanentAddress: 'Block Z' }),
      hire({ employeeId: 'e6', permanentAddress: 'Block Z' }),
      hire({ employeeId: 'e7', recruiterId: 'r1', hiredOn: day }),
      hire({ employeeId: 'e8', recruiterId: 'r1', hiredOn: day }),
      hire({ employeeId: 'e9', costCenterId: 'cc1', hiredOn: day }),
      hire({ employeeId: 'e10', costCenterId: 'cc1', hiredOn: day }),
      hire({ employeeId: 'e11', costCenterId: 'cc1', hiredOn: day }),
      hire({ employeeId: 'e12', costCenterId: 'cc1', hiredOn: day }),
    ];
    const p = profileHireRisk(
      hire({
        bankAccountIban: 'SHARED',
        permanentAddress: 'Block Z',
        recruiterId: 'r1',
        costCenterId: 'cc1',
        hiredOn: day,
        isOnRoster: false,
        hasVisaOnFile: false,
        attendanceDaysLast30: 0,
        basicSalary: 1500,
        familyLinkedToHr: true,
      }),
      cohort
    );
    expect(p.riskScore).toBe(100);
    expect(p.riskBand).toBe('CRITICAL');
  });
});

describe('profileCohort — bulk pass', () => {
  it('returns one profile per cohort entry', () => {
    const cohort = [hire({ employeeId: 'a' }), hire({ employeeId: 'b' })];
    expect(profileCohort(cohort)).toHaveLength(2);
  });
});
