import { beforeEach, describe, expect, it, vi } from 'vitest';
import { prisma } from '@aura/database';
import { onboardingCaseService } from '../onboarding-case.service';

const prismaMock = prisma as any;

const baseCase = {
  id: 'case-1',
  tenantId: 'tenant-1',
  offerId: 'offer-1',
  onboardingInstanceId: 'inst-1',
  employeeId: 'emp-1',
  countryCode: 'AE',
  legalEntityId: 'company-1',
  employmentType: 'FULL_TIME',
  targetJoinDate: new Date('2026-06-01T00:00:00.000Z'),
  currentStage: 'PRE_JOINING',
  status: 'OPEN',
  stageOwnerRole: 'HR_ADMIN',
  escalationRole: 'HR_MANAGER',
  governanceSnapshot: {
    PRE_JOINING: {
      ownerRole: 'HR_ADMIN',
      slaHours: 72,
      escalationRole: 'HR_MANAGER',
      exitCriteria: ['pre_joining_signed_off'],
    },
    JOINING_DAY: {
      ownerRole: 'HR_ADMIN',
      slaHours: 24,
      escalationRole: 'HR_MANAGER',
      exitCriteria: ['joining_day_completed'],
    },
    MASTER_DATA_ACTIVATION: {
      ownerRole: 'HR_MANAGER',
      slaHours: 24,
      escalationRole: 'HR_DIRECTOR',
      exitCriteria: ['employee_master_activated'],
    },
    ENROLMENT: {
      ownerRole: 'PAYROLL_OFFICER',
      slaHours: 72,
      escalationRole: 'HR_MANAGER',
      exitCriteria: [],
    },
    PROBATION: {
      ownerRole: 'LINE_MANAGER',
      slaHours: 2160,
      escalationRole: 'HR_MANAGER',
      exitCriteria: [],
    },
    COMPLETED: {
      ownerRole: 'HR_MANAGER',
      slaHours: 0,
      escalationRole: 'HR_MANAGER',
      exitCriteria: [],
    },
  },
  blockingItems: [],
};

describe('OnboardingCaseService', () => {
  beforeEach(() => {
    prismaMock.onboardingGovernanceTemplate = {
      upsert: vi.fn().mockImplementation(async ({ create }: any) => ({ id: 'gov-1', ...create })),
      findFirst: vi.fn().mockResolvedValue({
        id: 'gov-1',
        version: '2026.1',
        stageConfig: baseCase.governanceSnapshot,
        checklistTemplate: { template: 'default' },
      }),
    };
    prismaMock.jobOffer = {
      findFirst: vi.fn().mockResolvedValue({
        id: 'offer-1',
        status: 'accepted',
        application: { candidate: { firstName: 'Sara', lastName: 'Al Mansoori' } },
      }),
    };
    prismaMock.onboardingCase = {
      findMany: vi.fn().mockResolvedValue([]),
      findUnique: vi.fn().mockResolvedValue(null),
      findFirst: vi.fn().mockResolvedValue(baseCase),
      create: vi.fn().mockImplementation(async ({ data }: any) => ({ id: 'case-1', ...data })),
      update: vi.fn().mockImplementation(async ({ data }: any) => ({ ...baseCase, ...data })),
    };
    prismaMock.onboardingStageHistory = {
      create: vi.fn().mockImplementation(async ({ data }: any) => ({ id: 'hist-1', ...data })),
    };
    prismaMock.onboardingTask = {
      count: vi.fn().mockResolvedValue(0),
    };
    prismaMock.employeeMasterDataDraft = {
      findFirst: vi.fn().mockResolvedValue({ id: 'draft-1', status: 'ACTIVATED' }),
    };
    prismaMock.employeePayrollProfile = {
      findUnique: vi
        .fn()
        .mockResolvedValue({ readinessStatus: 'READY', approvalStatus: 'APPROVED' }),
    };
    prismaMock.benefitEnrollment = {
      findFirst: vi.fn().mockResolvedValue({ id: 'benefit-1', insuranceCardStatus: 'ISSUED' }),
    };
    prismaMock.socialInsuranceRegistration = {
      findFirst: vi.fn().mockResolvedValue({ id: 'social-1', status: 'REGISTERED' }),
    };
    prismaMock.probationTracking = {
      findFirst: vi.fn().mockResolvedValue({ id: 'probation-1' }),
    };
    prismaMock.auditLog = {
      create: vi.fn().mockResolvedValue({ id: 'audit-1' }),
    };
  });

  it('creates an onboarding case when an accepted offer event is consumed', async () => {
    const result = await onboardingCaseService.consumeOfferAccepted(
      {
        offerId: 'offer-1',
        candidateName: 'Sara Al Mansoori',
        candidateEmail: 'sara@example.com',
        countryCode: 'AE',
        legalEntityId: 'company-1',
        employmentType: 'FULL_TIME',
        targetJoinDate: new Date('2026-06-01T00:00:00.000Z'),
        onboardingInstanceId: 'inst-1',
      },
      { tenantId: 'tenant-1', userId: 'user-1' }
    );

    expect(result).toMatchObject({
      id: 'case-1',
      currentStage: 'PRE_JOINING',
      stageOwnerRole: 'HR_ADMIN',
      countryCode: 'AE',
      legalEntityId: 'company-1',
    });
    expect(prismaMock.onboardingStageHistory.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ fromStage: null, toStage: 'PRE_JOINING' }),
      })
    );
    expect(prismaMock.auditLog.create).toHaveBeenCalled();
  });

  it('blocks stage advancement when mandatory exit criteria are unmet', async () => {
    prismaMock.onboardingTask.count.mockResolvedValue(1);

    await expect(
      onboardingCaseService.advance('case-1', 'JOINING_DAY', 'try advance', {
        tenantId: 'tenant-1',
        userId: 'user-1',
        roles: ['HR_ADMIN'],
      })
    ).rejects.toThrow('Stage exit criteria are unmet');
    expect(prismaMock.onboardingCase.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ status: 'BLOCKED' }),
      })
    );
  });

  it('enforces stage-owner RBAC for advancement', async () => {
    await expect(
      onboardingCaseService.advance('case-1', 'JOINING_DAY', 'try advance', {
        tenantId: 'tenant-1',
        userId: 'user-1',
        roles: ['PAYROLL_OFFICER'],
      })
    ).rejects.toThrow('Only the stage owner role or HR Manager');
  });

  it('advances one stage with history and audit when blockers are clear', async () => {
    const result = await onboardingCaseService.advance('case-1', 'JOINING_DAY', 'Ready', {
      tenantId: 'tenant-1',
      userId: 'user-1',
      roles: ['HR_ADMIN'],
    });

    expect(result).toMatchObject({
      currentStage: 'JOINING_DAY',
      stageOwnerRole: 'HR_ADMIN',
      status: 'OPEN',
    });
    expect(prismaMock.onboardingStageHistory.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ fromStage: 'PRE_JOINING', toStage: 'JOINING_DAY' }),
      })
    );
    expect(prismaMock.auditLog.create).toHaveBeenCalled();
  });

  it('escalates cases with breached SLA timers', async () => {
    prismaMock.onboardingCase.findMany.mockResolvedValue([
      { ...baseCase, id: 'case-breach', slaDueAt: new Date('2026-05-01T00:00:00.000Z') },
    ]);

    const result = await onboardingCaseService.escalateBreachedCases(
      'tenant-1',
      'system-1',
      new Date('2026-06-01T00:00:00.000Z')
    );

    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({
      status: 'ESCALATED',
      escalatedToRole: 'HR_MANAGER',
    });
  });
});
