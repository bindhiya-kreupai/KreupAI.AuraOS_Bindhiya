import { beforeEach, describe, expect, it, vi } from 'vitest';
import { prisma } from '@aura/database';
import { socialInsuranceOnboardingService } from '../social-insurance-onboarding.service';

const prismaMock = prisma as any;

describe('SocialInsuranceOnboardingService', () => {
  beforeEach(() => {
    prismaMock.employee = {
      findFirst: vi.fn().mockResolvedValue({
        id: 'emp-1',
        employeeCode: 'EMP-001',
        firstName: 'Sara',
        lastName: 'Al Saud',
        joiningDate: new Date('2026-06-01T00:00:00.000Z'),
        companyId: 'company-1',
      }),
    };
    prismaMock.employeeComplianceDetails = {
      findFirst: vi.fn().mockResolvedValue({
        employeeId: 'emp-1',
        countryCode: 'SA',
        nationality: 'SA',
        isLocalNational: true,
      }),
    };
    prismaMock.employeeSalaryStructure = {
      findFirst: vi.fn().mockResolvedValue({
        employeeId: 'emp-1',
        basicSalary: 30000,
        houseRentAllowance: 20000,
        grossSalary: 55000,
      }),
    };
    prismaMock.socialInsuranceRegistration = {
      findMany: vi.fn().mockResolvedValue([]),
      findUnique: vi.fn().mockResolvedValue(null),
      findFirst: vi.fn(),
      upsert: vi.fn(),
      update: vi.fn(),
    };
    prismaMock.auditLog = {
      create: vi.fn().mockResolvedValue({ id: 'audit-1' }),
    };
  });

  it('assigns KSA employees to GOSI and caps the contribution wage', async () => {
    const result = await socialInsuranceOnboardingService.evaluate('tenant-1', 'emp-1');

    expect(result).toMatchObject({
      employeeId: 'emp-1',
      applicable: true,
      mandatory: true,
      authority: 'GOSI',
      scheme: 'KSA_GOSI',
      contributionWage: 45000,
      currency: 'SAR',
      blockCompletion: true,
    });
  });

  it('blocks onboarding completion until mandatory registration is registered with a reference', async () => {
    prismaMock.socialInsuranceRegistration.findUnique.mockResolvedValue({
      id: 'reg-1',
      tenantId: 'tenant-1',
      employeeId: 'emp-1',
      authority: 'GOSI',
      scheme: 'KSA_GOSI',
      status: 'IN_PROGRESS',
      registrationReference: null,
      contributionWage: 45000,
    });

    const gate = await socialInsuranceOnboardingService.getCompletionGate('tenant-1', 'emp-1');

    expect(gate.blocked).toBe(true);
    expect(gate.reasons).toContain('GOSI registration status is IN_PROGRESS');
    expect(gate.reasons).toContain('GOSI registration reference is missing');
  });

  it('clears the onboarding completion gate when the registration is complete', async () => {
    prismaMock.socialInsuranceRegistration.findUnique.mockResolvedValue({
      id: 'reg-1',
      tenantId: 'tenant-1',
      employeeId: 'emp-1',
      authority: 'GOSI',
      scheme: 'KSA_GOSI',
      status: 'REGISTERED',
      registrationReference: 'GOSI-12345',
      contributionWage: 45000,
    });

    const gate = await socialInsuranceOnboardingService.getCompletionGate('tenant-1', 'emp-1');

    expect(gate.blocked).toBe(false);
    expect(gate.reasons).toEqual([]);
  });
});
