import { prisma } from '@aura/database';
import type { Prisma } from '@prisma/client';

interface AuthContext {
  tenantId: string;
  userId: string;
}

interface RuleTask {
  code: string;
  name: string;
  description: string;
  category: string;
  phase: string;
  responsibleParty: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  mandatory: boolean;
  requiresApproval: boolean;
  blockingStage: string;
  dueInDays: number;
  documents?: string[];
  downstreamTrigger?: string;
}

interface CountryRuleSet {
  countryCode: string;
  authorityReferences: string[];
  tasks: RuleTask[];
}

const DEFAULT_GCC_RULES: Record<string, CountryRuleSet> = {
  AE: {
    countryCode: 'AE',
    authorityReferences: ['MOHRE', 'ICP', 'GPSSA', 'Emiratisation'],
    tasks: [
      {
        code: 'AE_MOHRE_WORK_PERMIT',
        name: 'MOHRE work permit activation',
        description: 'Capture and verify MOHRE work permit or labour card activation.',
        category: 'compliance',
        phase: 'activation',
        responsibleParty: 'HR Operations',
        priority: 'critical',
        mandatory: true,
        requiresApproval: true,
        blockingStage: 'activation',
        dueInDays: 3,
        documents: ['work_permit', 'labour_card'],
      },
      {
        code: 'AE_ICP_EMIRATES_ID',
        name: 'ICP Emirates ID linkage',
        description: 'Link Emirates ID and residence/visa identifiers to the employee record.',
        category: 'document',
        phase: 'joining',
        responsibleParty: 'HR Operations',
        priority: 'high',
        mandatory: true,
        requiresApproval: false,
        blockingStage: 'activation',
        dueInDays: 7,
        documents: ['emirates_id', 'residence_visa'],
      },
      {
        code: 'AE_EMIRATISATION_CLASSIFICATION',
        name: 'Emiratisation classification',
        description: 'Classify national/expat status and trigger national pension where required.',
        category: 'statutory',
        phase: 'activation',
        responsibleParty: 'Compliance Officer',
        priority: 'high',
        mandatory: true,
        requiresApproval: true,
        blockingStage: 'activation',
        dueInDays: 5,
        downstreamTrigger: 'social_insurance',
      },
    ],
  },
  SA: {
    countryCode: 'SA',
    authorityReferences: ['Qiwa', 'Muqeem', 'GOSI', 'Mudad', 'Nitaqat'],
    tasks: [
      {
        code: 'SA_QIWA_CONTRACT_AUTH',
        name: 'Qiwa contract authentication',
        description: 'Authenticate the employment contract in Qiwa before activation.',
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
        code: 'SA_IQAMA_LINKAGE',
        name: 'Iqama and Muqeem linkage',
        description: 'Capture Iqama or border number and link Muqeem residency information.',
        category: 'document',
        phase: 'joining',
        responsibleParty: 'HR Operations',
        priority: 'critical',
        mandatory: true,
        requiresApproval: false,
        blockingStage: 'activation',
        dueInDays: 7,
        documents: ['iqama', 'passport'],
      },
      {
        code: 'SA_GOSI_REGISTRATION',
        name: 'GOSI registration trigger',
        description: 'Trigger GOSI onboarding and Saudization classification.',
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
  BH: {
    countryCode: 'BH',
    authorityReferences: ['LMRA', 'CPR', 'SIO'],
    tasks: [
      {
        code: 'BH_LMRA_PERMIT',
        name: 'LMRA permit validation',
        description: 'Validate LMRA work permit and capture permit identifiers.',
        category: 'compliance',
        phase: 'activation',
        responsibleParty: 'HR Operations',
        priority: 'critical',
        mandatory: true,
        requiresApproval: true,
        blockingStage: 'activation',
        dueInDays: 7,
        documents: ['lmra_permit'],
      },
      {
        code: 'BH_CPR_SIO',
        name: 'CPR and SIO registration',
        description: 'Capture CPR and trigger SIO registration where applicable.',
        category: 'statutory',
        phase: 'activation',
        responsibleParty: 'Payroll Officer',
        priority: 'high',
        mandatory: true,
        requiresApproval: true,
        blockingStage: 'activation',
        dueInDays: 15,
        documents: ['cpr'],
        downstreamTrigger: 'social_insurance',
      },
    ],
  },
  QA: {
    countryCode: 'QA',
    authorityReferences: ['MOI', 'WPS'],
    tasks: [
      {
        code: 'QA_QID_LINKAGE',
        name: 'QID linkage',
        description: 'Capture Qatar ID and residence information.',
        category: 'document',
        phase: 'joining',
        responsibleParty: 'HR Operations',
        priority: 'critical',
        mandatory: true,
        requiresApproval: false,
        blockingStage: 'activation',
        dueInDays: 7,
        documents: ['qid'],
      },
      {
        code: 'QA_WPS_ENROLLMENT',
        name: 'Qatar WPS enrolment',
        description: 'Validate bank details and WPS enrolment readiness.',
        category: 'payroll',
        phase: 'activation',
        responsibleParty: 'Payroll Officer',
        priority: 'high',
        mandatory: true,
        requiresApproval: true,
        blockingStage: 'payroll_lock',
        dueInDays: 15,
        downstreamTrigger: 'payroll',
      },
    ],
  },
  OM: {
    countryCode: 'OM',
    authorityReferences: ['Royal Oman Police', 'PASI', 'SPF'],
    tasks: [
      {
        code: 'OM_RESIDENT_CARD',
        name: 'Resident card validation',
        description: 'Capture resident card and Oman residence identifiers.',
        category: 'document',
        phase: 'joining',
        responsibleParty: 'HR Operations',
        priority: 'high',
        mandatory: true,
        requiresApproval: false,
        blockingStage: 'activation',
        dueInDays: 7,
        documents: ['resident_card'],
      },
      {
        code: 'OM_PASI_PASS',
        name: 'PASI/PASS trigger',
        description: 'Trigger Oman social protection registration where applicable.',
        category: 'statutory',
        phase: 'activation',
        responsibleParty: 'Payroll Officer',
        priority: 'high',
        mandatory: true,
        requiresApproval: true,
        blockingStage: 'activation',
        dueInDays: 30,
        downstreamTrigger: 'social_insurance',
      },
    ],
  },
  KW: {
    countryCode: 'KW',
    authorityReferences: ['PAM', 'PIFSS'],
    tasks: [
      {
        code: 'KW_PAM_PERMIT',
        name: 'PAM permit validation',
        description: 'Validate Kuwait PAM work permit and residency details.',
        category: 'compliance',
        phase: 'activation',
        responsibleParty: 'HR Operations',
        priority: 'critical',
        mandatory: true,
        requiresApproval: true,
        blockingStage: 'activation',
        dueInDays: 7,
        documents: ['pam_work_permit', 'civil_id'],
      },
      {
        code: 'KW_PIFSS_TRIGGER',
        name: 'PIFSS registration trigger',
        description: 'Trigger PIFSS onboarding for Kuwaiti nationals where applicable.',
        category: 'statutory',
        phase: 'activation',
        responsibleParty: 'Payroll Officer',
        priority: 'high',
        mandatory: true,
        requiresApproval: true,
        blockingStage: 'activation',
        dueInDays: 30,
        downstreamTrigger: 'social_insurance',
      },
    ],
  },
};

function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setUTCDate(next.getUTCDate() + days);
  return next;
}

export class CountryOnboardingRuleService {
  async ensureDefaultRules(auth: AuthContext) {
    const createdOrUpdated = [];
    for (const [countryCode, ruleSet] of Object.entries(DEFAULT_GCC_RULES)) {
      const row = await (prisma as any).countryOnboardingRule.upsert({
        where: {
          tenantId_countryCode_version: {
            tenantId: auth.tenantId,
            countryCode,
            version: '2026.1',
          },
        },
        create: {
          tenantId: auth.tenantId,
          countryCode,
          ruleCode: `${countryCode}_ONBOARDING`,
          version: '2026.1',
          status: 'ACTIVE',
          ruleSet: ruleSet as unknown as Prisma.InputJsonValue,
          createdBy: auth.userId,
          updatedBy: auth.userId,
        },
        update: {
          status: 'ACTIVE',
          ruleSet: ruleSet as unknown as Prisma.InputJsonValue,
          updatedBy: auth.userId,
        },
      });
      createdOrUpdated.push(row);
    }
    await this.audit(auth, 'UPSERT_DEFAULTS', 'country_onboarding_rule', null, createdOrUpdated);
    return createdOrUpdated.map((row) => this.toRuleDto(row));
  }

  async listRules(tenantId: string, countryCode?: string) {
    const rows = await (prisma as any).countryOnboardingRule.findMany({
      where: {
        tenantId,
        isDeleted: false,
        ...(countryCode ? { countryCode: countryCode.toUpperCase() } : {}),
      },
      orderBy: [{ countryCode: 'asc' }, { effectiveFrom: 'desc' }],
    });
    return rows.map((row: any) => this.toRuleDto(row));
  }

  async resolveRule(tenantId: string, countryCode: string, asOf = new Date()) {
    const rule = await (prisma as any).countryOnboardingRule.findFirst({
      where: {
        tenantId,
        countryCode: countryCode.toUpperCase(),
        status: 'ACTIVE',
        isDeleted: false,
        effectiveFrom: { lte: asOf },
        OR: [{ effectiveTo: null }, { effectiveTo: { gte: asOf } }],
      },
      orderBy: [{ effectiveFrom: 'desc' }, { version: 'desc' }],
    });

    if (rule) return rule;
    const fallback = DEFAULT_GCC_RULES[countryCode.toUpperCase()];
    if (!fallback) {
      throw new Error(`No onboarding country rule configured for ${countryCode}`);
    }
    return {
      id: null,
      tenantId,
      countryCode: countryCode.toUpperCase(),
      ruleCode: `${countryCode.toUpperCase()}_ONBOARDING`,
      version: '2026.1-fallback',
      ruleSet: fallback,
    };
  }

  async instantiateForEmployee(
    auth: AuthContext,
    employeeId: string,
    onboardingInstanceId?: string
  ) {
    const employee = await this.loadEmployee(auth.tenantId, employeeId);
    const compliance = await prisma.employeeComplianceDetails.findFirst({
      where: { tenantId: auth.tenantId, employeeId },
    });
    if (!compliance) {
      throw new Error('Employee compliance details are required before country rule binding');
    }

    const rule = await this.resolveRule(
      auth.tenantId,
      compliance.countryCode,
      employee.joiningDate
    );
    const ruleSet = rule.ruleSet as CountryRuleSet;
    const instance = onboardingInstanceId
      ? await this.loadInstance(auth.tenantId, onboardingInstanceId)
      : await this.findOrCreateInstance(auth, employeeId, employee.joiningDate);

    const updatedInstance = await (prisma as any).onboardingInstance.update({
      where: { id: instance.id },
      data: {
        countryCode: compliance.countryCode.toUpperCase(),
        countryRuleId: rule.id,
        countryRuleVersion: rule.version,
        countryRuleSnapshot: ruleSet as unknown as Prisma.InputJsonValue,
        totalTasks: ruleSet.tasks.length,
        updatedAt: new Date(),
      },
    });

    const tasks = [];
    for (const task of ruleSet.tasks) {
      const existing = await (prisma as any).onboardingTask.findFirst({
        where: { instanceId: instance.id, ruleTaskCode: task.code },
      });
      const data = {
        taskName: task.name,
        description: task.description,
        category: task.category,
        phase: task.phase,
        responsibleParty: task.responsibleParty,
        priority: task.priority,
        isMandatory: task.mandatory,
        requiresApproval: task.requiresApproval,
        ruleTaskCode: task.code,
        documentRequirements: (task.documents ?? []) as unknown as Prisma.InputJsonValue,
        downstreamTrigger: task.downstreamTrigger ?? null,
        blockingStage: task.blockingStage,
        dueDate: addDays(employee.joiningDate, task.dueInDays),
      };
      const row = existing
        ? await (prisma as any).onboardingTask.update({ where: { id: existing.id }, data })
        : await (prisma as any).onboardingTask.create({
            data: {
              instanceId: instance.id,
              status: 'pending',
              ...data,
            },
          });
      tasks.push(row);
    }

    await this.audit(auth, 'INSTANTIATE', updatedInstance.id, null, {
      instance: updatedInstance,
      tasks,
    });

    return {
      instance: this.toInstanceDto(updatedInstance),
      tasks: tasks.map((task) => this.toTaskDto(task)),
      rule: this.toRuleDto(rule),
    };
  }

  async getActivationGate(tenantId: string, onboardingInstanceId: string) {
    const instance = await (prisma as any).onboardingInstance.findFirst({
      where: { id: onboardingInstanceId, tenantId },
      include: { tasks: true },
    });
    if (!instance) {
      throw new Error('Onboarding instance not found');
    }
    const blocking = instance.tasks.filter(
      (task: any) =>
        task.isMandatory &&
        task.blockingStage === 'activation' &&
        !['completed', 'approved'].includes(task.status)
    );
    return {
      onboardingInstanceId,
      blocked: blocking.length > 0,
      reasons: blocking.map((task: any) => `${task.ruleTaskCode ?? task.id}: ${task.taskName}`),
      ruleVersion: instance.countryRuleVersion,
    };
  }

  private async loadEmployee(tenantId: string, employeeId: string) {
    const employee = await prisma.employee.findFirst({
      where: { id: employeeId, isDeleted: false, company: { tenantId } },
      select: { id: true, joiningDate: true },
    });
    if (!employee) {
      throw new Error('Employee not found for tenant');
    }
    return employee;
  }

  private async loadInstance(tenantId: string, id: string) {
    const instance = await (prisma as any).onboardingInstance.findFirst({
      where: { id, tenantId },
    });
    if (!instance) {
      throw new Error('Onboarding instance not found for tenant');
    }
    return instance;
  }

  private async findOrCreateInstance(auth: AuthContext, employeeId: string, hireDate: Date) {
    const existing = await (prisma as any).onboardingInstance.findFirst({
      where: { tenantId: auth.tenantId, employeeId, status: { not: 'completed' } },
      orderBy: { createdAt: 'desc' },
    });
    if (existing) return existing;
    return (prisma as any).onboardingInstance.create({
      data: {
        tenantId: auth.tenantId,
        employeeId,
        status: 'not_started',
        hireDate,
        startDate: new Date(),
        createdBy: auth.userId,
      },
    });
  }

  private async audit(
    auth: AuthContext,
    action: string,
    resourceId: string,
    beforeValues: unknown,
    afterValues: unknown
  ) {
    await prisma.auditLog.create({
      data: {
        tenantId: auth.tenantId,
        userId: auth.userId,
        action: action as any,
        resourceType: 'country_onboarding_rule',
        resourceId,
        module: 'onboarding',
        beforeValues: beforeValues as Prisma.InputJsonValue,
        afterValues: afterValues as Prisma.InputJsonValue,
        metadata: {
          story: 'EPIC-06-S06',
          event: 'country_onboarding_rule_engine',
        },
      },
    });
  }

  private toRuleDto(row: any) {
    return {
      id: row.id,
      countryCode: row.countryCode,
      ruleCode: row.ruleCode,
      version: row.version,
      status: row.status,
      effectiveFrom: row.effectiveFrom,
      effectiveTo: row.effectiveTo,
      ruleSet: row.ruleSet,
    };
  }

  private toInstanceDto(row: any) {
    return {
      id: row.id,
      employeeId: row.employeeId,
      status: row.status,
      countryCode: row.countryCode,
      countryRuleId: row.countryRuleId,
      countryRuleVersion: row.countryRuleVersion,
      totalTasks: row.totalTasks,
    };
  }

  private toTaskDto(row: any) {
    return {
      id: row.id,
      taskName: row.taskName,
      category: row.category,
      phase: row.phase,
      status: row.status,
      isMandatory: row.isMandatory,
      requiresApproval: row.requiresApproval,
      ruleTaskCode: row.ruleTaskCode,
      documentRequirements: row.documentRequirements,
      downstreamTrigger: row.downstreamTrigger,
      blockingStage: row.blockingStage,
      dueDate: row.dueDate,
    };
  }
}

export const countryOnboardingRuleService = new CountryOnboardingRuleService();
