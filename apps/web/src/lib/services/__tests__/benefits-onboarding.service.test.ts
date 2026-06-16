import { beforeEach, describe, expect, it, vi } from 'vitest';
import { prisma } from '@aura/database';
import { benefitsOnboardingService } from '../benefits-onboarding.service';

const prismaMock = prisma as any;

const employee = {
  id: 'emp-1',
  employeeCode: 'EMP-001',
  firstName: 'Sara',
  lastName: 'Al Saud',
  joiningDate: new Date('2026-06-01T00:00:00.000Z'),
  departmentId: 'dept-1',
  department: { name: 'Finance' },
  location: {
    code: 'RUH',
    name: 'Riyadh',
    address: {
      state: { code: 'RY', name: 'Riyadh' },
      country: { isoCode: 'SA' },
    },
  },
  grade: { code: 'G7', level: 7 },
};

const medicalPlan = {
  id: 'plan-1',
  tenantId: 'tenant-1',
  planCode: 'MED-KSA-G7',
  planName: 'KSA Gold Medical',
  carrierName: 'CCHI Carrier',
  planTier: 'PREMIUM',
  category: 'HEALTH_INSURANCE',
  status: 'ACTIVE',
  employeePremium: 100,
  employerPremium: 900,
  spousePremium: 200,
  childPremium: 250,
  familyPremium: 400,
  eligibilityCriteria: {
    countryCodes: ['SA'],
    regionCodes: ['RY'],
    gradeCodes: ['G7'],
  },
};

describe('BenefitsOnboardingService', () => {
  beforeEach(() => {
    prismaMock.employee = {
      findFirst: vi.fn().mockResolvedValue(employee),
    };
    prismaMock.employeeComplianceDetails = {
      findFirst: vi.fn().mockResolvedValue({
        employeeId: 'emp-1',
        countryCode: 'SA',
      }),
    };
    prismaMock.benefitPlan = {
      findMany: vi.fn().mockResolvedValue([medicalPlan]),
      findFirst: vi.fn().mockResolvedValue(medicalPlan),
    };
    prismaMock.benefitEnrollment = {
      findMany: vi.fn().mockResolvedValue([]),
      findFirst: vi.fn().mockResolvedValue(null),
      create: vi.fn(),
      update: vi.fn(),
    };
    prismaMock.dependent = {
      findMany: vi.fn().mockResolvedValue([
        {
          id: 'dep-1',
          firstName: 'Ali',
          lastName: 'Al Saud',
          relationship: 'CHILD',
          dateOfBirth: new Date('2020-01-01T00:00:00.000Z'),
          status: 'VERIFIED',
          verificationDocuments: [{ type: 'birth_certificate', url: 'doc://dep-1' }],
        },
      ]),
    };
    prismaMock.auditLog = {
      create: vi.fn().mockResolvedValue({ id: 'audit-1' }),
    };
  });

  it('selects the medical plan by country, region, and grade eligibility', async () => {
    const result = await benefitsOnboardingService.evaluate('tenant-1', 'emp-1');

    expect(result).toMatchObject({
      employeeId: 'emp-1',
      countryCode: 'SA',
      regionCode: 'RY',
      gradeCode: 'G7',
      mandatory: true,
      authority: 'CCHI',
      eligiblePlanCount: 1,
      selectedPlan: {
        id: 'plan-1',
        planCode: 'MED-KSA-G7',
      },
      dependentCount: 1,
      blockCompletion: true,
    });
  });

  it('creates a vendor enrollment record with dependents and requested card status', async () => {
    prismaMock.benefitEnrollment.create.mockImplementation(async ({ data, include }: any) => ({
      id: 'enr-1',
      ...data,
      plan: include?.plan ? medicalPlan : undefined,
    }));

    const enrollment = await benefitsOnboardingService.createOrUpdate(
      { employeeId: 'emp-1', dependentIds: ['dep-1'] },
      { tenantId: 'tenant-1', userId: 'user-1' }
    );

    expect(enrollment).toMatchObject({
      id: 'enr-1',
      employeeId: 'emp-1',
      coverageLevel: 'EMPLOYEE_CHILDREN',
      insuranceCardStatus: 'REQUESTED',
    });
    expect(enrollment.enrolledDependents).toHaveLength(1);
    expect(enrollment.vendorEnrollmentFile).toMatchObject({
      fileType: 'KSA_CCHI_ENROLLMENT',
      authority: 'CCHI',
    });
    expect(prismaMock.auditLog.create).toHaveBeenCalled();
  });

  it('blocks onboarding until the medical card is issued with a vendor reference', async () => {
    prismaMock.benefitEnrollment.findFirst.mockResolvedValue({
      id: 'enr-1',
      tenantId: 'tenant-1',
      employeeId: 'emp-1',
      planId: 'plan-1',
      status: 'PENDING_APPROVAL',
      insuranceCardStatus: 'REQUESTED',
      vendorReference: null,
      vendorEnrollmentFile: { fileType: 'KSA_CCHI_ENROLLMENT' },
      plan: medicalPlan,
    });

    const gate = await benefitsOnboardingService.getCompletionGate('tenant-1', 'emp-1');

    expect(gate.blocked).toBe(true);
    expect(gate.reasons).toContain('Vendor policy/card reference is missing');
    expect(gate.reasons).toContain('Insurance card status is REQUESTED');
  });

  it('clears the completion gate after card issuance', async () => {
    prismaMock.benefitEnrollment.findFirst.mockResolvedValue({
      id: 'enr-1',
      tenantId: 'tenant-1',
      employeeId: 'emp-1',
      planId: 'plan-1',
      status: 'ACTIVE',
      insuranceCardStatus: 'ISSUED',
      vendorReference: 'CCHI-12345',
      vendorEnrollmentFile: { fileType: 'KSA_CCHI_ENROLLMENT' },
      plan: medicalPlan,
    });

    const gate = await benefitsOnboardingService.getCompletionGate('tenant-1', 'emp-1');

    expect(gate.blocked).toBe(false);
    expect(gate.reasons).toEqual([]);
  });
});
