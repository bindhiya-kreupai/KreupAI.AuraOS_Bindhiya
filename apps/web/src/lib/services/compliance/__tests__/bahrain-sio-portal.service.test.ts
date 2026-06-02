/**
 * BahrainSIOPortalService — SIO portal submission + reconciliation tests.
 */

import { describe, it, expect } from 'vitest';
import { BahrainSIOPortalService } from '../bahrain-sio-portal.service';

const baseEmployees: any = [
  {
    employeeId: 'emp-1',
    cpr: '123456789',
    fullName: 'Ahmed',
    nationality: 'BH',
    basicSalary: 800,
    grossSalary: 1000,
    joiningDate: '2020-01-01',
  },
  {
    employeeId: 'emp-2',
    cpr: '987654321',
    fullName: 'Raj',
    nationality: 'NON_BH',
    basicSalary: 600,
    grossSalary: 800,
    joiningDate: '2022-01-01',
  },
];

describe('BahrainSIOPortalService.generateSubmissionPackage', () => {
  it('builds submission package with totals + counts + CSV', () => {
    const pkg = BahrainSIOPortalService.generateSubmissionPackage('tenant-A', '2026-06', baseEmployees);

    expect(pkg.totalRecords).toBe(2);
    expect(pkg.bahrainiRecords).toBe(1);
    expect(pkg.nonBahrainiRecords).toBe(1);
    expect(pkg.fileName).toMatch(/\.csv$/);
    expect(pkg.fileFormat).toBe('CSV');
    expect(pkg.csvContent).toContain('CPR');
    expect(pkg.checksum).toBeDefined();
  });

  it('computes employer + employee totals correctly', () => {
    const pkg = BahrainSIOPortalService.generateSubmissionPackage('tenant-A', '2026-06', baseEmployees);

    expect(pkg.totalEmployeeContribution).toBeGreaterThan(0);
    expect(pkg.totalEmployerContribution).toBeGreaterThan(0);
    expect(pkg.grandTotal).toBeCloseTo(
      pkg.totalEmployeeContribution + pkg.totalEmployerContribution,
      2
    );
  });

  it('Bahraini employee gets 9%/17% (gross salary 1000 → 90/170)', () => {
    const pkg = BahrainSIOPortalService.generateSubmissionPackage(
      'tenant-A',
      '2026-06',
      [baseEmployees[0]]
    );

    // 1000 × 9% = 90, 1000 × 17% = 170
    expect(pkg.totalEmployeeContribution).toBeCloseTo(90, 1);
    expect(pkg.totalEmployerContribution).toBeCloseTo(170, 1);
  });

  it('Non-Bahraini employee: 0% employee, 3% employer', () => {
    const pkg = BahrainSIOPortalService.generateSubmissionPackage(
      'tenant-A',
      '2026-06',
      [baseEmployees[1]]
    );

    expect(pkg.totalEmployeeContribution).toBe(0);
    // 800 × 3% = 24
    expect(pkg.totalEmployerContribution).toBeCloseTo(24, 1);
  });

  it('caps insurable salary at SIO ceiling', () => {
    const high = [{ ...baseEmployees[0], grossSalary: 10000 }];
    const pkg = BahrainSIOPortalService.generateSubmissionPackage('tenant-A', '2026-06', high);

    // Cap is 4000 BHD; 4000 × 9% = 360
    expect(pkg.totalEmployeeContribution).toBeCloseTo(360, 1);
  });

  it('CSV content includes one header row + one row per employee', () => {
    const pkg = BahrainSIOPortalService.generateSubmissionPackage('tenant-A', '2026-06', baseEmployees);
    const lines = pkg.csvContent.split('\n');
    expect(lines.length).toBe(3); // header + 2 employees
  });

  it('handles empty employees list', () => {
    const pkg = BahrainSIOPortalService.generateSubmissionPackage('tenant-A', '2026-06', []);
    expect(pkg.totalRecords).toBe(0);
    expect(pkg.grandTotal).toBe(0);
  });
});

describe('BahrainSIOPortalService.runPortalReadinessAssessment', () => {
  it('returns a readiness assessment object', () => {
    const pkg = BahrainSIOPortalService.generateSubmissionPackage(
      'tenant-A',
      '2026-06',
      baseEmployees
    );
    const result = BahrainSIOPortalService.runPortalReadinessAssessment('tenant-A', pkg);

    expect(result).toBeDefined();
    expect(typeof result).toBe('object');
  });
});

describe('BahrainSIOPortalService.createEscalation', () => {
  it('creates an escalation with the specified level', () => {
    const escalation = BahrainSIOPortalService.createEscalation('sub-1', 2, 'Awaiting response');
    expect(escalation.escalationId).toMatch(/^ESC-sub-1-L2-/);
    expect(escalation.level).toBe(2);
    expect(escalation.reason).toBe('Awaiting response');
  });
});
