import { beforeEach, describe, expect, it, vi } from 'vitest';
import { prisma } from '@aura/database';
import { payrollOnboardingService } from '../payroll-onboarding.service';

const prismaMock = prisma as any;

const employee = {
  id: 'emp-1',
  employeeCode: 'EMP-001',
  firstName: 'Sara',
  lastName: 'Al Mansoori',
  joiningDate: new Date('2026-06-15T00:00:00.000Z'),
  companyId: 'company-1',
  department: {
    name: 'Finance',
    costCenter: { code: 'FIN-100' },
  },
};

const compliance = {
  employeeId: 'emp-1',
  countryCode: 'AE',
  bankName: 'Emirates Bank',
  bankAccountNumber: '123456789',
  bankIBAN: 'AE070331234567890123456',
  bankRoutingCode: '033',
  labourCardNumber: 'LC-123',
  wpsPersonalNumber: 'WPS-123',
};

const salary = {
  id: 'sal-1',
  basicSalary: 20000,
  houseRentAllowance: 5000,
  transportAllowance: 1000,
  otherAllowances: [{ code: 'COLA', amount: 4000 }],
  grossSalary: 30000,
  ctc: 360000,
  payFrequency: 'MONTHLY',
};

const payrollConfig = {
  id: 'paycfg-1',
  companyId: 'company-1',
  payDay: 28,
  cutoffDay: 25,
  enableWPS: true,
};

const wpsConfig = {
  id: 'wps-1',
  wpsAgentCode: 'AGENT-1',
  employerCode: 'EMPLOYER-1',
};

describe('PayrollOnboardingService', () => {
  beforeEach(() => {
    prismaMock.employee = {
      findFirst: vi.fn().mockResolvedValue(employee),
    };
    prismaMock.employeeComplianceDetails = {
      findFirst: vi.fn().mockResolvedValue(compliance),
    };
    prismaMock.employeeSalaryStructure = {
      findFirst: vi.fn().mockResolvedValue(salary),
    };
    prismaMock.payrollConfiguration = {
      findFirst: vi.fn().mockResolvedValue(payrollConfig),
    };
    prismaMock.wPSConfiguration = {
      findFirst: vi.fn().mockResolvedValue(wpsConfig),
    };
    prismaMock.employeePayrollProfile = {
      findMany: vi.fn().mockResolvedValue([]),
      findUnique: vi.fn().mockResolvedValue(null),
      findFirst: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    };
    prismaMock.auditLog = {
      create: vi.fn().mockResolvedValue({ id: 'audit-1' }),
    };
  });

  it('calculates first-pay proration from the actual join date', async () => {
    const result = await payrollOnboardingService.evaluate('tenant-1', 'emp-1');

    expect(result).toMatchObject({
      employeeId: 'emp-1',
      countryCode: 'AE',
      readinessStatus: 'READY',
      firstPayrollMonth: '2026-06',
      firstPeriodPaidDays: 16,
      firstPeriodCalendarDays: 30,
      firstPeriodGrossProrated: 16000,
      blockReasons: [],
    });
    expect(result.firstPeriodProrationFactor).toBeCloseTo(0.533333, 5);
  });

  it('blocks WPS readiness when mandatory routing inputs are missing', async () => {
    prismaMock.employeeComplianceDetails.findFirst.mockResolvedValue({
      ...compliance,
      bankIBAN: null,
      bankRoutingCode: null,
      labourCardNumber: null,
    });

    const result = await payrollOnboardingService.evaluate('tenant-1', 'emp-1');

    expect(result.readinessStatus).toBe('BLOCKED');
    expect(result.blockReasons).toContain('Bank IBAN is required for payroll readiness');
    expect(result.blockReasons).toContain('WPS bank routing code is required');
    expect(result.blockReasons).toContain(
      'Labour card number is required for WPS payroll readiness'
    );
  });

  it('creates an auditable payroll profile snapshot', async () => {
    prismaMock.employeePayrollProfile.create.mockImplementation(async ({ data }: any) => ({
      id: 'profile-1',
      ...data,
    }));

    const profile = await payrollOnboardingService.createOrRefresh(
      { employeeId: 'emp-1' },
      { tenantId: 'tenant-1', userId: 'user-1' }
    );

    expect(profile).toMatchObject({
      id: 'profile-1',
      readinessStatus: 'READY',
      approvalStatus: 'PENDING_APPROVAL',
      firstPeriodGrossProrated: 16000,
      costCenterCode: 'FIN-100',
    });
    expect(prismaMock.auditLog.create).toHaveBeenCalled();
  });

  it('blocks payroll lock until the ready profile is approved', async () => {
    prismaMock.employeePayrollProfile.findMany.mockResolvedValue([
      {
        id: 'profile-1',
        employeeId: 'emp-1',
        readinessStatus: 'READY',
        approvalStatus: 'PENDING_APPROVAL',
        blockReasons: [],
      },
    ]);

    const result = await payrollOnboardingService.validatePayrollLock('tenant-1', ['emp-1']);

    expect(result.blocked).toBe(true);
    expect(result.blockers[0]).toMatchObject({
      employeeId: 'emp-1',
      reasons: ['Payroll profile approval status is PENDING_APPROVAL'],
    });
  });
});
