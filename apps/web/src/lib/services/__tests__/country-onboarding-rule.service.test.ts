import { beforeEach, describe, expect, it, vi } from 'vitest';
import { prisma } from '@aura/database';
import { countryOnboardingRuleService } from '../country-onboarding-rule.service';

const prismaMock = prisma as any;

const ksaRule = {
  id: 'rule-ksa-1',
  tenantId: 'tenant-1',
  countryCode: 'SA',
  ruleCode: 'SA_ONBOARDING',
  version: '2026.1',
  status: 'ACTIVE',
  effectiveFrom: new Date('2026-01-01T00:00:00.000Z'),
  effectiveTo: null,
  ruleSet: {
    countryCode: 'SA',
    authorityReferences: ['Qiwa', 'Muqeem', 'GOSI', 'Mudad', 'Nitaqat'],
    tasks: [
      {
        code: 'SA_QIWA_CONTRACT_AUTH',
        name: 'Qiwa contract authentication',
        description: 'Authenticate contract',
        category: 'compliance',
        phase: 'pre_joining',
        responsibleParty: 'HR Operations',
        priority: 'critical',
        mandatory: true,
        requiresApproval: true,
        blockingStage: 'activation',
        dueInDays: 3,
        documents: ['employment_contract'],
      },
      {
        code: 'SA_GOSI_REGISTRATION',
        name: 'GOSI registration trigger',
        description: 'Trigger GOSI',
        category: 'statutory',
        phase: 'activation',
        responsibleParty: 'Payroll Officer',
        priority: 'critical',
        mandatory: true,
        requiresApproval: true,
        blockingStage: 'activation',
        dueInDays: 15,
        downstreamTrigger: 'social_insurance',
      },
    ],
  },
};

describe('CountryOnboardingRuleService', () => {
  beforeEach(() => {
    prismaMock.countryOnboardingRule = {
      upsert: vi.fn().mockImplementation(async ({ create }: any) => ({ id: 'rule-1', ...create })),
      findMany: vi.fn().mockResolvedValue([ksaRule]),
      findFirst: vi.fn().mockResolvedValue(ksaRule),
    };
    prismaMock.employee = {
      findFirst: vi.fn().mockResolvedValue({
        id: 'emp-1',
        joiningDate: new Date('2026-06-01T00:00:00.000Z'),
      }),
    };
    prismaMock.employeeComplianceDetails = {
      findFirst: vi.fn().mockResolvedValue({ employeeId: 'emp-1', countryCode: 'SA' }),
    };
    prismaMock.onboardingInstance = {
      findFirst: vi.fn().mockResolvedValue(null),
      create: vi.fn().mockResolvedValue({
        id: 'inst-1',
        tenantId: 'tenant-1',
        employeeId: 'emp-1',
        status: 'not_started',
      }),
      update: vi.fn().mockImplementation(async ({ data }: any) => ({
        id: 'inst-1',
        employeeId: 'emp-1',
        status: 'not_started',
        ...data,
      })),
    };
    prismaMock.onboardingTask = {
      findFirst: vi.fn().mockResolvedValue(null),
      create: vi.fn().mockImplementation(async ({ data }: any) => ({
        id: `task-${data.ruleTaskCode}`,
        ...data,
      })),
      update: vi.fn(),
    };
    prismaMock.auditLog = {
      create: vi.fn().mockResolvedValue({ id: 'audit-1' }),
    };
  });

  it('seeds default GCC country rules', async () => {
    const rules = await countryOnboardingRuleService.ensureDefaultRules({
      tenantId: 'tenant-1',
      userId: 'user-1',
    });

    expect(rules).toHaveLength(6);
    expect(rules.map((rule) => rule.countryCode).sort()).toEqual(
      ['AE', 'SA', 'BH', 'OM', 'QA', 'KW'].sort()
    );
    expect(prismaMock.auditLog.create).toHaveBeenCalled();
  });

  it('instantiates KSA Qiwa and GOSI tasks and binds the rule version to the instance', async () => {
    const result = await countryOnboardingRuleService.instantiateForEmployee(
      { tenantId: 'tenant-1', userId: 'user-1' },
      'emp-1'
    );

    expect(result.instance).toMatchObject({
      id: 'inst-1',
      countryCode: 'SA',
      countryRuleId: 'rule-ksa-1',
      countryRuleVersion: '2026.1',
      totalTasks: 2,
    });
    expect(result.tasks.map((task) => task.ruleTaskCode)).toEqual([
      'SA_QIWA_CONTRACT_AUTH',
      'SA_GOSI_REGISTRATION',
    ]);
    expect(result.tasks[1]).toMatchObject({
      downstreamTrigger: 'social_insurance',
      blockingStage: 'activation',
    });
  });

  it('blocks activation while mandatory country tasks are pending', async () => {
    prismaMock.onboardingInstance.findFirst.mockResolvedValue({
      id: 'inst-1',
      tenantId: 'tenant-1',
      countryRuleVersion: '2026.1',
      tasks: [
        {
          id: 'task-1',
          taskName: 'Qiwa contract authentication',
          ruleTaskCode: 'SA_QIWA_CONTRACT_AUTH',
          isMandatory: true,
          blockingStage: 'activation',
          status: 'pending',
        },
      ],
    });

    const gate = await countryOnboardingRuleService.getActivationGate('tenant-1', 'inst-1');

    expect(gate.blocked).toBe(true);
    expect(gate.reasons).toEqual(['SA_QIWA_CONTRACT_AUTH: Qiwa contract authentication']);
    expect(gate.ruleVersion).toBe('2026.1');
  });
});
